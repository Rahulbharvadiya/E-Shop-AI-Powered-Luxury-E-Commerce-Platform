import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const uri = env.MONGODB_URI;
    await mongoose.connect(uri);

    // Sanitize URI for safe logging (redact credentials)
    const sanitizedUri = uri.replace(/\/\/(.*?)@/, '//***:***@');
    console.log(`✅ MongoDB Connected successfully to: ${sanitizedUri}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

