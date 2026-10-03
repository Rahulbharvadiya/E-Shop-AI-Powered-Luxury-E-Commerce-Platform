import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

// 1. Get Reviews for Product
export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    const total = reviews.length;
    let average = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (total > 0) {
      const sum = reviews.reduce((acc, r) => {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        return acc + r.rating;
      }, 0);
      average = Math.round((sum / total) * 10) / 10;
    }

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        total,
        average,
        distribution
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

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, title, and comment are required.' });
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
        message: 'Only verified purchasers who have received this product can write a review.'
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
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase: true
    });

    // Recalculate product rating average
    const allReviews = await Review.find({ productId });
    const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(newAverage * 10) / 10,
      reviewCount: allReviews.length
    });

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
