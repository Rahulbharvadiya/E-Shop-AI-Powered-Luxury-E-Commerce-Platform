import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const uri = env.MONGODB_URI;
    await mongoose.connect(uri);

    // Safe host logging without leaking URI parameters or credentials (P1-10)
    const host = mongoose.connection.host || 'MongoDB Atlas Cluster';
    console.log(`✅ MongoDB Connected successfully to host: ${host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

