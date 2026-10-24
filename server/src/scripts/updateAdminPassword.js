import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in server/.env');
  process.exit(1);
}

const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD;
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eshop.com').trim().toLowerCase();
const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();

if (!newPassword) {
  console.error('❌ No password provided.');
  console.error('Usage: node src/scripts/updateAdminPassword.js [optional_password]');
  console.error('Or set ADMIN_PASSWORD in your server/.env file.');
  process.exit(1);
}

async function updateAdminPassword() {
  try {
    const sanitizedUri = uri.replace(/\/\/(.*?)@/, '//***:***@');
    console.log(`🔌 Connecting to MongoDB Atlas: ${sanitizedUri}...`);
    await mongoose.connect(uri);

    // Find admin user by email, username, or role: 'admin'
    let admin = await User.findOne({
      $or: [
        { email: adminEmail },
        { username: adminUsername },
        { role: 'admin' }
      ]
    });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    if (admin) {
      admin.passwordHash = passwordHash;
      admin.role = 'admin';
      admin.status = 'active';
      admin.tokenVersion = (admin.tokenVersion || 0) + 1; // Invalidate any prior sessions
      if (process.env.ADMIN_USERNAME) admin.username = adminUsername;
      if (process.env.ADMIN_EMAIL) admin.email = adminEmail;
      if (process.env.ADMIN_PHONE) admin.phone = process.env.ADMIN_PHONE;
      await admin.save();

      console.log('✅ Admin password updated successfully in MongoDB Atlas!');
      console.log(`👤 Username: ${admin.username}`);
      console.log(`📧 Email:    ${admin.email}`);
      console.log(`🔑 Role:     ${admin.role}`);
    } else {
      console.log('ℹ️ No existing admin found. Creating a new admin user...');
      admin = await User.create({
        name: 'Super Admin',
        username: adminUsername,
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '9876543210',
        passwordHash,
        role: 'admin',
        avatar: 'avatar-cyberpunk',
        emailVerified: true,
        phoneVerified: true,
        status: 'active',
        defaultPincode: '560001'
      });

      console.log('✅ Admin user created successfully in MongoDB Atlas!');
      console.log(`👤 Username: ${admin.username}`);
      console.log(`📧 Email:    ${admin.email}`);
    }

    await mongoose.disconnect();
    console.log('🚪 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update admin password:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

updateAdminPassword();
