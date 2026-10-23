import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

// 1. Get Reviews for Product with Pagination (P2-6)
export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));

    const total = await Review.countDocuments({ productId });
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Distribution aggregation
    const distributionAgg = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    distributionAgg.forEach(item => {
      distribution[item._id] = item.count;
      sum += item._id * item.count;
    });

    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 5.0;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        total,
        average,
        distribution
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Submit Review (Verified Buyer Gate)
export async function createReview(req, res) {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    if (!title || !comment) {
      return res.status(400).json({ success: false, message: 'Review title and comment are required.' });
    }

    // STRICT VERIFICATION CHECK:
    // User must have an order with status 'DELIVERED' containing this productId
    const verifiedOrder = await Order.findOne({
      userId,
      orderStatus: 'DELIVERED',
      'items.productId': productId
    });

    if (!verifiedOrder) {
      return res.status(403).json({
        success: false,
        message: 'Only verified purchasers who have received delivery of this product can write a review.'
      });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ productId, userId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted a review for this product.' });
    }

    const review = await Review.create({
      productId,
      userId,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating: numRating,
      title: String(title).trim(),
      comment: String(comment).trim(),
      isVerifiedPurchase: true
    });

    // Efficiently recalculate product rating average
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avg: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      const avg = Math.round((stats[0].avg / stats[0].count) * 10) / 10;
      await Product.findByIdAndUpdate(productId, {
        ratingAverage: avg,
        reviewCount: stats[0].count
      });
    }

    // Real-time broadcast if socket.io is active
    const io = req.app.get('io');
    if (io) {
      io.emit(`new_review_${productId}`, review);
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: review
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
