import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
  }

  // Mongoose Schema Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = `Validation failed: ${errors.join(', ')}`;
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please login again.';
  }

  // Log error on server with request ID if available
  const reqId = req.id || req.headers['x-request-id'] || 'no-req-id';
  if (statusCode >= 500) {
    console.error(`💥 [Error ${reqId}][${req.method} ${req.url}]:`, err);
  } else if (env.NODE_ENV === 'development') {
    console.warn(`⚠️ [Warning ${reqId}][${req.method} ${req.url}] (${statusCode}): ${message}`);
  }

  // Sanitize message in production for unhandled internal errors
  const clientMessage = (statusCode >= 500 && env.NODE_ENV === 'production')
    ? 'An unexpected internal server error occurred.'
    : message;

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    requestId: reqId,
    ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
  });
};
