import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';
import { Banner } from '../models/Banner.js';
import { Category } from '../models/Category.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { Review } from '../models/Review.js';
import { anonymizeUser } from '../utils/userUtils.js';

// State machine allowed transitions for orders (P1-2)
const ALLOWED_ADMIN_TRANSITIONS = {
  ORDER_PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [], // Terminal state
  CANCELLED: []  // Terminal state
};

// 1. Executive Dashboard KPIs
export async function getDashboardSummary(req, res) {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['ORDER_PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'] }
    });

    // Calculate revenue from settled orders
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

// 2. Orders Table: Paginated Orders (Default 10 per page)
export async function getAdminOrders(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: orders,
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

// 3. Update Order Status with Strict State Machine & Auto-Restock on Admin Cancel (P1-2)
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Verify allowed state machine transition
    const allowed = ALLOWED_ADMIN_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Illegal transition: Cannot move order from '${order.orderStatus}' to '${status}'. Allowed transitions: [${allowed.join(', ') || 'None - Terminal state'}]`
      });
    }

    order.orderStatus = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    // If admin cancels the order, restock items and initiate refund if paid
    if (status === 'CANCELLED') {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.productId }, { $inc: { stockQuantity: item.quantity } });
      }
      if (order.couponCode) {
        await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: -1 } });
      }
      if (order.paymentStatus === 'PAID') {
        order.paymentStatus = 'REFUNDED';
      }
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status.replace(/_/g, ' ')} by Store Admin.`
    });

    await order.save();

    // Private notification to the specific customer's room via Socket.IO (P1-11)
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.userId}`).emit('order_status_updated', {
        orderId: order._id,
        orderNo: order.orderNo,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus
      });
    }

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
      categoryId,
      categorySlug,
      images,
      originalPrice,
      discountedPrice,
      stockQuantity,
      specs
    } = req.body;

    if (!name || originalPrice === undefined || discountedPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Name, original price, and discounted price are required.' });
    }

    const orig = Number(originalPrice);
    const disc = Number(discountedPrice);
    if (orig < 0 || disc < 0 || disc > orig) {
      return res.status(400).json({ success: false, message: 'Prices must be non-negative and discounted price cannot exceed original price.' });
    }

    const discountPercent = orig > 0 ? Math.round(((orig - disc) / orig) * 100) : 0;
    const baseSlug = (slug || name || 'product').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const product = await Product.create({
      name: name.trim(),
      slug: uniqueSlug,
      description: description || 'Verified authentic luxury quality',
      shortInfo: shortInfo || 'Luxury product',
      brand: brand || 'E-Shop Signature',
      categoryId: categoryId || null,
      categorySlug: categorySlug || 'general',
      images: (images && images.length > 0) ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      originalPrice: orig,
      discountedPrice: disc,
      discountPercent,
      stockQuantity: Math.max(0, Number(stockQuantity) || 10),
      specs: specs || {}
    });

    return res.status(201).json({ success: true, message: 'Product created successfully!', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Product CRUD - Update with Mass-Assignment Whitelist & Recalculated Discount (P0-9)
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Whitelist allowed updatable fields (P0-9)
    const allowedFields = [
      'name', 'description', 'shortInfo', 'brand',
      'categoryId', 'categorySlug', 'images',
      'originalPrice', 'discountedPrice', 'stockQuantity',
      'specs', 'active'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Validate prices and stock
    const newOrig = updates.originalPrice !== undefined ? Number(updates.originalPrice) : existingProduct.originalPrice;
    const newDisc = updates.discountedPrice !== undefined ? Number(updates.discountedPrice) : existingProduct.discountedPrice;

    if (newOrig < 0 || newDisc < 0 || newDisc > newOrig) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pricing: prices cannot be negative and discounted price cannot exceed original price.'
      });
    }

    if (updates.stockQuantity !== undefined && Number(updates.stockQuantity) < 0) {
      return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative.' });
    }

    // Recompute discount percentage server-side
    updates.discountPercent = newOrig > 0 ? Math.round(((newOrig - newDisc) / newOrig) * 100) : 0;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({ success: true, message: 'Product updated successfully!', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Product CRUD - Delete (Deactivate)
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    await Product.findByIdAndUpdate(id, { active: false });
    return res.status(200).json({ success: true, message: 'Product deactivated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Coupon Generator with Max Discount Cap (P1-1)
export async function createCoupon(req, res) {
  try {
    const { code, discountPercentage, minOrderValue, maxDiscountAmount, expiresAt, usageLimit } = req.body;

    if (!code || !discountPercentage || !expiresAt) {
      return res.status(400).json({ success: false, message: 'Code, discount percentage, and expiry date are required.' });
    }

    const pct = Number(discountPercentage);
    if (pct < 1 || pct > 90) {
      return res.status(400).json({ success: false, message: 'Discount percentage must be between 1% and 90%.' });
    }

    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      discountPercentage: pct,
      minOrderValue: Math.max(0, Number(minOrderValue || 0)),
      maxDiscountAmount: maxDiscountAmount ? Math.max(1, Number(maxDiscountAmount)) : null,
      expiresAt: new Date(expiresAt),
      usageLimit: Math.max(1, Number(usageLimit || 100)),
      active: true
    });

    return res.status(201).json({ success: true, message: `Coupon '${coupon.code}' created!`, data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. List Coupons with Pagination (P2-8)
export async function getCoupons(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const total = await Coupon.countDocuments();
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: coupons,
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

// 9. Delete Coupon
export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    await Coupon.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. List Users with Pagination (P2-8)
export async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, role = 'customer' } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const query = { status: 'active' };
    if (role && role !== 'all') {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: users,
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

// 11. Delete / Deactivate User with Self-Deletion Guard & Full Anonymization (P2-3)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Guard: Prevent admin self-deletion
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Security Guard: You cannot delete your own active administrator account.'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Guard: Prevent deleting other admins without demotion
    if (targetUser.role?.toLowerCase() === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security Guard: Administrator accounts cannot be deleted directly. Demote role first.'
      });
    }

    // Unified compliant anonymization (P2-3)
    await anonymizeUser(targetUser);

    return res.status(200).json({ success: true, message: 'User account has been safely deactivated and anonymized.' });
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
      title: String(title).trim(),
      message: String(message).trim(),
      targetUrl: String(targetUrl).trim(),
      dealTag: String(dealTag).trim(),
      audience: 'all',
      createdBy: req.user._id
    });

    // Broadcast to public deal channel
    const io = req.app.get('io');
    if (io) {
      io.emit('deal_notification', notification);
    }

    return res.status(201).json({ success: true, message: 'Deal notification broadcasted!', data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 13. CSV Export with Formula Injection Guard (P2-2)
export async function exportOrdersReport(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5000);

    // Neutralize spreadsheet formula injection characters (=, +, -, @, \t, \r)
    const sanitizeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`; // prefix with single quote to treat as plain string
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    let csv = 'Order No,Invoice No,Date,Customer,Total Amount,Payment Mode,Payment Status,Order Status,Pincode\n';
    orders.forEach(o => {
      const date = new Date(o.createdAt).toISOString().split('T')[0];
      const customer = sanitizeCsvCell(o.shippingAddress?.fullName || 'Customer');
      const pin = sanitizeCsvCell(o.shippingAddress?.pincode || '');
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
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

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
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }
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
    const categoryDistribution = await Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$categorySlug', count: { $sum: 1 }, totalStock: { $sum: '$stockQuantity' } } }
    ]);

    const orderStatuses = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 }, totalVal: { $sum: '$pricing.total' } } }
    ]);

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
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

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
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
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
        shippingFee: 40,
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

// 25. Review Moderation - List All with Pagination (P2-8)
export async function getAdminReviews(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('productId', 'name slug images discountedPrice')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: reviews,
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

// 26. Review Moderation - Delete Moderated Review
export async function deleteAdminReview(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

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
