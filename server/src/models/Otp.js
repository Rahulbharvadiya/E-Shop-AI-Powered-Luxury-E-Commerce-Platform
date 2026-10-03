import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  target: { type: String, required: true }, // email or phone
  purpose: { type: String, enum: ['register', 'login', 'reset'], default: 'register' },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 600 } // 10 minutes TTL
}, { timestamps: true });

otpSchema.index({ target: 1, purpose: 1 });

export const Otp = mongoose.model('Otp', otpSchema);
