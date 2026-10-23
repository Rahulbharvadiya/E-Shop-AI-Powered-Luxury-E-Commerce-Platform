import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Otp } from '../models/Otp.js';
import { env } from '../config/env.js';

function hashOtp(target, code) {
  return crypto.createHmac('sha256', env.JWT_ACCESS_SECRET)
    .update(`${target}:${String(code).trim()}`)
    .digest('hex');
}

export async function generateAndSendOTP(target, purpose = 'register') {
  // Generate 6-digit numeric OTP
  const rawCode = String(crypto.randomInt(100000, 999999));
  const hashedCode = hashOtp(target, rawCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP in DB with hashed code
  await Otp.deleteMany({ target, purpose });
  await Otp.create({
    target,
    purpose,
    code: hashedCode,
    attempts: 0,
    expiresAt
  });

  // Check if SMTP is configured
  if (env.SMTP_USER && env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: env.MAIL_FROM || '"E-Shop" <no-reply@eshop.com>',
        to: target,
        subject: `E-Shop: Your Verification Code is ${rawCode}`,
        text: `Your E-Shop verification code is ${rawCode}. Valid for 10 minutes. Do not share this code with anyone.`,
        html: `<div style="font-family:sans-serif;padding:20px;color:#0F172A;">
          <h2 style="color:#4F46E5;">E-Shop Verification</h2>
          <p>Your one-time verification code is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#0F172A;padding:12px;background:#F1F5F9;display:inline-block;border-radius:8px;">${rawCode}</div>
          <p style="color:#64748B;font-size:12px;margin-top:20px;">Valid for 10 minutes. If you did not request this, please ignore.</p>
        </div>`
      });
      console.log(`✉️ [OTP Sent via Email] To: ${target}`);
    } catch (err) {
      console.warn(`⚠️ SMTP send failed: ${err.message}`);
    }
  }

  // Only log to console in local development environment
  if (env.NODE_ENV === 'development') {
    console.log(`\n======================================================`);
    console.log(`🔐 [E-SHOP DEV OTP GENERATED]`);
    console.log(`🎯 Target:   ${target}`);
    console.log(`🔑 Purpose:  ${purpose}`);
    console.log(`⚡ OTP Code: ${rawCode} (Hashed in DB)`);
    console.log(`⏱️ Expires:  10 Minutes`);
    console.log(`======================================================\n`);
  }

  return { success: true, message: 'OTP sent successfully', target };
}

export async function verifyOTP(target, candidateCode, purpose = 'register') {
  if (!candidateCode) {
    return { valid: false, message: 'OTP code is required.' };
  }

  // Atomically increment attempt count to prevent parallel race conditions
  const record = await Otp.findOneAndUpdate(
    { target, purpose },
    { $inc: { attempts: 1 } },
    { new: true }
  );

  if (!record) {
    return { valid: false, message: 'OTP has expired or does not exist. Please request a new code.' };
  }

  if (record.attempts > 5) {
    await Otp.deleteOne({ _id: record._id });
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
  }

  const expectedHash = record.code;
  const candidateHash = hashOtp(target, candidateCode);

  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const candidateBuffer = Buffer.from(candidateHash, 'hex');

  let match = false;
  if (expectedBuffer.length === candidateBuffer.length) {
    match = crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
  }

  if (!match) {
    const remaining = Math.max(0, 5 - record.attempts);
    return { valid: false, message: `Invalid OTP code. Attempts remaining: ${remaining}` };
  }

  // OTP verified successfully -> cleanup
  await Otp.deleteOne({ _id: record._id });
  return { valid: true };
}
