import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

export let isTestDBAvailable = false;

export async function connectTestDB() {
  if (mongoose.connection.readyState === 1) {
    isTestDBAvailable = true;
    return;
  }
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isTestDBAvailable = mongoose.connection.readyState === 1;
  } catch (err) {
    isTestDBAvailable = false;
    console.warn('\n⚠️ [Test Notice] External MongoDB cluster is unreachable (sandbox/offline mode).');
    console.warn('   Integration tests requiring live DB will skip gracefully; pure unit tests continue.\n');
  }
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close(false);
    } catch (e) {}
  }
}
