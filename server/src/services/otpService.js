import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Otp } from '../models/Otp.js';

export async function generateAndSendOTP(target, purpose = 'register') {
  // Generate 6-digit numeric OTP
  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP in DB
  await Otp.deleteMany({ target, purpose });
  await Otp.create({
    target,
    purpose,
    code,
    attempts: 0,
    expiresAt
  });

  // Check if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM || '"E-Shop" <no-reply@eshop.com>',
        to: target,
        subject: `E-Shop: Your Verification Code is ${code}`,
        text: `Your E-Shop verification code is ${code}. Valid for 10 minutes. Do not share this code with anyone.`,
        html: `<div style="font-family:sans-serif;padding:20px;color:#0F172A;">
          <h2 style="color:#4F46E5;">E-Shop Verification</h2>
          <p>Your one-time verification code is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#0F172A;padding:12px;background:#F1F5F9;display:inline-block;border-radius:8px;">${code}</div>
          <p style="color:#64748B;font-size:12px;margin-top:20px;">Valid for 10 minutes. If you did not request this, please ignore.</p>
        </div>`
      });
      console.log(`✉️ [OTP Sent via Email] To: ${target}`);
    } catch (err) {
      console.warn(`⚠️ SMTP send failed, falling back to console log: ${err.message}`);
    }
  }

  // Always log to server console for non-blocking local dev and testing
  console.log(`\n======================================================`);
  console.log(`🔐 [E-SHOP OTP GENERATED]`);
  console.log(`🎯 Target:   ${target}`);
  console.log(`🔑 Purpose:  ${purpose}`);
  console.log(`⚡ OTP Code: ${code}`);
  console.log(`⏱️ Expires:  10 Minutes`);
  console.log(`======================================================\n`);

  return { success: true, message: 'OTP sent successfully', target };
}

export async function verifyOTP(target, code, purpose = 'register') {
  const record = await Otp.findOne({ target, purpose });
  if (!record) {
    return { valid: false, message: 'OTP has expired or does not exist. Please request a new code.' };
  }

  if (record.attempts >= 5) {
    await Otp.deleteOne({ _id: record._id });
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
  }

  if (record.code !== String(code).trim()) {
    record.attempts += 1;
    await record.save();
    return { valid: false, message: `Invalid OTP code. Attempts remaining: ${5 - record.attempts}` };
  }

  // OTP verified successfully -> cleanup
  await Otp.deleteOne({ _id: record._id });
  return { valid: true };
}
