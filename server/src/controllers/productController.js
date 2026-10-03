import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Banner } from '../models/Banner.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { estimateDelivery } from '../services/pincodeService.js';
import { getRecommendations, smartSearch } from '../services/aiService.js';

// 0. Get Active Public Store Settings (Announcement bar, promo hints, shipping thresholds)
export async function getStoreSettingsPublic(req, res) {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        announcementText: '⚡ FLASH OFFER: Enjoy Free Express Delivery to PIN 560035 on orders above ₹499 • Use Code SAVE10',
        activePromoCode: 'SAVE10',
        freeShippingMinAmount: 499,
        shippingFee: 49,
        supportPhone: '+91 800-456-7890',
        supportEmail: 'concierge@eshop.luxury'
      });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 1. Get Auto-Swiping Hero Carousel Banners
export async function getBanners(req, res) {
  try {
    const banners = await Banner.find({ active: true }).sort({ displayOrder: 1 });
    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Get Visual Category Boxes with Images
export async function getCategories(req, res) {
  try {
    const categories = await Category.find({ active: true }).sort({ displayOrder: 1 });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Catalog Listing with Filters & Multi-Sorting
export async function getProducts(req, res) {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      inStock,
      sort,
      search,
      page = 1,
      limit = 24
    } = req.query;

    const query = { active: true };

    if (category && category !== 'all') {
      query.categorySlug = category;
    }

    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.ratingAverage = { $gte: Number(minRating) };
    }

    if (minDiscount) {
      query.discountPercent = { $gte: Number(minDiscount) };
    }

    if (inStock === 'true' || inStock === true) {
      query.stockQuantity = { $gt: 0 };
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { shortInfo: regex },
        { description: regex }
      ];
    }

    // Sorting
    const normalizedSort = (sort || '').replace(/-/g, '_');
    let sortOptions = { createdAt: -1 }; // default newest
    if (normalizedSort === 'oldest') sortOptions = { createdAt: 1 };
    else if (normalizedSort === 'price_asc') sortOptions = { discountedPrice: 1 };
    else if (normalizedSort === 'price_desc') sortOptions = { discountedPrice: -1 };
    else if (normalizedSort === 'rating_desc') sortOptions = { ratingAverage: -1 };
    else if (normalizedSort === 'discount_desc') sortOptions = { discountPercent: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Product Detail View
export async function getProductBySlug(req, res) {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, active: true }).populate('categoryId');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. 12-Product AI Recommendations Grid (3x4)
export async function getRecommendationsGrid(req, res) {
  try {
    const userId = req.user ? req.user._id : null;
    const products = await getRecommendations(userId);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Smart AI Search Endpoint
export async function searchProductsAI(req, res) {
  try {
    const { q } = req.query;
    const products = await smartSearch(q);
    return res.status(200).json({ success: true, data: products, query: q });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Pincode Delivery Estimator
export async function checkDelivery(req, res) {
  try {
    const { pincode, subtotal = 0 } = req.body;
    const result = estimateDelivery(pincode, subtotal);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
