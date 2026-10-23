import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { ChatMessage } from '../models/ChatMessage.js';

export async function getRecommendations(userId = null) {
  // Return 12 verified featured & high-rated products for the AI Curations grid
  const products = await Product.find({ active: true })
    .sort({ isFeatured: -1, discountPercent: -1, ratingAverage: -1 })
    .limit(12);

  return products;
}

export async function smartSearch(query = '') {
  if (!query || query.trim() === '') {
    return await Product.find({ active: true }).limit(24);
  }

  const cleanQuery = query.trim();

  let products = await Product.find(
    { $text: { $search: cleanQuery }, active: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(24);

  if (!products || products.length === 0) {
    const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    products = await Product.find({
      active: true,
      $or: [
        { name: regex },
        { brand: regex },
        { categorySlug: regex },
        { shortInfo: regex },
        { description: regex }
      ]
    }).limit(24);
  }

  return products;
}

// Sub-item specific keyword triggers to guarantee exact item matching across 100 products
const SUB_PRODUCT_TRIGGERS = [
  // Watches & Luxury Timepieces
  {
    keywords: ['rolex', 'submariner', 'swiss watch', 'luxury timepiece', 'luxury watch', 'omega', 'moonwatch', 'speedmaster', 'cartier', 'santos', 'tag heuer', 'carrera', 'breitling', 'navitimer', 'tissot', 'prx', 'seiko', 'prospex', 'mechanical watch', 'automatic watch', 'chronograph'],
    filter: { categorySlug: 'watches', name: /rolex|omega|cartier|tag heuer|breitling|tissot|seiko/i },
    title: 'Swiss Luxury & Haute Horlogerie Timepieces',
    clarifications: [
      '👑 Rolex Submariner Date (Oystersteel 300m)',
      '🚀 Omega Speedmaster Professional Moonwatch',
      '💎 Cartier Santos de Cartier Automatic',
      '🏎️ TAG Heuer Carrera Chronograph'
    ]
  },
  {
    keywords: ['apple watch', 'apple watch ultra', 'smart watch', 'smartwatch', 'smartwatches', 'galaxy watch', 'fenix', 'garmin', 'fitness watch', 'g-shock', 'fossil'],
    filter: { categorySlug: 'watches' },
    title: 'Smartwatches & Sports GPS Watches',
    clarifications: [
      '🍏 Apple Watch Ultra 2 (49mm Titanium)',
      '🏃 Garmin Fenix 7 Pro Sapphire Solar',
      '🔄 Samsung Galaxy Watch 6 Classic',
      '⌚ Tissot PRX Powermatic 80'
    ]
  },

  // Footwear & Sneakers
  {
    keywords: ['shoe', 'shoes', 'sneaker', 'sneakers', 'kicks', 'footwear', 'jordan', 'air jordan', 'samba', 'dunk', 'dunks', 'travis', 'yeezy', 'new balance', 'chuck', 'converse', 'suede'],
    filter: { categorySlug: 'fashion', name: /jordan|samba|sneaker|dunk|new balance|converse|yeezy/i },
    title: 'Designer Sneakers & Collector Footwear',
    clarifications: [
      '👟 Nike Air Jordan 1 Chicago Lost & Found',
      '🔥 Adidas Samba OG Classic Leather',
      '👟 New Balance 990v6 Made in USA',
      '💰 Under ₹15,000 Sneakers'
    ]
  },

  // Jackets & Outerwear
  {
    keywords: ['jacket', 'jackets', 'outerwear', 'trench', 'trench coat', 'coat', 'burberry', 'leather jacket', 'schott', 'moncler', 'puffer', 'denim jacket', 'trucker', 'bomber'],
    filter: { categorySlug: 'fashion', name: /jacket|coat|trench|puffer|trucker/i },
    title: 'Heritage Outerwear & Luxury Jackets',
    clarifications: [
      '🧥 Burberry Kensington Heritage Trench Coat',
      '🏍️ Schott NYC Classic Perfecto Leather Jacket',
      '❄️ Moncler Maya Down Puffer Jacket',
      '🧥 Levi’s Vintage Sherpa Trucker Denim'
    ]
  },

  // Fashion Accessories & Eyewear
  {
    keywords: ['sunglasses', 'sunglass', 'shades', 'aviator', 'aviators', 'wayfarer', 'eyewear', 'glasses', 'ray-ban', 'rayban', 'belt', 'gucci', 'bag', 'tote', 'prada', 'scarf'],
    filter: { categorySlug: 'fashion', name: /aviator|wayfarer|ray-ban|gucci|prada|scarf|belt/i },
    title: 'Luxury Eyewear & Designer Accessories',
    clarifications: [
      '🕶️ Ray-Ban Classic Polarized Aviator',
      '🕶️ Ray-Ban Original Wayfarer Polarized',
      '👜 Prada Re-Nylon & Saffiano Leather Tote',
      '🧣 Burberry Giant Check Cashmere Scarf'
    ]
  },

  // MacBooks & Apple Computers
  {
    keywords: ['macbook', 'mac', 'macbook pro', 'macbook air', 'm3', 'm3 max', 'm2', 'mac studio', 'imac', 'mac mini'],
    filter: { categorySlug: 'laptops', name: /macbook|mac studio|imac|mac mini/i },
    title: 'Apple Mac & Silicon Workstations',
    clarifications: [
      '💻 MacBook Pro 16 M3 Max (36GB RAM / 1TB SSD)',
      '💼 MacBook Air 15 M3 (Liquid Retina)',
      '🖥️ Apple Mac Studio M2 Ultra (64GB RAM)',
      '🖥️ Apple iMac 24 4.5K Retina M3'
    ]
  },

  // Gaming Laptops
  {
    keywords: ['gaming laptop', 'gaming pc', 'rtx', 'rtx 4090', 'rtx 4080', 'rtx 4070', 'rog', 'zephyrus', 'alienware', 'legion', 'razer', 'blade', 'msi titan', 'predator'],
    filter: { categorySlug: 'laptops', name: /rog|zephyrus|alienware|legion|razer|msi|predator/i },
    title: 'High-Performance Gaming Laptops',
    clarifications: [
      '⚡ ASUS ROG Zephyrus G16 (240Hz Nebula OLED)',
      '👽 Alienware m18 R2 (i9-14900HX, RTX 4090)',
      '🎮 Lenovo Legion Pro 7i Gen 9 (RTX 4090)',
      '🐍 Razer Blade 16 (Dual-Mode Mini-LED)'
    ]
  },

  // Ultrabooks & Creator Laptops
  {
    keywords: ['ultrabook', 'creator laptop', 'xps', 'dell xps', 'thinkpad', 'spectre', 'zenbook', 'surface'],
    filter: { categorySlug: 'laptops', name: /xps|thinkpad|spectre|zenbook|surface/i },
    title: 'Premium Ultrabooks & Creator Laptops',
    clarifications: [
      '⚡ Dell XPS 16 (Core Ultra 9, 4K+ OLED)',
      '💼 Lenovo ThinkPad X1 Carbon Gen 12',
      '✨ HP Spectre x360 2-in-1 OLED',
      '💻 ASUS ZenBook Pro 14 OLED'
    ]
  },

  // Noise Canceling Headphones & Audiophile Audio
  {
    keywords: ['headphone', 'headphones', 'over-ear', 'noise canceling', 'noise cancelling', 'anc', 'wh-1000xm5', 'sony headphone', 'bose', 'quietcomfort', 'sennheiser', 'momentum', 'bowers', 'px8', 'beoplay', 'shure', 'audio-technica'],
    filter: { categorySlug: 'audio', name: /wh-1000xm5|quietcomfort|momentum|px8|beoplay|shure|ath-m50x|over-ear|headphone/i },
    title: 'Studio & Audiophile Over-Ear Headphones',
    clarifications: [
      '🎧 Sony WH-1000XM5 (Industry-Leading ANC)',
      '👑 Bose QuietComfort Ultra Headphones',
      '💎 Bowers & Wilkins Px8 Flagship Wireless',
      '🎙️ Shure SM7B Cardioid Studio Microphone'
    ]
  },

  // Wireless Earbuds
  {
    keywords: ['airpod', 'airpods', 'earbud', 'earbuds', 'in-ear', 'tws', 'wf-1000xm5'],
    filter: { categorySlug: 'audio', name: /airpod|earbud|wf-1000xm5/i },
    title: 'True Wireless Noise-Canceling Earbuds',
    clarifications: [
      '🎵 Apple AirPods Pro 2 (USB-C MagSafe)',
      '🎧 Sony WF-1000XM5 ANC Earbuds',
      '👑 Bose QuietComfort Ultra Earbuds',
      '🎶 Sennheiser Momentum True Wireless 4'
    ]
  },

  // Speakers & Soundbars
  {
    keywords: ['speaker', 'speakers', 'bluetooth speaker', 'marshall speaker', 'woburn', 'stanmore', 'beolit', 'sonos', 'jbl boombox', 'soundbar'],
    filter: { categorySlug: 'audio', name: /speaker|woburn|stanmore|beolit|sonos|boombox/i },
    title: 'Acoustic Home & Portable Bluetooth Speakers',
    clarifications: [
      '📻 Marshall Woburn III Bluetooth Home Speaker',
      '🎶 Bang & Olufsen Beolit 20 Portable Speaker',
      '🔊 Sonos Era 300 Spatial Audio Speaker',
      '🌊 JBL Boombox 3 Waterproof Speaker'
    ]
  },

  // Flagship Mobiles (iPhone, Samsung Galaxy, OnePlus, Pixel)
  {
    keywords: ['iphone', 'apple phone', 'ios', 'iphone 15 pro', '15 pro max', 'iphone 15'],
    filter: { categorySlug: 'mobiles', name: /iphone/i },
    title: 'Apple iPhone Flagships',
    clarifications: [
      '🍎 iPhone 15 Pro Max (Natural Titanium 256GB)',
      '📱 iPhone 15 Plus (Pink 128GB)',
      '⚡ OnePlus 12 5G (Flagship Speed)',
      '🤖 Samsung Galaxy S24 Ultra'
    ]
  },
  {
    keywords: ['samsung', 'galaxy', 's24', 's24 ultra', 'z fold', 'z flip', 'galaxy fold', 'galaxy s24'],
    filter: { categorySlug: 'mobiles', name: /samsung|galaxy/i },
    title: 'Samsung Galaxy Flagships & Foldables',
    clarifications: [
      '📱 Samsung Galaxy S24 Ultra 5G (Galaxy AI, 200MP)',
      '📖 Samsung Galaxy Z Fold 5 (Dynamic AMOLED)',
      '🪞 Samsung Galaxy Z Flip 5 (Compact Foldable)',
      '⚡ OnePlus 12 5G'
    ]
  },
  {
    keywords: ['oneplus', 'pixel', 'google pixel', 'nothing phone', 'xiaomi', 'vivo', 'rog phone'],
    filter: { categorySlug: 'mobiles', name: /oneplus|pixel|nothing|xiaomi|vivo|rog phone/i },
    title: 'Android Flagships & Creator Phones',
    clarifications: [
      '⚡ OnePlus 12 5G (16GB RAM, 100W Charging)',
      '📸 Google Pixel 8 Pro (Bay Blue, Tensor G3)',
      '💡 Nothing Phone (2) Glyph Interface',
      '🎮 ASUS ROG Phone 8 Pro (Esports Gaming)'
    ]
  },

  // Espresso & Barista Coffee Machines
  {
    keywords: ['coffee', 'espresso', 'nespresso', 'breville', 'barista', 'delonghi', 'de\'longhi', 'cappuccino', 'latte', 'cafe', 'coffee maker', 'coffee machine'],
    filter: { categorySlug: 'home', name: /nespresso|breville|de'longhi|smeg|coffee/i },
    title: 'Barista Espresso & Gourmet Coffee Makers',
    clarifications: [
      '☕ Breville Barista Touch Touchscreen Espresso',
      '🇮🇹 De\'Longhi Magnifica S Automatic Espresso',
      '☕ Nespresso Vertuo Pop Machine',
      '🎨 SMEG 50s Retro Style Espresso Machine'
    ]
  },

  // Ergonomic Chairs & Desk Setup
  {
    keywords: ['chair', 'chairs', 'office chair', 'desk chair', 'ergonomic chair', 'aeron', 'herman miller', 'steelcase', 'gesture', 'the sleep company'],
    filter: { categorySlug: 'home', name: /chair|aeron|gesture|smartgrid/i },
    title: 'Ergonomic Office & Executive Seating',
    clarifications: [
      '🪑 Herman Miller Aeron Ergonomic Chair',
      '🪑 Steelcase Gesture Ergonomic Office Chair',
      '🪑 The Sleep Company SmartGRID Onyx Chair',
      '💡 Philips Hue Ambient Lighting'
    ]
  },

  // Smart Cleaning & Vacuums
  {
    keywords: ['vacuum', 'cleaner', 'dyson', 'roomba', 'irobot', 'robot vacuum', 'dust', 'cordless vacuum'],
    filter: { categorySlug: 'home', name: /vacuum|dyson|roomba/i },
    title: 'Smart Vacuums & Cordless Cleaning',
    clarifications: [
      '🧹 Dyson V15 Detect Laser Cord-Free Vacuum',
      '🤖 iRobot Roomba Combo j9+ Auto-Empty Robot',
      '💡 Philips Hue Ambient Lighting',
      '🪑 Herman Miller Aeron Chair'
    ]
  },

  // Smart Lighting & Home Automation
  {
    keywords: ['light', 'lights', 'lighting', 'philips hue', 'hue', 'smart light', 'ambient light', 'lightstrip', 'bulb'],
    filter: { categorySlug: 'home', name: /hue|light/i },
    title: 'Philips Hue Smart Ambient Lighting',
    clarifications: [
      '💡 Philips Hue White & Color Starter Kit',
      '🌈 Philips Hue Play Gradient Lightstrip 65"',
      '☕ Breville Barista Touch Espresso Machine',
      '🪑 Herman Miller Aeron Chair'
    ]
  }
];

// Broad Category Definitions
const CATEGORY_MAP = {
  fashion: {
    slug: 'fashion',
    name: 'Fashion & Apparel',
    keywords: ['fashion', 'apparel', 'clothes', 'clothing', 'wear', 'outfit', 'streetwear', 'sneaker', 'sneakers', 'jacket', 'trench', 'sunglasses'],
    defaultClarifications: [
      '👟 Nike Air Jordan 1 Chicago OG',
      '🧥 Burberry Kensington Heritage Trench Coat',
      '🕶️ Ray-Ban Classic Polarized Aviator',
      '👟 Adidas Originals Samba OG'
    ]
  },
  mobiles: {
    slug: 'mobiles',
    name: 'Mobiles & Tablets',
    keywords: ['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'cell', 'cellphone', '5g', 'tablet', 'ipad'],
    defaultClarifications: [
      '🍎 Apple iPhone 15 Pro Max Titanium',
      '📱 Samsung Galaxy S24 Ultra (200MP)',
      '⚡ OnePlus 12 5G (Best Value ₹59,999)',
      '📱 Apple iPad Pro 12.9 M2 Liquid Retina'
    ]
  },
  laptops: {
    slug: 'laptops',
    name: 'Laptops & Computers',
    keywords: ['laptop', 'laptops', 'computer', 'computers', 'pc', 'notebook', 'ultrabook', 'workstation', 'macbook', 'desktop', 'mac'],
    defaultClarifications: [
      '💻 MacBook Pro 16 M3 Max (36GB RAM)',
      '⚡ Dell XPS 16 (Core Ultra 9, 4K+ OLED)',
      '👽 Alienware m18 R2 Gaming (RTX 4090)',
      '💼 ThinkPad X1 Carbon Gen 12'
    ]
  },
  audio: {
    slug: 'audio',
    name: 'Audio & Sound',
    keywords: ['audio', 'sound', 'music', 'headphone', 'headphones', 'earphone', 'earphones', 'earbud', 'earbuds', 'anc', 'speaker', 'speakers', 'soundbar'],
    defaultClarifications: [
      '🎧 Sony WH-1000XM5 (Top ANC)',
      '🎵 Apple AirPods Pro 2 (USB-C)',
      '💎 Bowers & Wilkins Px8 Wireless',
      '📻 Marshall Woburn III Home Speaker'
    ]
  },
  watches: {
    slug: 'watches',
    name: 'Smart Watches & Timepieces',
    keywords: ['watch', 'watches', 'smartwatch', 'smartwatches', 'smart watch', 'timepiece', 'tracker', 'fitness tracker', 'rolex', 'omega', 'cartier'],
    defaultClarifications: [
      '👑 Rolex Submariner Date (Oystersteel)',
      '🚀 Omega Speedmaster Moonwatch',
      '🍏 Apple Watch Ultra 2 (49mm Titanium)',
      '🏃 Garmin Fenix 7 Pro Sapphire Solar'
    ]
  },
  home: {
    slug: 'home',
    name: 'Home & Living',
    keywords: ['home', 'living', 'decor', 'room', 'house', 'furniture', 'appliance', 'smart home', 'kitchen', 'espresso', 'coffee', 'chair', 'vacuum'],
    defaultClarifications: [
      '🪑 Herman Miller Aeron Ergonomic Chair',
      '☕ Breville Barista Touch Espresso Machine',
      '🧹 Dyson V15 Detect Laser Vacuum',
      '💡 Philips Hue Color Starter Kit'
    ]
  }
};

const CATALOG_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Google', 'Nothing', 'Xiaomi', 'Vivo', 'Motorola',
  'Sony', 'Bose', 'Sennheiser', 'Bowers & Wilkins', 'Bang & Olufsen', 'Marshall', 'JBL', 'Audio-Technica', 'Shure', 'Sonos',
  'Dell', 'ASUS', 'Lenovo', 'HP', 'Razer', 'Alienware', 'MSI', 'Acer', 'Microsoft',
  'Rolex', 'Omega', 'Cartier', 'TAG Heuer', 'Breitling', 'Tissot', 'Seiko', 'Casio', 'Garmin', 'Fossil',
  'Nike', 'Adidas', "Levi's", 'Ray-Ban', 'Gucci', 'Burberry', 'Prada', 'Ralph Lauren', 'Tommy Hilfiger', 'Schott', 'Moncler', 'New Balance', 'Converse', 'Puma',
  'Dyson', 'Philips', 'Nespresso', 'Breville', "De'Longhi", 'SMEG', 'Herman Miller', 'Steelcase', 'The Sleep Company', 'iRobot', 'Le Creuset'
];

const OUT_OF_CATALOG_KEYWORDS = [
  'car', 'cars', 'motorcycle', 'motorcycles', 'bike', 'bikes', 'bicycle',
  'pet food', 'dog food', 'cat food', 'medicine', 'prescription', 'dental',
  'piano', 'guitar', 'violin', 'drums', 'raw grocery', 'vegetables', 'fruits',
  'real estate', 'property', 'apartment', 'comic book', 'used textbook'
];

// Vague / Ambiguous queries that need clarifying questions
const VAGUE_QUERY_REGEX = /^(suggest|recommend|help|what|anything|something|gift|present|show me|options|browse|tell me|i want to buy|give me|best products|top items|what do you have)\b/i;

export async function chatConcierge(userId, userMessage, sessionId) {
  const safeUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;

  // Persist user's message
  await ChatMessage.create({
    userId: safeUserId,
    sessionId,
    role: 'user',
    content: userMessage
  });

  const rawQuery = userMessage.toLowerCase().trim();
  let matchedProducts = [];
  let reply = '';
  let followUpQuestions = [];
  let maxBudget = null;

  // 1. Parse Budget / Price (e.g. "under 30000", "below 60k", "under 1.5 lakh", "under 10 lakh")
  const kMatch = rawQuery.match(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  const lakhMatch = rawQuery.match(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)\b/i);
  const rawNumMatch = rawQuery.match(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d{4,8})\b/i);

  if (kMatch) {
    maxBudget = parseFloat(kMatch[1]) * 1000;
  } else if (lakhMatch) {
    maxBudget = parseFloat(lakhMatch[1]) * 100000;
  } else if (rawNumMatch) {
    maxBudget = parseInt(rawNumMatch[1], 10);
  }

  // 2. Check for out-of-catalog items
  const isOutOfCatalog = OUT_OF_CATALOG_KEYWORDS.some(k => {
    const r = new RegExp(`\\b${k}\\b`, 'i');
    return r.test(rawQuery);
  });

  if (isOutOfCatalog) {
    reply = `We do not stock that item in our curated boutique. Our certified collections specialize in:\n\n• **Mobiles & Tablets** (Apple, Samsung, OnePlus, Google, ROG)\n• **Laptops & Workstations** (MacBook Pro/Air, Dell XPS, Alienware, ROG, ThinkPad)\n• **Audio & Sound** (Sony, Bose, Bowers & Wilkins, Bang & Olufsen, Marshall, AirPods)\n• **Smart Watches & Luxury Timepieces** (Rolex, Omega, Cartier, TAG Heuer, Apple Watch, Garmin)\n• **Fashion & Footwear** (Nike Air Jordans, Burberry, Schott, Gucci, Adidas, Ray-Ban)\n• **Home & Living** (Herman Miller, Breville, De'Longhi, Dyson, Philips Hue, Nespresso)\n\nWhich of these collections would you like to explore?`;
    followUpQuestions = [
      '👑 Swiss Luxury Watches (Rolex & Omega)',
      '👟 Designer Sneakers & Streetwear',
      '💻 High Performance Mac & Gaming Laptops',
      '🎧 Audiophile & Noise Canceling Audio'
    ];

    const assistantMsg = await ChatMessage.create({
      userId: safeUserId,
      sessionId,
      role: 'assistant',
      content: reply,
      productRecommendations: [],
      followUpQuestions
    });

    return {
      messageId: assistantMsg._id,
      reply,
      productRecommendations: [],
      followUpQuestions
    };
  }

  // 3. Check for specific sub-product trigger (e.g. "rolex", "shoes", "coffee", "macbook", "dyson", "gaming laptop")
  let matchedSubTrigger = null;
  for (const st of SUB_PRODUCT_TRIGGERS) {
    if (st.keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(rawQuery))) {
      matchedSubTrigger = st;
      break;
    }
  }

  // 4. Check for Category Match
  let matchedCategory = null;
  for (const [key, catData] of Object.entries(CATEGORY_MAP)) {
    if (catData.keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(rawQuery))) {
      matchedCategory = catData;
      break;
    }
  }

  // 5. Check for Brand Match
  let matchedBrand = null;
  for (const b of CATALOG_BRANDS) {
    const brandLower = b.toLowerCase();
    if (brandLower === "levi's" && /\blevis?\b/i.test(rawQuery)) {
      matchedBrand = b;
      break;
    } else if (brandLower === "de'longhi" && /delonghi|de'longhi/i.test(rawQuery)) {
      matchedBrand = b;
      break;
    } else if (brandLower === "bowers & wilkins" && /bowers|b&w/i.test(rawQuery)) {
      matchedBrand = b;
      break;
    } else if (brandLower === "bang & olufsen" && /bang & olufsen|b&o|beoplay/i.test(rawQuery)) {
      matchedBrand = b;
      break;
    } else if (new RegExp(`\\b${brandLower}\\b`, 'i').test(rawQuery)) {
      matchedBrand = b;
      break;
    }
  }

  // 6. Check for Deals / Discount Queries
  const isDealsQuery = /discount|deal|deals|offer|offers|cheap|cheapest|sale|promo|bargain|lowest price/i.test(rawQuery);

  // EXECUTION PATH A: Specific Sub-product Trigger
  if (matchedSubTrigger) {
    const filter = { ...matchedSubTrigger.filter, active: true };
    if (matchedBrand) filter.brand = new RegExp(matchedBrand, 'i');
    if (maxBudget) filter.discountedPrice = { $lte: maxBudget };

    matchedProducts = await Product.find(filter)
      .sort({ ratingAverage: -1, discountPercent: -1 })
      .limit(4);

    if (maxBudget && matchedProducts.length === 0) {
      const affordable = await Product.find({ ...matchedSubTrigger.filter, active: true })
        .sort({ discountedPrice: 1 })
        .limit(2);
      
      if (affordable.length > 0) {
        matchedProducts = affordable;
        reply = `In our **${matchedSubTrigger.title}** collection, authentic models start from ₹${affordable[0].discountedPrice.toLocaleString()}. Here are the closest **Recommended** options for you:`;
      } else {
        matchedProducts = await Product.find({ categorySlug: matchedSubTrigger.filter.categorySlug, active: true }).limit(3);
        reply = `Here are our top **Recommended** alternatives in this department:`;
      }
    } else {
      reply = `Here are our top **Recommended** curations for **${matchedSubTrigger.title}**! Each verified for authentic craftsmanship and guaranteed delivery:`;
    }

    followUpQuestions = matchedSubTrigger.clarifications;
  }
  // EXECUTION PATH B: Broad Category Trigger
  else if (matchedCategory) {
    const filter = { categorySlug: matchedCategory.slug, active: true };
    if (matchedBrand) filter.brand = new RegExp(matchedBrand, 'i');
    if (maxBudget) filter.discountedPrice = { $lte: maxBudget };

    matchedProducts = await Product.find(filter)
      .sort({ ratingAverage: -1, discountPercent: -1 })
      .limit(4);

    if (maxBudget && matchedProducts.length === 0) {
      const affordable = await Product.find({ categorySlug: matchedCategory.slug, active: true })
        .sort({ discountedPrice: 1 })
        .limit(2);

      const lowestPrice = affordable[0]?.discountedPrice || 0;
      matchedProducts = affordable;

      reply = `In our **${matchedCategory.name}** collection, verified items start at ₹${lowestPrice.toLocaleString()} (${affordable[0]?.name || ''}). Here are our closest **Recommended** options:`;
      followUpQuestions = [
        `⭐ Best Value in ${matchedCategory.name}`,
        `💰 Alternative Items Under ₹${maxBudget.toLocaleString()}`,
        `🔥 Highest Discounts in ${matchedCategory.name}`
      ];
    } else {
      const budgetNote = maxBudget ? ` under ₹${maxBudget.toLocaleString()}` : '';
      const brandNote = matchedBrand ? ` from ${matchedBrand}` : '';
      reply = `Here are our top **Recommended** picks for **${matchedCategory.name}**${brandNote}${budgetNote}, hand-matched from our 100-product catalog:`;
      followUpQuestions = matchedCategory.defaultClarifications;
    }
  }
  // EXECUTION PATH C: Brand Search without Category
  else if (matchedBrand) {
    const filter = { brand: new RegExp(matchedBrand, 'i'), active: true };
    if (maxBudget) filter.discountedPrice = { $lte: maxBudget };

    matchedProducts = await Product.find(filter)
      .sort({ ratingAverage: -1, discountPercent: -1 })
      .limit(4);

    reply = `Here are our top **Recommended** authentic products from **${matchedBrand}**:`;
    followUpQuestions = [
      `🔥 Show ${matchedBrand} with Highest Discounts`,
      `⭐ Show Top-Rated ${matchedBrand} Item`,
      `📱 Compare ${matchedBrand} with Alternatives`
    ];
  }
  // EXECUTION PATH D: Deals & Discounts Query
  else if (isDealsQuery) {
    const filter = { active: true };
    if (maxBudget) filter.discountedPrice = { $lte: maxBudget };

    matchedProducts = await Product.find(filter)
      .sort({ discountPercent: -1, ratingAverage: -1 })
      .limit(4);

    reply = `Here are our top **Recommended** mega-deal highlights across our catalog featuring discounts up to **50%+ OFF**:`;
    followUpQuestions = [
      '👟 Fashion & Sneaker Deals (30%+ OFF)',
      '🎧 Audio & Headphones Offers',
      '⌚ Smartwatch & Horology Deals',
      '💻 Laptop & Workstation Promotions'
    ];
  }
  // EXECUTION PATH E: Vague / Ambiguous Query
  else if (VAGUE_QUERY_REGEX.test(rawQuery) || rawQuery.length < 12) {
    matchedProducts = await Product.find({ active: true, isFeatured: true })
      .sort({ ratingAverage: -1, discountPercent: -1 })
      .limit(3);

    reply = `I would love to help you find the exact right product! To tailor my recommendations, could you tell me:\n\n1. **Which category interests you?** (Smartphones, Laptops, Audio, Swiss Watches, Designer Fashion, or Home Living)\n2. **Is there a preferred brand or use-case?**\n3. **Do you have a target budget?**\n\nMeanwhile, here are today's top **Recommended** editor picks:`;
    followUpQuestions = [
      '👑 Swiss Luxury Timepieces (Rolex & Omega)',
      '👟 Designer Sneakers & Streetwear',
      '💻 Laptops for Work, Code & Gaming',
      '🎧 Noise Canceling Headphones'
    ];
  }
  // EXECUTION PATH F: Multi-Token Keyword Search across 100 products
  else {
    const cleanWords = cleanText(rawQuery).split(/\s+/).filter(w => w.length > 2 && !['want', 'need', 'show', 'give', 'best', 'good', 'some', 'look', 'looking', 'tell', 'help', 'product', 'products', 'item', 'items'].includes(w));
    
    if (cleanWords.length > 0) {
      const orConditions = [];
      cleanWords.forEach(w => {
        const reg = new RegExp(w, 'i');
        orConditions.push({ name: reg }, { brand: reg }, { shortInfo: reg }, { categorySlug: reg }, { description: reg });
      });

      const filter = { active: true, $or: orConditions };
      if (maxBudget) filter.discountedPrice = { $lte: maxBudget };

      matchedProducts = await Product.find(filter)
        .sort({ ratingAverage: -1, discountPercent: -1 })
        .limit(4);
    }

    if (matchedProducts.length > 0) {
      reply = `Based on your request, here are our top **Recommended** items from our 100-product collection. Click any card to view complete specifications & check pincode delivery:`;
      followUpQuestions = [
        '💰 Filter by budget / price range',
        '⭐ Show top-rated buyer favorites',
        '🔥 Check highest discounts'
      ];
    } else {
      matchedProducts = await Product.find({ active: true, isFeatured: true })
        .sort({ ratingAverage: -1 })
        .limit(3);

      reply = `I couldn't find an exact match for that specific term, but here are our top **Recommended** trending luxury items. What specific brand or collection can I find for you?`;
      followUpQuestions = [
        '👑 Explore Swiss Watches & Horology',
        '👟 Explore Sneakers & Streetwear',
        '💻 Explore Laptops & Workstations',
        '☕ Explore Gourmet Espresso & Home'
      ];
    }
  }

  // 7. Format Recommendations with complete product payload and intelligent recommendation reasons
  const productRecommendations = matchedProducts.map((p, idx) => {
    const badge = idx === 0 ? '⭐ Top Recommendation' : '⭐ Recommended Pick';
    const reason = generateRecommendationReason(p);

    return {
      _id: p._id,
      productId: p._id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      categorySlug: p.categorySlug,
      image: p.images?.[0] || '',
      images: p.images || [],
      price: p.discountedPrice,
      discountedPrice: p.discountedPrice,
      originalPrice: p.originalPrice,
      discountPercent: p.discountPercent,
      stockQuantity: p.stockQuantity,
      ratingAverage: p.ratingAverage,
      reviewCount: p.reviewCount,
      shortInfo: p.shortInfo,
      description: p.description,
      specs: p.specs,
      recommendationBadge: badge,
      recommendedReason: reason
    };
  });

  // Persist assistant message
  const assistantMsg = await ChatMessage.create({
    userId: safeUserId,
    sessionId,
    role: 'assistant',
    content: reply,
    productRecommendations,
    followUpQuestions
  });

  return {
    messageId: assistantMsg._id,
    reply,
    productRecommendations,
    followUpQuestions
  };
}

function generateRecommendationReason(product) {
  // Use product's verified shortInfo if available, enhanced with discount and rating highlights
  if (product.discountPercent >= 25 && product.shortInfo) {
    return `${product.discountPercent}% OFF Special Deal • ${product.shortInfo}`;
  }

  if (product.shortInfo && product.shortInfo.length > 10) {
    return `${product.shortInfo} • Rated ${product.ratingAverage || 4.8}★`;
  }

  // Brand-specific luxury highlights
  if (product.brand === 'Rolex' || product.brand === 'Omega' || product.brand === 'Cartier' || product.brand === 'TAG Heuer' || product.brand === 'Breitling') {
    return 'Swiss luxury horology • Master Chronometer certified • Collector investment timepiece';
  }
  if (product.brand === 'Herman Miller' || product.brand === 'Steelcase') {
    return 'Iconic ergonomic engineering with PostureFit SL spinal support for all-day comfort';
  }
  if (product.brand === 'Apple') {
    return 'Seamless Apple Ecosystem integration with industry-leading silicon performance & retina visuals';
  }
  if (product.brand === 'Sony') {
    return 'Industry-leading Active Noise Cancellation with Hi-Res LDAC audio processing';
  }
  if (product.brand === 'Nike' || product.brand === 'Adidas') {
    return 'Grail street culture icon with authentic verified construction';
  }

  return `Verified Authentic • Rated ${product.ratingAverage || 4.8}★ by luxury collectors`;
}

function cleanText(text) {
  return text.replace(/[^\w\s]/gi, ' ').trim();
}
