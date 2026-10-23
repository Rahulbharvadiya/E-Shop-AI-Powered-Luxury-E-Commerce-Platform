import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

export async function connectTestDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.MONGODB_URI);
  // Wait until connection is fully established
  while (mongoose.connection.readyState !== 1) {
    await new Promise(r => setTimeout(r, 50));
  }
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
  }
}
