import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Banner } from '../models/Banner.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';
import { get100Products } from './productsData.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eshop';

async function seedDatabase() {
  // Production Safety Guard (P1-12)
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('\n🚨 [SAFETY GUARD] Refusing to run destructive seed in production!');
    console.error('If you genuinely intend to reset the production database, pass the explicit --force flag:');
    console.error('   node src/seeds/seed.js --force\n');
    process.exit(1);
  }

  try {
    const sanitizedUri = uri.replace(/\/\/(.*?)@/, '//***:***@');
    await mongoose.connect(uri);
    console.log(`🌱 Connected to MongoDB for seeding: ${sanitizedUri}`);

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Coupon.deleteMany({});
    await Notification.deleteMany({});

    console.log('🧹 Purged existing collections.');

    // 1. Create Admin User & Demo Customer from environment or secure generator (P0-2)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@eshop.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@' + crypto.randomInt(10000, 99999);
    const customerPassword = process.env.CUSTOMER_PASSWORD || 'Customer@' + crypto.randomInt(10000, 99999);

    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, adminSalt);
    const customerPasswordHash = await bcrypt.hash(customerPassword, adminSalt);

    const admin = await User.create({
      name: 'Super Admin',
      username: process.env.ADMIN_USERNAME || 'admin',
      email: adminEmail,
      phone: process.env.ADMIN_PHONE || '9876543210',
      passwordHash: adminPasswordHash,
      role: 'admin',
      avatar: 'avatar-cyberpunk',
      emailVerified: true,
      phoneVerified: true,
      defaultPincode: '560001'
    });

    const demoUser = await User.create({
      name: 'Riya Sharma',
      username: 'riya_sharma',
      email: 'customer@eshop.com',
      phone: '9876543211',
      passwordHash: customerPasswordHash,
      role: 'customer',
      avatar: 'avatar-ninja',
      emailVerified: true,
      phoneVerified: true,
      defaultPincode: '560035',
      addresses: [
        {
          fullName: 'Riya Sharma',
          phone: '9876543211',
          line1: 'Flat 402, Green Glen Layout, Bellandur',
          line2: 'Near Sarjapur Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560035',
          isDefault: true
        }
      ]
    });

    console.log('👤 Users seeded: admin@eshop.com and customer@eshop.com');

    // 2. Categories
    const categoriesData = [
      {
        name: 'Mobiles & Tablets',
        slug: 'mobiles',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
        description: 'Latest 5G smartphones and tablets from Apple, Samsung, and OnePlus',
        discountTag: 'Up to 35% Off',
        displayOrder: 1
      },
      {
        name: 'Laptops & Computers',
        slug: 'laptops',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
        description: 'High performance gaming, creator, and student laptops',
        discountTag: 'Flat 20% Off',
        displayOrder: 2
      },
      {
        name: 'Audio & Sound',
        slug: 'audio',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        description: 'Noise canceling headphones, wireless earbuds, and portable speakers',
        discountTag: 'Up to 50% Off',
        displayOrder: 3
      },
      {
        name: 'Smart Watches',
        slug: 'watches',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        description: 'Fitness trackers, AMOLED smartwatches, and luxury timepieces',
        discountTag: 'Up to 45% Off',
        displayOrder: 4
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion',
        imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
        description: 'Trendsetting streetwear, casuals, and sneakers',
        discountTag: 'Up to 60% Off',
        displayOrder: 5
      },
      {
        name: 'Home & Living',
        slug: 'home',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        description: 'Smart lighting, minimalist home decor, and desk setup accessories',
        discountTag: 'Min 30% Off',
        displayOrder: 6
      }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`📦 Seeded ${categories.length} categories.`);

    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    // 3. Auto-Swiping Hero Carousel Banners
    const bannersData = [
      {
        title: 'Mega Electronics Festival',
        subtitle: 'Unbeatable deals on top tech with instant bank discounts',
        discountTag: 'UP TO 50% OFF',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
        targetSlug: 'laptops',
        displayOrder: 1,
        active: true
      },
      {
        title: 'Flagship Smartphone Carnival',
        subtitle: 'Experience lightning fast 5G and cinema-grade cameras',
        discountTag: 'FLAT 30% OFF',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1600&auto=format&fit=crop&q=80',
        targetSlug: 'mobiles',
        displayOrder: 2,
        active: true
      },
      {
        title: 'Studio Sound & Noise Cancellation',
        subtitle: 'Immerse yourself in crystal clear high-fidelity acoustics',
        discountTag: 'EXTRA 15% OFF',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80',
        targetSlug: 'audio',
        displayOrder: 3,
        active: true
      },
      {
        title: 'Smart Wearables & Health Tech',
        subtitle: 'Track your fitness goals with all-day battery life and ECG monitors',
        discountTag: 'STARTING AT ₹2,499',
        imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1600&auto=format&fit=crop&q=80',
        targetSlug: 'watches',
        displayOrder: 4,
        active: true
      }
    ];

    await Banner.insertMany(bannersData);
    console.log('🖼️ Seeded hero carousel discount banners.');

    // 4. Products (100 premium products accurately categorized)
    const productsData = get100Products(catMap);

    const products = await Product.insertMany(productsData);
    console.log(`🛍️ Seeded ${products.length} catalog products.`);

    // 5. Promo Coupons
    const couponsData = [
      {
        code: 'SAVE10',
        discountPercentage: 10,
        minOrderValue: 999,
        maxDiscountAmount: 1000,
        usageLimit: 500,
        usedCount: 12,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        active: true
      },
      {
        code: 'MEGA20',
        discountPercentage: 20,
        minOrderValue: 2999,
        maxDiscountAmount: 3000,
        usageLimit: 200,
        usedCount: 45,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        active: true
      },
      {
        code: 'WELCOME50',
        discountPercentage: 50,
        minOrderValue: 499,
        maxDiscountAmount: 500,
        usageLimit: 100,
        usedCount: 8,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        active: true
      }
    ];

    await Coupon.insertMany(couponsData);
    console.log('🎟️ Seeded promo discount coupons.');

    // 6. Broadcast Notifications
    const notificationsData = [
      {
        title: '⚡ Mega Electronics Sale Live Now!',
        message: 'Get flat 20% off on premium laptops and noise-canceling headphones with code MEGA20.',
        targetUrl: '/products?category=laptops',
        dealTag: 'MEGA DEAL',
        createdBy: admin._id
      },
      {
        title: '🚚 Zero-Delivery Fee Active for Bengaluru (560035)!',
        message: 'Order before 2 PM and get next-day delivery right to your doorstep for PIN 560035.',
        targetUrl: '/products',
        dealTag: 'FAST DELIVERY',
        createdBy: admin._id
      },
      {
        title: '🎉 Welcome to E-Shop Next-Gen Commerce',
        message: 'Chat with our AI Shopping Concierge at the bottom of the screen to find your perfect products!',
        targetUrl: '/products',
        dealTag: 'AI ASSISTANT',
        createdBy: admin._id
      }
    ];

    await Notification.insertMany(notificationsData);
    console.log('🔔 Seeded deal broadcast notifications.');

    console.log('\n======================================================');
    console.log('🎉 E-SHOP DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`👑 Admin Login:    ${adminEmail} / ${adminPassword}`);
    console.log(`🛍️ Customer Login: customer@eshop.com / ${customerPassword}`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();
