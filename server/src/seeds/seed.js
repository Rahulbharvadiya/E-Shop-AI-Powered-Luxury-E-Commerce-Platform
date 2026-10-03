import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Banner } from '../models/Banner.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eshop';

async function seedDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Coupon.deleteMany({});
    await Notification.deleteMany({});

    console.log('🧹 Purged existing collections.');

    // 1. Create Admin User & Demo Customer
    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('AdminPassword@123', adminSalt);
    const customerPasswordHash = await bcrypt.hash('Customer@123', adminSalt);

    const admin = await User.create({
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@eshop.com',
      phone: '9876543210',
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

    // 4. Products (24 rich products across categories)
    const productsData = [
      // Mobiles
      {
        name: 'iPhone 15 Pro Max (256 GB) - Natural Titanium',
        slug: 'iphone-15-pro-max-256gb',
        description: 'iPhone 15 Pro Max forged in aerospace-grade titanium, featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
        shortInfo: 'A17 Pro Chip, 48MP Triple Camera, 6.7-inch Super Retina XDR',
        brand: 'Apple',
        categoryId: catMap['mobiles'],
        categorySlug: 'mobiles',
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 159900,
        discountedPrice: 139900,
        discountPercent: 13,
        stockQuantity: 15,
        ratingAverage: 4.8,
        reviewCount: 342,
        isFeatured: true,
        specs: { 'Display': '6.7 inch OLED 120Hz', 'Processor': 'Apple A17 Pro', 'Storage': '256GB', 'RAM': '8GB' }
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB)',
        slug: 'samsung-galaxy-s24-ultra-5g',
        description: 'Welcome to the era of mobile AI with Galaxy AI. Circle to Search with Google, real-time Live Translate, and stunning 200MP detail camera with 100x Space Zoom.',
        shortInfo: 'Galaxy AI, 200MP Camera, S-Pen Included, Snapdragon 8 Gen 3',
        brand: 'Samsung',
        categoryId: catMap['mobiles'],
        categorySlug: 'mobiles',
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 134999,
        discountedPrice: 119999,
        discountPercent: 11,
        stockQuantity: 18,
        ratingAverage: 4.7,
        reviewCount: 215,
        isFeatured: true,
        specs: { 'Display': '6.8 inch Dynamic AMOLED 2X', 'Processor': 'Snapdragon 8 Gen 3', 'Storage': '256GB', 'Battery': '5000 mAh' }
      },
      {
        name: 'OnePlus 12 5G (Silky Black, 16GB RAM, 512GB Storage)',
        slug: 'oneplus-12-5g-silky-black',
        description: 'Elite 4th Gen Hasselblad Camera System, 5400 mAh Battery with 100W SUPERVOOC charging, and 2K 120Hz ProXDR Display.',
        shortInfo: '100W Fast Charging, 16GB RAM, Hasselblad Camera, Snapdragon 8 Gen 3',
        brand: 'OnePlus',
        categoryId: catMap['mobiles'],
        categorySlug: 'mobiles',
        images: [
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 69999,
        discountedPrice: 59999,
        discountPercent: 14,
        stockQuantity: 25,
        ratingAverage: 4.6,
        reviewCount: 180,
        isFeatured: false,
        specs: { 'Display': '6.82 inch 2K 120Hz', 'Charging': '100W Wired + 50W Wireless', 'RAM': '16GB' }
      },
      {
        name: 'Google Pixel 8 Pro (Bay Blue, 128GB)',
        slug: 'google-pixel-8-pro-bay',
        description: 'Engineered by Google, Pixel 8 Pro with Google Tensor G3 brings cutting-edge AI for unbelievable photos, Magic Audio Eraser, and Best Take.',
        shortInfo: 'Google Tensor G3, Best-in-class Computational Photography',
        brand: 'Google',
        categoryId: catMap['mobiles'],
        categorySlug: 'mobiles',
        images: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 106999,
        discountedPrice: 84999,
        discountPercent: 21,
        stockQuantity: 12,
        ratingAverage: 4.5,
        reviewCount: 95,
        isFeatured: true,
        specs: { 'Camera': '50MP + 48MP + 48MP', 'OS': 'Android 14 Clean', 'RAM': '12GB' }
      },

      // Laptops
      {
        name: 'MacBook Air 15-inch M3 Chip (16GB Unified Memory, 512GB SSD)',
        slug: 'macbook-air-15-m3-16gb',
        description: 'Impossibly thin and blazingly fast. With up to 18 hours of battery life and a stunning Liquid Retina display, MacBook Air M3 breezes through work and play.',
        shortInfo: 'Apple M3 Chip, 18hr Battery, 15.3-inch Liquid Retina Display',
        brand: 'Apple',
        categoryId: catMap['laptops'],
        categorySlug: 'laptops',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 154900,
        discountedPrice: 134900,
        discountPercent: 13,
        stockQuantity: 20,
        ratingAverage: 4.9,
        reviewCount: 140,
        isFeatured: true,
        specs: { 'CPU': 'Apple M3 8-Core', 'GPU': '10-Core', 'Memory': '16GB', 'Weight': '1.51 kg' }
      },
      {
        name: 'Dell XPS 16 OLED Laptop (Intel Core Ultra 9, 32GB RAM, RTX 4070)',
        slug: 'dell-xps-16-oled-intel-ultra9',
        description: 'Unmatched performance with Intel Core Ultra 9 processor, NVIDIA GeForce RTX 4070 GPU, and touch-enabled 4K OLED InfinityEdge screen.',
        shortInfo: '4K Touch OLED, Intel Core Ultra 9, RTX 4070, 32GB RAM',
        brand: 'Dell',
        categoryId: catMap['laptops'],
        categorySlug: 'laptops',
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 289990,
        discountedPrice: 249990,
        discountPercent: 14,
        stockQuantity: 8,
        ratingAverage: 4.7,
        reviewCount: 65,
        isFeatured: true,
        specs: { 'Screen': '16.3-inch 4K OLED', 'Graphics': 'NVIDIA RTX 4070 8GB', 'Storage': '1TB NVMe' }
      },
      {
        name: 'ASUS ROG Zephyrus G16 Gaming Laptop (Intel Core i9, 16GB, RTX 4060)',
        slug: 'asus-rog-zephyrus-g16-gaming',
        description: 'Sleek CNC aluminum chassis with 2.5K 240Hz ROG Nebula OLED display and high-velocity thermal cooling.',
        shortInfo: '240Hz ROG Nebula OLED, RTX 4060, Intel Core i9 14th Gen',
        brand: 'ASUS',
        categoryId: catMap['laptops'],
        categorySlug: 'laptops',
        images: [
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 189990,
        discountedPrice: 159990,
        discountPercent: 16,
        stockQuantity: 14,
        ratingAverage: 4.8,
        reviewCount: 110,
        isFeatured: true,
        specs: { 'Refresh Rate': '240Hz OLED', 'RAM': '16GB LPDDR5X', 'Storage': '1TB SSD' }
      },
      {
        name: 'Lenovo IdeaPad Slim 5 (AMD Ryzen 7 7730U, 16GB, 512GB SSD)',
        slug: 'lenovo-ideapad-slim-5-ryzen7',
        description: 'Budget-friendly workhorse featuring AMD Ryzen 7 8-core processor, all-metal lightweight build, and rapid charging.',
        shortInfo: 'AMD Ryzen 7, 16GB RAM, All-Metal Thin & Light for College',
        brand: 'Lenovo',
        categoryId: catMap['laptops'],
        categorySlug: 'laptops',
        images: [
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 72990,
        discountedPrice: 54990,
        discountPercent: 25,
        stockQuantity: 30,
        ratingAverage: 4.4,
        reviewCount: 220,
        isFeatured: false,
        specs: { 'CPU': 'AMD Ryzen 7 7730U', 'RAM': '16GB', 'Battery': '14 Hours', 'Weight': '1.46 kg' }
      },

      // Audio
      {
        name: 'Sony WH-1000XM5 Wireless Active Noise Canceling Headphones',
        slug: 'sony-wh-1000xm5-wireless-nc',
        description: 'Industry-leading noise cancellation powered by two processors and eight microphones. Ultra-comfortable lightweight design with soft fit leather and 30-hour battery life.',
        shortInfo: 'Industry Leading Active Noise Canceling, 30h Battery, Hi-Res LDAC',
        brand: 'Sony',
        categoryId: catMap['audio'],
        categorySlug: 'audio',
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 34990,
        discountedPrice: 26990,
        discountPercent: 23,
        stockQuantity: 40,
        ratingAverage: 4.8,
        reviewCount: 512,
        isFeatured: true,
        specs: { 'Battery': '30 Hours with Quick Charge', 'Codecs': 'LDAC, AAC, SBC', 'Weight': '250g' }
      },
      {
        name: 'Apple AirPods Pro (2nd Generation) with USB-C Charging Case',
        slug: 'apple-airpods-pro-2nd-gen-usbc',
        description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.',
        shortInfo: 'H2 Chip, Adaptive Audio, MagSafe Charging with Speaker & Lanyard',
        brand: 'Apple',
        categoryId: catMap['audio'],
        categorySlug: 'audio',
        images: [
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 24900,
        discountedPrice: 20900,
        discountPercent: 16,
        stockQuantity: 50,
        ratingAverage: 4.9,
        reviewCount: 680,
        isFeatured: true,
        specs: { 'Chip': 'Apple H2', 'Resistance': 'IP54 Dust & Sweat Resistant', 'Battery': '30 Hours total' }
      },
      {
        name: 'Bose QuietComfort 45 Bluetooth Wireless Headphones',
        slug: 'bose-quietcomfort-45-black',
        description: 'Legendary noise cancellation, lightweight comfort, and acoustic technology for deep, clear sound.',
        shortInfo: 'Bose Acoustic Noise Cancelling, TriPort Acoustic Architecture',
        brand: 'Bose',
        categoryId: catMap['audio'],
        categorySlug: 'audio',
        images: [
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 29900,
        discountedPrice: 21990,
        discountPercent: 26,
        stockQuantity: 22,
        ratingAverage: 4.7,
        reviewCount: 195,
        isFeatured: false,
        specs: { 'Battery': '24 Hours', 'Charging': 'USB-C 15min = 3hrs' }
      },
      {
        name: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
        slug: 'jbl-flip-6-waterproof-speaker',
        description: 'Bold JBL Original Pro Sound with exceptional clarity thanks to its 2-way speaker system. IP67 waterproof and dustproof.',
        shortInfo: 'IP67 Waterproof, 12h Playtime, PartyBoost Dual Pairing',
        brand: 'JBL',
        categoryId: catMap['audio'],
        categorySlug: 'audio',
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 13999,
        discountedPrice: 9499,
        discountPercent: 32,
        stockQuantity: 35,
        ratingAverage: 4.6,
        reviewCount: 310,
        isFeatured: false,
        specs: { 'Output': '30W RMS', 'Water Resistance': 'IP67', 'Bluetooth': 'v5.1' }
      },

      // Watches
      {
        name: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case)',
        slug: 'apple-watch-ultra-2-titanium',
        description: 'The most rugged and capable Apple Watch. Designed for outdoor endurance, ocean sports, and elite athletes with a bright 3000-nit display.',
        shortInfo: '49mm Titanium Case, 100m Water Resistance, Precision Dual-Frequency GPS',
        brand: 'Apple',
        categoryId: catMap['watches'],
        categorySlug: 'watches',
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 89900,
        discountedPrice: 79900,
        discountPercent: 11,
        stockQuantity: 16,
        ratingAverage: 4.9,
        reviewCount: 160,
        isFeatured: true,
        specs: { 'Display': '3000 nits Always-On Retina', 'Battery': '36 to 72 Hours', 'Case': 'Grade 5 Titanium' }
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic (47mm, Bluetooth & LTE)',
        slug: 'samsung-galaxy-watch-6-classic-47mm',
        description: 'Iconic rotating bezel is back with a 20% larger display and slim design. Track advanced sleep coaching, body composition, and ECG.',
        shortInfo: 'Physical Rotating Bezel, Sapphire Crystal Glass, ECG & Blood Pressure',
        brand: 'Samsung',
        categoryId: catMap['watches'],
        categorySlug: 'watches',
        images: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 40999,
        discountedPrice: 28999,
        discountPercent: 29,
        stockQuantity: 28,
        ratingAverage: 4.6,
        reviewCount: 220,
        isFeatured: true,
        specs: { 'Display': '1.5-inch Super AMOLED', 'OS': 'Wear OS Powered by Samsung' }
      },
      {
        name: 'Garmin Fenix 7 Pro Solar Multisport GPS Smartwatch',
        slug: 'garmin-fenix-7-pro-solar',
        description: 'Harness the sun with Power Glass solar charging lens to get weeks of battery life in smartwatch mode. Built-in LED flashlight.',
        shortInfo: 'Solar Charging Lens, Multi-Band GPS, Built-In LED Flashlight, 22-day Battery',
        brand: 'Garmin',
        categoryId: catMap['watches'],
        categorySlug: 'watches',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 96990,
        discountedPrice: 84990,
        discountPercent: 12,
        stockQuantity: 10,
        ratingAverage: 4.9,
        reviewCount: 88,
        isFeatured: false,
        specs: { 'Battery': 'Up to 22 Days with Solar', 'Water Rating': '10 ATM (100m)' }
      },
      {
        name: 'Fossil Gen 6 Smartwatch with Smoke Stainless Steel Mesh',
        slug: 'fossil-gen-6-smartwatch-smoke',
        description: 'Classic styling meets modern technology. Snapdragon Wear 4100+ platform for fast app loading and SpO2 sensor for health metrics.',
        shortInfo: 'Classic Luxury Mesh, Fast Charging in 30 mins, Wear OS',
        brand: 'Fossil',
        categoryId: catMap['watches'],
        categorySlug: 'watches',
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 24995,
        discountedPrice: 14995,
        discountPercent: 40,
        stockQuantity: 19,
        ratingAverage: 4.3,
        reviewCount: 145,
        isFeatured: false,
        specs: { 'Compatibility': 'Android & iOS', 'Sensors': 'SpO2, Heart Rate, Compass' }
      },

      // Fashion
      {
        name: 'Nike Air Jordan 1 Retro High OG (Chicago Reimagined)',
        slug: 'nike-air-jordan-1-retro-high-og',
        description: 'The iconic silhouette that started a sneaker revolution. Premium aged leather detailing with vintage off-white accents and responsive Air cushioning.',
        shortInfo: 'Legendary Air Jordan 1 Silhouette, Premium Full-Grain Leather',
        brand: 'Nike',
        categoryId: catMap['fashion'],
        categorySlug: 'fashion',
        images: [
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 18995,
        discountedPrice: 14995,
        discountPercent: 21,
        stockQuantity: 12,
        ratingAverage: 4.9,
        reviewCount: 420,
        isFeatured: true,
        specs: { 'Material': 'Full-Grain Leather', 'Sole': 'Rubber with Air Cushioning' }
      },
      {
        name: 'Levi’s Vintage Trucker Denim Jacket in Rigid Indigo',
        slug: 'levis-vintage-trucker-denim-jacket',
        description: 'First introduced in 1967, this iconic Type III Trucker Jacket is recognized worldwide for its timeless point collar, button flap chest pockets, and durable denim.',
        shortInfo: '100% Heavyweight Cotton Denim, Iconic Type III Silhouette',
        brand: "Levi's",
        categoryId: catMap['fashion'],
        categorySlug: 'fashion',
        images: [
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 6999,
        discountedPrice: 4199,
        discountPercent: 40,
        stockQuantity: 30,
        ratingAverage: 4.7,
        reviewCount: 185,
        isFeatured: false,
        specs: { 'Fit': 'Standard Regular Fit', 'Fabric': '100% Cotton Non-Stretch' }
      },
      {
        name: 'Ray-Ban Classic Polarized Aviator Sunglasses (Gold Frame / Green Lens)',
        slug: 'ray-ban-classic-polarized-aviator',
        description: 'Originally designed in 1937 for US aviators, these iconic sunglasses combine exceptional quality, comfort, and 100% UV protection.',
        shortInfo: 'Polarized G-15 Mineral Lenses, Monel Metal Frame',
        brand: 'Ray-Ban',
        categoryId: catMap['fashion'],
        categorySlug: 'fashion',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 11590,
        discountedPrice: 7990,
        discountPercent: 31,
        stockQuantity: 25,
        ratingAverage: 4.8,
        reviewCount: 310,
        isFeatured: false,
        specs: { 'Lens Width': '58mm', 'Protection': '100% UVA & UVB' }
      },
      {
        name: 'Adidas Originals Trefoil Heavyweight Fleece Hoodie',
        slug: 'adidas-originals-trefoil-hoodie',
        description: 'Crafted from ultra-soft cotton-blend French terry with an embroidered oversized Trefoil chest logo and kangaroo pocket.',
        shortInfo: 'Heavyweight French Terry Cotton, Ribbed Cuffs and Hem',
        brand: 'Adidas',
        categoryId: catMap['fashion'],
        categorySlug: 'fashion',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 5999,
        discountedPrice: 3499,
        discountPercent: 42,
        stockQuantity: 40,
        ratingAverage: 4.6,
        reviewCount: 240,
        isFeatured: false,
        specs: { 'Material': '70% Cotton, 30% Recycled Polyester' }
      },

      // Home
      {
        name: 'Dyson V15 Detect Cordless Vacuum Cleaner with Laser illumination',
        slug: 'dyson-v15-detect-cordless-vacuum',
        description: 'Dyson’s most powerful intelligent cordless vacuum. Laser reveals microscopic dust on hard floors, and piezo sensor continuously sizes and counts dust particles.',
        shortInfo: 'Laser Detects Invisible Dust, 60min Runtime, HEPA Whole-Machine Filtration',
        brand: 'Dyson',
        categoryId: catMap['home'],
        categorySlug: 'home',
        images: [
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 65900,
        discountedPrice: 52900,
        discountPercent: 20,
        stockQuantity: 10,
        ratingAverage: 4.8,
        reviewCount: 175,
        isFeatured: true,
        specs: { 'Suction Power': '240 AW', 'Bin Volume': '0.76 L', 'Weight': '3.0 kg' }
      },
      {
        name: 'Philips Hue Smart Ambient Lightstrip Starter Pack (2m Base)',
        slug: 'philips-hue-smart-ambient-lightstrip',
        description: 'Transform your room with 16 million colors and tunable white light. Works seamlessly with Alexa, Google Home, and Apple HomeKit.',
        shortInfo: '16 Million Colors, Voice Control Compatible, Syncs with TV & Music',
        brand: 'Philips',
        categoryId: catMap['home'],
        categorySlug: 'home',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 8999,
        discountedPrice: 5999,
        discountPercent: 33,
        stockQuantity: 35,
        ratingAverage: 4.5,
        reviewCount: 130,
        isFeatured: false,
        specs: { 'Lumens': '1600 lm', 'Connectivity': 'Bluetooth & Zigbee Hue Bridge' }
      },
      {
        name: 'Nespresso Vertuo Pop Coffee Machine by De’Longhi',
        slug: 'nespresso-vertuo-pop-coffee-machine',
        description: 'Experience barista-style coffee at home with one-touch brewing. Centrifusion technology spins ground coffee up to 4,000 RPM to craft luxurious crema.',
        shortInfo: 'Centrifusion Extraction, 4 Cup Sizes from Espresso to Alto Mug',
        brand: 'Nespresso',
        categoryId: catMap['home'],
        categorySlug: 'home',
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 19999,
        discountedPrice: 13999,
        discountPercent: 30,
        stockQuantity: 15,
        ratingAverage: 4.7,
        reviewCount: 160,
        isFeatured: false,
        specs: { 'Water Tank': '560 ml', 'Heat-Up Time': '30 Seconds' }
      },
      {
        name: 'Ergonomic Mesh High-Back Office Chair with 3D Armrests',
        slug: 'ergonomic-mesh-high-back-office-chair',
        description: 'Engineered for 12+ hours of comfortable seating. Breathable Korean mesh backrest, dynamic lumbar support, and smooth multi-tilt recline lock.',
        shortInfo: 'Dynamic Lumbar Support, 3D Adjustable Armrests, Heavy-Duty Class 4 Gas Lift',
        brand: 'Green Soul',
        categoryId: catMap['home'],
        categorySlug: 'home',
        images: [
          'https://images.unsplash.com/photo-1580481077195-c3a821a5060f?w=800&auto=format&fit=crop&q=80'
        ],
        originalPrice: 22990,
        discountedPrice: 14490,
        discountPercent: 37,
        stockQuantity: 20,
        ratingAverage: 4.6,
        reviewCount: 280,
        isFeatured: true,
        specs: { 'Max Load': '135 kg', 'Warranty': '3 Years On-Site Warranty' }
      }
    ];

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
    console.log('👑 Admin Login:    admin@eshop.com / AdminPassword@123');
    console.log('🛍️ Customer Login: customer@eshop.com / Customer@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();
