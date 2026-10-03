import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';
import { Banner } from '../models/Banner.js';
import { Category } from '../models/Category.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { Review } from '../models/Review.js';

// 1. Executive Dashboard KPIs
export async function getDashboardSummary(req, res) {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['ORDER_PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'] } });

    // Calculate revenue
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Low stock alerts (< 5 units)
    const lowStockCount = await Product.countDocuments({ stockQuantity: { $lt: 5 }, active: true });
    const lowStockProducts = await Product.find({ stockQuantity: { $lt: 5 }, active: true }).limit(5);

    // Total registered users
    const totalUsers = await User.countDocuments({ role: 'customer', status: 'active' });

    // Recent 5 orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        deliveredOrders,
        pendingOrders,
        totalUsers,
        lowStockCount,
        lowStockProducts,
        recentOrders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Orders Table: Strictly 10 Orders Per Page
export async function getAdminOrders(req, res) {
  try {
    const { page = 1, status } = req.query;
    const limit = 10; // Exactly 10 per page as mandated
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Update Order Status (Accept, Reject, Mark Shipped, Mark Delivered)
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    const validStatuses = ['ORDER_PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status specified.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status.replace(/_/g, ' ')} by Store Admin.`
    });

    await order.save();
    return res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Product CRUD - Create
export async function createProduct(req, res) {
  try {
    const {
      name,
      slug,
      description,
      shortInfo,
      brand,
      category,
      categoryId,
      categorySlug,
      images,
      originalPrice,
      discountedPrice,
      stockQuantity,
      specs
    } = req.body;

    const catSlug = categorySlug || category || 'electronics';
    let cat = await Category.findOne({ slug: catSlug });
    if (!cat) {
      cat = await Category.findOne();
    }

    const resolvedCategoryId = categoryId || cat?._id;
    const resolvedBrand = brand || (name ? name.split(' ')[0] : 'Exclusive');
    const resolvedShortInfo = shortInfo || description || 'Verified authentic luxury quality';
    const resolvedCategorySlug = cat?.slug || catSlug;

    const discountPercent = Math.round(((Number(originalPrice) - Number(discountedPrice)) / Number(originalPrice)) * 100);
    const baseSlug = (slug || name || 'product').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const product = await Product.create({
      name,
      slug: uniqueSlug,
      description: description || 'Verified authentic luxury quality',
      shortInfo: resolvedShortInfo,
      brand: resolvedBrand,
      categoryId: resolvedCategoryId,
      categorySlug: resolvedCategorySlug,
      images: (images && images.length > 0) ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      discountPercent: Math.max(0, discountPercent),
      stockQuantity: Number(stockQuantity) || 10,
      specs: specs || {}
    });

    return res.status(201).json({ success: true, message: 'Product created successfully!', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Product CRUD - Update
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.originalPrice && updates.discountedPrice) {
      updates.discountPercent = Math.round(((updates.originalPrice - updates.discountedPrice) / updates.originalPrice) * 100);
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json({ success: true, message: 'Product updated successfully!', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Product CRUD - Delete
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, { active: false });
    return res.status(200).json({ success: true, message: 'Product deleted (deactivated).' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Coupon Generator
export async function createCoupon(req, res) {
  try {
    const { code, discountPercentage, minOrderValue, maxDiscountAmount, expiresAt, usageLimit } = req.body;

    if (!code || !discountPercentage || !expiresAt) {
      return res.status(400).json({ success: false, message: 'Code, discount percentage, and expiry date are required.' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountPercentage: Number(discountPercentage),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscountAmount: null,
      expiresAt: new Date(expiresAt),
      usageLimit: Number(usageLimit || 100),
      active: true
    });

    return res.status(201).json({ success: true, message: `Coupon '${coupon.code}' created!`, data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. List Coupons
export async function getCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Delete Coupon
export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. List Users
export async function getUsers(req, res) {
  try {
    const users = await User.find({ role: 'customer' }).select('-passwordHash').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 11. Delete / Deactivate User
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, {
      status: 'deleted',
      name: 'Anonymized Account'
    });
    return res.status(200).json({ success: true, message: 'User account has been deactivated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 12. Broadcast Deal Notification
export async function broadcastDeal(req, res) {
  try {
    const { title, message, targetUrl = '/products', dealTag = 'FLASH SALE' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notification = await Notification.create({
      title,
      message,
      targetUrl,
      dealTag,
      audience: 'all',
      createdBy: req.user._id
    });

    // If socket server is available, emit event
    const io = req.app.get('io');
    if (io) {
      io.emit('deal_notification', notification);
    }

    return res.status(201).json({ success: true, message: 'Deal notification broadcasted!', data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 13. One-Click Orders & Payment Settlement Export (CSV format)
export async function exportOrdersReport(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    let csv = 'Order No,Invoice No,Date,Customer,Total Amount,Payment Mode,Payment Status,Order Status,Pincode\n';
    orders.forEach(o => {
      const date = new Date(o.createdAt).toISOString().split('T')[0];
      const customer = `"${(o.shippingAddress?.fullName || 'Customer').replace(/"/g, '""')}"`;
      const pin = o.shippingAddress?.pincode || '';
      csv += `${o.orderNo},${o.invoiceNo},${date},${customer},${o.pricing.total},${o.paymentMethod},${o.paymentStatus},${o.orderStatus},${pin}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=E-Shop_Orders_Settlement_Report.csv');
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 14. Admin Banners - List
export async function getAdminBanners(req, res) {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 15. Admin Banners - Create
export async function createAdminBanner(req, res) {
  try {
    const { title, subtitle, discountTag, imageUrl, targetSlug, displayOrder = 0 } = req.body;
    if (!title || !imageUrl || !targetSlug) {
      return res.status(400).json({ success: false, message: 'Title, Image URL, and Target Slug are required.' });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      discountTag: discountTag || 'FLAT 50% OFF',
      imageUrl,
      targetSlug,
      displayOrder: Number(displayOrder || 0),
      active: true
    });

    const io = req.app.get('io');
    if (io) io.emit('banners_updated', banner);

    return res.status(201).json({ success: true, message: 'Banner created successfully!', data: banner });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 16. Admin Banners - Update
export async function updateAdminBanner(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });

    const io = req.app.get('io');
    if (io) io.emit('banners_updated', banner);

    return res.status(200).json({ success: true, message: 'Banner updated!', data: banner });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 17. Admin Banners - Delete
export async function deleteAdminBanner(req, res) {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) io.emit('banners_updated', { deletedId: id });

    return res.status(200).json({ success: true, message: 'Banner removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 18. Deep Analytics & Sales Breakdown
export async function getAnalytics(req, res) {
  try {
    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$categorySlug', count: { $sum: 1 }, totalStock: { $sum: '$stockQuantity' } } }
    ]);

    // Order status breakdown
    const orderStatuses = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 }, totalVal: { $sum: '$pricing.total' } } }
    ]);

    // Stock health breakdown
    const outOfStock = await Product.countDocuments({ stockQuantity: 0, active: true });
    const lowStock = await Product.countDocuments({ stockQuantity: { $gt: 0, $lt: 5 }, active: true });
    const healthyStock = await Product.countDocuments({ stockQuantity: { $gte: 5 }, active: true });

    return res.status(200).json({
      success: true,
      data: {
        categoryDistribution,
        orderStatuses,
        stockHealth: {
          outOfStock,
          lowStock,
          healthyStock
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 19. Category Management - List All
export async function getAdminCategories(req, res) {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: 1 });
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ categorySlug: cat.slug, active: true });
        return {
          ...cat.toObject(),
          productCount
        };
      })
    );
    return res.status(200).json({ success: true, data: categoriesWithCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 20. Category Management - Create
export async function createAdminCategory(req, res) {
  try {
    const { name, slug, imageUrl, discountTag, description, displayOrder } = req.body;
    if (!name || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Category name and image URL are required.' });
    }
    const cleanSlug = (slug || name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(409).json({ success: false, message: `Category with slug '${cleanSlug}' already exists.` });
    }
    const category = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      imageUrl: imageUrl.trim(),
      discountTag: discountTag || 'Up to 50% Off',
      description: description || '',
      displayOrder: Number(displayOrder || 0),
      active: true
    });

    const io = req.app.get('io');
    if (io) io.emit('categories_updated', category);

    return res.status(201).json({ success: true, message: 'Category created successfully!', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 21. Category Management - Update
export async function updateAdminCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, imageUrl, discountTag, description, displayOrder, active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (slug !== undefined) updates.slug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (discountTag !== undefined) updates.discountTag = discountTag.trim();
    if (description !== undefined) updates.description = description;
    if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);
    if (active !== undefined) updates.active = Boolean(active);

    const category = await Category.findByIdAndUpdate(id, updates, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const io = req.app.get('io');
    if (io) io.emit('categories_updated', category);

    return res.status(200).json({ success: true, message: 'Category updated successfully!', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 22. Category Management - Delete
export async function deleteAdminCategory(req, res) {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    await Category.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) io.emit('categories_updated', { deletedId: id });

    return res.status(200).json({ success: true, message: `Category '${cat.name}' removed.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 23. Store Settings & Live Announcement - Get
export async function getStoreSettings(req, res) {
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

// 24. Store Settings & Live Announcement - Update
export async function updateStoreSettings(req, res) {
  try {
    const {
      announcementText,
      activePromoCode,
      freeShippingMinAmount,
      shippingFee,
      supportPhone,
      supportEmail
    } = req.body;

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings({});
    }

    if (announcementText !== undefined) settings.announcementText = announcementText.trim();
    if (activePromoCode !== undefined) settings.activePromoCode = activePromoCode.trim().toUpperCase();
    if (freeShippingMinAmount !== undefined) settings.freeShippingMinAmount = Number(freeShippingMinAmount);
    if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
    if (supportPhone !== undefined) settings.supportPhone = supportPhone.trim();
    if (supportEmail !== undefined) settings.supportEmail = supportEmail.trim();

    await settings.save();

    const io = req.app.get('io');
    if (io) io.emit('settings_updated', settings);

    return res.status(200).json({ success: true, message: 'Store settings and live banner ticker updated!', data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 25. Review Moderation - List All
export async function getAdminReviews(req, res) {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name slug images discountedPrice')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 26. Review Moderation - Delete Moderated Review
export async function deleteAdminReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(id);

    // Recalculate product rating average and count
    const remaining = await Review.find({ productId });
    const count = remaining.length;
    const newAverage = count > 0 ? Math.round((remaining.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10 : 5.0;

    await Product.findByIdAndUpdate(productId, {
      ratingAverage: newAverage,
      reviewCount: count
    });

    const io = req.app.get('io');
    if (io) io.emit('review_deleted', { reviewId: id, productId });

    return res.status(200).json({ success: true, message: 'Review deleted and product ratings recalculated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

