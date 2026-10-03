import { Product } from '../models/Product.js';
import { ChatMessage } from '../models/ChatMessage.js';

export async function getRecommendations(userId = null) {
  // Return 12 products for grid
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

// Sub-item specific keyword triggers to guarantee exact item matching
const SUB_PRODUCT_TRIGGERS = [
  {
    keywords: ['shoe', 'shoes', 'sneaker', 'sneakers', 'kicks', 'footwear', 'jordan', 'air jordan'],
    filter: { categorySlug: 'fashion', name: /jordan|shoe|sneaker/i },
    title: 'Sneakers & Footwear',
    clarifications: [
      '👟 Nike Air Jordan 1 Chicago OG',
      '🔥 Sneakers with 30%+ Discount',
      '👕 Match with Hoodies & Streetwear',
      '💰 Under ₹15,000 Picks'
    ]
  },
  {
    keywords: ['hoodie', 'hoodies', 'sweatshirt', 'fleece'],
    filter: { categorySlug: 'fashion', name: /hoodie|sweatshirt/i },
    title: 'Hoodies & Streetwear',
    clarifications: [
      '👕 Adidas Heavyweight Trefoil Hoodie',
      '🧥 Levi’s Denim Trucker Jacket',
      '👟 Air Jordan 1 Sneakers'
    ]
  },
  {
    keywords: ['jacket', 'jackets', 'denim', 'trucker'],
    filter: { categorySlug: 'fashion', name: /jacket|denim/i },
    title: 'Denim Jackets & Outerwear',
    clarifications: [
      '🧥 Levi’s Vintage Trucker Denim',
      '👕 Adidas Trefoil Hoodie',
      '🕶️ Ray-Ban Aviators'
    ]
  },
  {
    keywords: ['sunglasses', 'sunglass', 'shades', 'aviator', 'aviators', 'eyewear', 'glasses', 'ray-ban', 'rayban'],
    filter: { categorySlug: 'fashion', name: /aviator|sunglass|ray-ban/i },
    title: 'Luxury Sunglasses & Eyewear',
    clarifications: [
      '🕶️ Ray-Ban Classic Polarized Aviator',
      '👔 Match with Denim Jackets',
      '🔥 30%+ Off Luxury Accessories'
    ]
  },
  {
    keywords: ['coffee', 'espresso', 'nespresso', 'barista', 'cappuccino', 'latte', 'cafe'],
    filter: { categorySlug: 'home', name: /nespresso|coffee/i },
    title: 'Barista Espresso & Coffee',
    clarifications: [
      '☕ Nespresso Vertuo Pop Machine',
      '💡 Philips Hue Ambient Lighting',
      '🪑 Ergonomic High-Back Chair'
    ]
  },
  {
    keywords: ['chair', 'chairs', 'office chair', 'desk chair', 'ergonomic chair', 'seating'],
    filter: { categorySlug: 'home', name: /chair|seat/i },
    title: 'Ergonomic Desk & Office Chairs',
    clarifications: [
      '🪑 Green Soul Ergonomic High-Back Chair',
      '💡 Philips Hue Desk Lighting',
      '☕ Nespresso Coffee for Desk'
    ]
  },
  {
    keywords: ['light', 'lights', 'lighting', 'lightstrip', 'ambient light', 'philips hue', 'smart light', 'rgb'],
    filter: { categorySlug: 'home', name: /light|hue/i },
    title: 'Smart Ambient Lighting',
    clarifications: [
      '💡 Philips Hue Ambient Lightstrip Starter',
      '🪑 Ergonomic Workspace Chair',
      '🧹 Dyson Cordless Vacuum'
    ]
  },
  {
    keywords: ['vacuum', 'cleaner', 'cleaning', 'dyson', 'dust'],
    filter: { categorySlug: 'home', name: /vacuum|dyson/i },
    title: 'Cordless Laser Cleaning',
    clarifications: [
      '🧹 Dyson V15 Detect Laser Vacuum',
      '💡 Philips Hue Smart Lighting',
      '☕ Nespresso Vertuo Coffee'
    ]
  },
  {
    keywords: ['airpod', 'airpods', 'earbud', 'earbuds', 'in-ear', 'tws'],
    filter: { categorySlug: 'audio', name: /airpod|earbud/i },
    title: 'Wireless Earbuds',
    clarifications: [
      '🎵 Apple AirPods Pro 2 (USB-C)',
      '🎧 Sony WH-1000XM5 Over-Ear',
      '🔊 JBL Waterproof Speaker'
    ]
  },
  {
    keywords: ['over-ear', 'headphone', 'headphones', 'headset', 'anc headphone'],
    filter: { categorySlug: 'audio', name: /wh-1000xm5|quietcomfort|headphone/i },
    title: 'Noise Canceling Over-Ear Headphones',
    clarifications: [
      '🎧 Sony WH-1000XM5 (Top ANC)',
      '👑 Bose QuietComfort 45 (Plush Comfort)',
      '🎵 AirPods Pro 2 Earbuds'
    ]
  },
  {
    keywords: ['speaker', 'speakers', 'bluetooth speaker', 'portable speaker'],
    filter: { categorySlug: 'audio', name: /speaker|flip/i },
    title: 'Portable Bluetooth Speakers',
    clarifications: [
      '🔊 JBL Flip 6 Waterproof Speaker',
      '🎧 Sony Noise Canceling Headphones',
      '🎵 Apple AirPods Pro 2'
    ]
  },
  {
    keywords: ['macbook', 'mac', 'apple laptop', 'm3'],
    filter: { categorySlug: 'laptops', name: /macbook/i },
    title: 'Apple MacBook M3 Series',
    clarifications: [
      '💻 MacBook Air 15-inch M3',
      '🎮 ASUS ROG Zephyrus RTX 4060',
      '⚡ Dell XPS 16 4K OLED'
    ]
  },
  {
    keywords: ['gaming laptop', 'gaming pc', 'rtx laptop', 'high fps', 'zephyrus', 'rog'],
    filter: { categorySlug: 'laptops', name: /rog|zephyrus|gaming/i },
    title: 'High-Performance Gaming Laptops',
    clarifications: [
      '🎮 ASUS ROG Zephyrus G16 (RTX 4060)',
      '⚡ Dell XPS 16 (RTX 4070 Creator)',
      '💼 MacBook Air 15 M3'
    ]
  },
  {
    keywords: ['budget laptop', 'cheap laptop', 'student laptop', 'ideapad', 'lenovo laptop'],
    filter: { categorySlug: 'laptops', name: /ideapad|lenovo/i },
    title: 'Value Productivity Laptops',
    clarifications: [
      '💰 Lenovo IdeaPad Slim 5 (Under ₹60K)',
      '💼 MacBook Air 15 M3',
      '🎮 ASUS ROG Gaming Laptop'
    ]
  },
  {
    keywords: ['iphone', 'apple phone', 'ios'],
    filter: { categorySlug: 'mobiles', name: /iphone/i },
    title: 'Apple iPhone Flagships',
    clarifications: [
      '🍎 iPhone 15 Pro Max (Titanium)',
      '🤖 Samsung Galaxy S24 Ultra',
      '⚡ OnePlus 12 5G (Best Value)'
    ]
  },
  {
    keywords: ['s24', 'galaxy phone', 'samsung phone', 'ultra phone'],
    filter: { categorySlug: 'mobiles', name: /s24|samsung/i },
    title: 'Samsung Galaxy Flagships',
    clarifications: [
      '📱 Samsung Galaxy S24 Ultra (200MP)',
      '⚡ OnePlus 12 5G (Best Value)',
      '🍎 Apple iPhone 15 Pro Max'
    ]
  },
  {
    keywords: ['oneplus', 'oneplus 12'],
    filter: { categorySlug: 'mobiles', name: /oneplus/i },
    title: 'OnePlus Flagship Series',
    clarifications: [
      '⚡ OnePlus 12 5G (16GB RAM/512GB)',
      '📸 Google Pixel 8 Pro',
      '📱 Samsung Galaxy S24 Ultra'
    ]
  },
  {
    keywords: ['pixel', 'google pixel', 'google phone'],
    filter: { categorySlug: 'mobiles', name: /pixel/i },
    title: 'Google Pixel AI Phones',
    clarifications: [
      '📸 Google Pixel 8 Pro (Bay Blue)',
      '⚡ OnePlus 12 5G',
      '🍎 iPhone 15 Pro Max'
    ]
  }
];

// Broad Category Definitions
const CATEGORY_MAP = {
  fashion: {
    slug: 'fashion',
    name: 'Fashion & Apparel',
    keywords: ['fashion', 'apparel', 'clothes', 'clothing', 'wear', 'outfit', 'streetwear'],
    defaultClarifications: [
      '👟 Nike Air Jordan 1 Retro Kicks',
      '🧥 Levi’s Vintage Denim Jacket',
      '👕 Adidas Fleece Hoodie',
      '🕶️ Ray-Ban Aviator Sunglasses'
    ]
  },
  mobiles: {
    slug: 'mobiles',
    name: 'Mobiles & Tablets',
    keywords: ['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'cell', 'cellphone', '5g', 'tablet'],
    defaultClarifications: [
      '⚡ OnePlus 12 5G (Best Value ₹59,999)',
      '🍎 Apple iPhone 15 Pro Max',
      '📱 Samsung Galaxy S24 Ultra',
      '📸 Google Pixel 8 Pro'
    ]
  },
  laptops: {
    slug: 'laptops',
    name: 'Laptops & Computers',
    keywords: ['laptop', 'laptops', 'computer', 'computers', 'pc', 'notebook', 'ultrabook', 'workstation'],
    defaultClarifications: [
      '💼 MacBook Air 15 M3 (All-Day Battery)',
      '🎮 ASUS ROG Zephyrus (RTX 4060 Gaming)',
      '💰 Lenovo IdeaPad Slim 5 (Under ₹60K)',
      '⚡ Dell XPS 16 4K OLED'
    ]
  },
  audio: {
    slug: 'audio',
    name: 'Audio & Sound',
    keywords: ['audio', 'sound', 'music', 'headphone', 'headphones', 'earphone', 'earphones', 'earbud', 'earbuds', 'anc', 'speaker'],
    defaultClarifications: [
      '🎧 Sony WH-1000XM5 (Top ANC)',
      '🎵 Apple AirPods Pro 2 (USB-C)',
      '👑 Bose QuietComfort 45 (Plush)',
      '🔊 JBL Flip 6 Waterproof Speaker'
    ]
  },
  watches: {
    slug: 'watches',
    name: 'Smart Watches',
    keywords: ['watch', 'watches', 'smartwatch', 'smartwatches', 'smart watch', 'timepiece', 'tracker', 'fitness tracker'],
    defaultClarifications: [
      '⌚ Fossil Gen 6 Classic (₹14,995)',
      '🔄 Samsung Galaxy Watch 6 Classic',
      '🏃 Garmin Fenix 7 Pro Solar (GPS)',
      '🍏 Apple Watch Ultra 2 Titanium'
    ]
  },
  home: {
    slug: 'home',
    name: 'Home & Living',
    keywords: ['home', 'living', 'decor', 'room', 'house', 'furniture', 'appliance', 'smart home'],
    defaultClarifications: [
      '🪑 Ergonomic High-Back Office Chair',
      '💡 Philips Hue Ambient Lighting',
      '☕ Nespresso Vertuo Barista Coffee',
      '🧹 Dyson V15 Cordless Laser Vacuum'
    ]
  }
};

const CATALOG_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Google', 'Sony', 'Bose', 'JBL',
  'Dell', 'ASUS', 'Lenovo', 'Nike', 'Adidas', "Levi's", 'Ray-Ban',
  'Dyson', 'Philips', 'Nespresso', 'Garmin', 'Fossil', 'Green Soul'
];

const OUT_OF_CATALOG_KEYWORDS = [
  'book', 'books', 'guitar', 'piano', 'instrument', 'perfume', 'fragrance',
  'cosmetic', 'makeup', 'grocery', 'food', 'snack', 'tire', 'car', 'bike',
  'cycle', 'medicine', 'toy', 'bed', 'sofa', 'tv', 'television',
  'refrigerator', 'fridge', 'washing machine'
];

// Vague / Ambiguous queries that need clarifying questions
const VAGUE_QUERY_REGEX = /^(suggest|recommend|help|what|anything|something|gift|present|show me|options|browse|tell me|i want to buy|give me|best products|top items|what do you have)\b/i;

export async function chatConcierge(userId, userMessage, sessionId) {
  // Persist user's message
  await ChatMessage.create({
    userId,
    sessionId,
    role: 'user',
    content: userMessage
  });

  const rawQuery = userMessage.toLowerCase().trim();
  let matchedProducts = [];
  let reply = '';
  let followUpQuestions = [];
  let maxBudget = null;

  // 1. Parse Budget / Price (e.g. "under 30000", "below 60k", "under 1.5 lakh")
  const kMatch = rawQuery.match(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  const lakhMatch = rawQuery.match(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)\b/i);
  const rawNumMatch = rawQuery.match(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d{4,7})\b/i);

  if (kMatch) {
    maxBudget = parseFloat(kMatch[1]) * 1000;
  } else if (lakhMatch) {
    maxBudget = parseFloat(lakhMatch[1]) * 100000;
  } else if (rawNumMatch) {
    maxBudget = parseInt(rawNumMatch[1], 10);
  }

  // 2. Check for out-of-catalog items
  const isOutOfCatalog = OUT_OF_CATALOG_KEYWORDS.some(k => {
    const r = new RegExp(`\\b${k}s?\\b`, 'i');
    return r.test(rawQuery);
  });

  if (isOutOfCatalog) {
    reply = `We currently do not stock that item in our boutique catalog. Our certified collections specialize in:\n\n• **Mobiles & Tablets** (Apple, Samsung, OnePlus, Google)\n• **Laptops & Computers** (Apple MacBook, Dell XPS, ASUS ROG, Lenovo)\n• **Audio & Sound** (Sony, Apple AirPods, Bose, JBL)\n• **Smart Watches** (Apple Watch, Galaxy Watch, Garmin, Fossil)\n• **Fashion & Footwear** (Nike Air Jordans, Levi's, Adidas, Ray-Ban)\n• **Home & Living** (Dyson, Philips Hue, Nespresso, Ergonomic Chairs)\n\nWhich of these collections would you like me to recommend?`;
    followUpQuestions = [
      '👟 Luxury Sneakers & Streetwear',
      '📱 Flagship 5G Mobiles',
      '💻 High Performance Laptops',
      '🎧 Wireless Noise Canceling Audio'
    ];

    const assistantMsg = await ChatMessage.create({
      userId,
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

  // 3. Check for specific sub-product trigger (e.g. "shoes", "hoodie", "coffee", "airpods", "gaming laptop")
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
    if (new RegExp(`\\b${b.toLowerCase()}\\b`, 'i').test(rawQuery) || (b.toLowerCase() === "levi's" && /\blevis?\b/i.test(rawQuery))) {
      matchedBrand = b;
      break;
    }
  }

  // 6. Check for Deals / Discount Queries
  const isDealsQuery = /discount|deal|deals|offer|offers|cheap|cheapest|sale|promo|bargain|lowest price/i.test(rawQuery);

  // EXECUTION PATH A: Specific Sub-product Trigger (e.g. user asked for "shoes" or "hoodie" or "airpods")
  if (matchedSubTrigger) {
    const filter = { ...matchedSubTrigger.filter, active: true };
    if (matchedBrand) filter.brand = new RegExp(matchedBrand, 'i');
    if (maxBudget) filter.discountedPrice = { $lte: maxBudget };

    matchedProducts = await Product.find(filter)
      .sort({ ratingAverage: -1, discountPercent: -1 })
      .limit(4);

    // If budget was requested but no product matched under budget
    if (maxBudget && matchedProducts.length === 0) {
      const affordable = await Product.find({ ...matchedSubTrigger.filter, active: true })
        .sort({ discountedPrice: 1 })
        .limit(2);
      
      if (affordable.length > 0) {
        matchedProducts = affordable;
        reply = `In our **${matchedSubTrigger.title}** collection, verified authentic items start from ₹${affordable[0].discountedPrice.toLocaleString()}. Here are the closest **Recommended** options for you:`;
      } else {
        matchedProducts = await Product.find({ categorySlug: matchedSubTrigger.filter.categorySlug, active: true }).limit(3);
        reply = `Here are our top **Recommended** alternatives in this department:`;
      }
    } else {
      reply = `Here are our **Recommended** picks for **${matchedSubTrigger.title}**! Each verified for authentic quality and guaranteed delivery:`;
    }

    followUpQuestions = matchedSubTrigger.clarifications;
  }
  // EXECUTION PATH B: Broad Category Trigger (e.g. user asked for "phones", "laptops", "audio", "fashion", "home")
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

      reply = `In our curated **${matchedCategory.name}** collection, verified models start at ₹${lowestPrice.toLocaleString()} (${affordable[0]?.name || ''}). Here are our closest **Recommended** options:`;
      followUpQuestions = [
        `⭐ Best Value in ${matchedCategory.name}`,
        `💰 Alternative Items Under ₹${maxBudget.toLocaleString()}`,
        `🔥 Highest Discounts in ${matchedCategory.name}`
      ];
    } else {
      const budgetNote = maxBudget ? ` under ₹${maxBudget.toLocaleString()}` : '';
      const brandNote = matchedBrand ? ` from ${matchedBrand}` : '';
      reply = `Here are our top **Recommended** picks for **${matchedCategory.name}**${brandNote}${budgetNote}, hand-matched to your request:`;
      followUpQuestions = matchedCategory.defaultClarifications;
    }
  }
  // EXECUTION PATH C: Brand Search without Category (e.g. "Apple", "Nike", "Sony", "Samsung")
  else if (matchedBrand) {
    matchedProducts = await Product.find({ brand: new RegExp(matchedBrand, 'i'), active: true })
      .sort({ ratingAverage: -1, discountPercent: -1 })
      .limit(4);

    reply = `Here are our top **Recommended** authentic products from **${matchedBrand}**:`;
    followUpQuestions = [
      `🔥 Show ${matchedBrand} with Highest Discounts`,
      `⭐ Show Top-Rated ${matchedBrand} Item`,
      `📱 Compare ${matchedBrand} with Flagships`
    ];
  }
  // EXECUTION PATH D: Deals & Discounts Query
  else if (isDealsQuery) {
    matchedProducts = await Product.find({ active: true })
      .sort({ discountPercent: -1, ratingAverage: -1 })
      .limit(4);

    reply = `Here are our top **Recommended** mega-deal highlights across the store featuring discounts up to **42%+ OFF**:`;
    followUpQuestions = [
      '👟 Fashion & Sneaker Deals (40%+ OFF)',
      '🎧 Audio & Headphones Offers',
      '⌚ Smartwatch Deals',
      '💻 Laptop Promotions'
    ];
  }
  // EXECUTION PATH E: Vague / Ambiguous / Clarification Required Query
  else if (VAGUE_QUERY_REGEX.test(rawQuery) || rawQuery.length < 15) {
    matchedProducts = await Product.find({ active: true, isFeatured: true })
      .sort({ ratingAverage: -1 })
      .limit(3);

    reply = `I'd love to help you find the perfect product! To help me recommend the exact right match, could you clarify:\n\n1. **Which category are you shopping for?** (Smartphones, Laptops, Audio/Headphones, Smartwatches, Sneakers/Fashion, or Home Living)\n2. **Who is this for or what is the primary use?**\n3. **Do you have a target budget in mind?**\n\nMeanwhile, here are today's top **Recommended** editor picks:`;
    followUpQuestions = [
      '👟 Luxury Sneakers & Streetwear',
      '📱 Flagship 5G Smartphones',
      '💻 Laptops for Work & Gaming',
      '🎧 Noise Canceling Audio & Earbuds'
    ];
  }
  // EXECUTION PATH F: Keyword Fallback
  else {
    const cleanWords = cleanText(rawQuery).split(' ').filter(w => w.length > 2 && !['want', 'need', 'show', 'give', 'best', 'good', 'some', 'look', 'looking', 'tell', 'help'].includes(w));
    
    if (cleanWords.length > 0) {
      const orConditions = [];
      cleanWords.forEach(w => {
        const reg = new RegExp(w, 'i');
        orConditions.push({ name: reg }, { brand: reg }, { shortInfo: reg }, { categorySlug: reg });
      });

      matchedProducts = await Product.find({ active: true, $or: orConditions })
        .sort({ ratingAverage: -1 })
        .limit(4);
    }

    if (matchedProducts.length > 0) {
      reply = `Based on your request, here are our top **Recommended** items from our catalog. Click any card to check specs & delivery:`;
      followUpQuestions = [
        '💰 Filter by price / budget range',
        '⭐ Show top-rated buyer favorites',
        '🔥 Check highest discounts'
      ];
    } else {
      matchedProducts = await Product.find({ active: true, isFeatured: true })
        .sort({ ratingAverage: -1 })
        .limit(3);

      reply = `I could not find an exact keyword match, but here are our top **Recommended** trending products. What specific category or brand can I find for you?`;
      followUpQuestions = [
        '👟 Explore Sneakers & Apparel',
        '📱 Explore Flagship 5G Mobiles',
        '💻 Explore Laptops & Workstations',
        '🎧 Explore Wireless Audio'
      ];
    }
  }

  // 7. Format Recommendations with explicit "Recommended" badge & dynamic reason
  const productRecommendations = matchedProducts.map((p, idx) => {
    const badge = idx === 0 ? '⭐ Top Recommendation' : '⭐ Recommended Pick';
    const reason = generateRecommendationReason(p, maxBudget);

    return {
      productId: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] || '',
      price: p.discountedPrice,
      originalPrice: p.price,
      discountPercent: p.discountPercent,
      recommendationBadge: badge,
      recommendedReason: reason
    };
  });

  // Persist assistant message
  const assistantMsg = await ChatMessage.create({
    userId,
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

function generateRecommendationReason(product, maxBudget) {
  if (product.discountPercent >= 30) {
    return `Special Deal: ${product.discountPercent}% OFF original price • Rated ${product.ratingAverage || 4.8}★`;
  }
  if (product.categorySlug === 'mobiles') {
    if (product.name.includes('iPhone')) return 'Titanium design with A17 Pro performance & Apple Ecosystem';
    if (product.name.includes('S24 Ultra')) return '200MP Camera with Galaxy AI and embedded S-Pen stylus';
    if (product.name.includes('OnePlus')) return 'Best flagship value with 16GB RAM, 512GB storage & 100W charging';
    if (product.name.includes('Pixel')) return 'Industry-leading computational photography and clean Google AI';
    return 'Certified 5G flagship with vivid display and high battery endurance';
  }
  if (product.categorySlug === 'laptops') {
    if (product.name.includes('MacBook')) return 'All-day 18-hour battery life with silent, cool M3 performance';
    if (product.name.includes('ROG')) return '240Hz ROG Nebula OLED display with RTX 4060 dedicated graphics';
    if (product.name.includes('XPS')) return '4K Touch OLED with Intel Core Ultra 9 for elite creator workloads';
    if (product.name.includes('Lenovo')) return 'Best budget ultrabook with Ryzen 7, 16GB RAM & 512GB SSD';
    return 'High-performance computing with fast NVMe storage';
  }
  if (product.categorySlug === 'audio') {
    if (product.name.includes('Sony')) return 'Industry-leading Active Noise Cancellation with LDAC Hi-Res acoustics';
    if (product.name.includes('AirPods')) return 'H2 chip with Adaptive Audio, Transparency mode & MagSafe USB-C';
    if (product.name.includes('Bose')) return 'World-renowned acoustic comfort and signature balanced EQ';
    if (product.name.includes('JBL')) return 'IP67 waterproof rugged build with 12h playtime and deep bass';
    return 'Precision tuned audio with seamless wireless connectivity';
  }
  if (product.categorySlug === 'watches') {
    if (product.name.includes('Apple Watch Ultra')) return 'Aerospace-grade 49mm titanium with 36h multi-day battery & dive ready';
    if (product.name.includes('Galaxy Watch')) return 'Physical rotating bezel with ECG, blood pressure & LTE independence';
    if (product.name.includes('Garmin')) return 'Power Glass solar charging with multi-continent topographic GPS maps';
    if (product.name.includes('Fossil')) return 'Smoke stainless steel mesh classic luxury styling with WearOS';
    return 'Precision health monitoring and smart notification sync';
  }
  if (product.categorySlug === 'fashion') {
    if (product.name.includes('Jordan')) return 'Grail collector Chicago colorway with authentic verification assurance';
    if (product.name.includes('Trucker') || product.name.includes("Levi's")) return 'Timeless rugged 100% cotton denim build with 40% discount';
    if (product.name.includes('Ray-Ban')) return 'Classic gold frame with polarized green G-15 high contrast lenses';
    if (product.name.includes('Hoodie') || product.name.includes('Adidas')) return 'Heavyweight cotton-fleece French terry for all-day streetwear comfort';
    return 'Premium designer apparel with verified materials';
  }
  if (product.categorySlug === 'home') {
    if (product.name.includes('Dyson')) return 'Laser dust illumination and piezo sensor deep cordless suction';
    if (product.name.includes('Philips')) return '16 million ambient smart colors with voice & app home automation';
    if (product.name.includes('Nespresso')) return 'Centrifusion technology for rich crema espresso in under 30 seconds';
    if (product.name.includes('Chair')) return 'Ergonomic lumbar support with 3D armrests for long desk sessions';
    return 'Modern luxury enhancement for smart living spaces';
  }
  return `Verified Authentic • Rated ${product.ratingAverage || 4.8}★ by luxury shoppers`;
}

function cleanText(text) {
  return text.replace(/[^\w\s]/gi, '').trim();
}
