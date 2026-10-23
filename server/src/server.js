import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS and Handshake Authentication (P1-11)
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

// Socket.IO Handshake Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded;
    }
  } catch (err) {
    // Unauthenticated guest sockets are permitted for public deal notifications
  }
  next();
});

io.on('connection', (socket) => {
  if (socket.user) {
    // Join private room scoped strictly to this authenticated user (P1-11)
    socket.join(`user_${socket.user.id}`);
  }

  socket.on('disconnect', () => {});
});

// Security Headers (P0-8)
app.use(helmet({
  contentSecurityPolicy: false, // Permit modern SPA inline styles and external media assets
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Body Parsing with Request Size Limits (P0-8)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// NoSQL Operator Injection Sanitization (P1-9)
app.use(mongoSanitize());

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Abuse Protection & Rate Limiting (P0-8)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this client. Please retry after 15 minutes.' }
});
app.use('/api', globalApiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI Concierge rate limit reached. Please wait a moment.' }
});
app.use('/api/ai/chat', aiChatLimiter);

// Robust Operational Health Check checking MongoDB Connection (P2-9)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', reviewRoutes);
app.use('/api', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Serve static client assets in production
const clientDistPath = fs.existsSync(path.resolve('client/dist'))
  ? path.resolve('client/dist')
  : path.resolve(__dirname, '../../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Central Error Handler Middleware (P1-8)
app.use(errorHandler);

// Connect DB & Start Server
const PORT = env.PORT;

if (process.env.NODE_ENV !== 'test' && !process.argv.some(arg => arg.includes('test'))) {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 [E-Shop Server] Running on http://localhost:${PORT} in ${env.NODE_ENV} mode`);
      console.log(`📡 [Socket.IO] Authenticated WebSocket server active`);
    });
  });
}

// Graceful Process Termination (P2-9)
const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 [Server] Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('🚪 [HTTP Server] Stopped accepting new connections.');

    io.close(() => {
      console.log('🔌 [Socket.IO] Disconnected active sockets.');
    });

    try {
      await mongoose.connection.close(false);
      console.log('🗄️ [MongoDB] Connection closed safely.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('⚠️ [Server] Forceful shutdown triggered after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export { app, server };
