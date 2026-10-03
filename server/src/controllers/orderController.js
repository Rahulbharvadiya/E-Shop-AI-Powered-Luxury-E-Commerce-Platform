import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { estimateDelivery } from '../services/pincodeService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomInt(10000, 99999);
  return `ORD-${dateStr}-${rand}`;
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const rand = crypto.randomInt(100000, 999999);
  return `ESH-${year}-${rand}`;
}

// 1. Validate Promo Code
export async function validateCoupon(req, res) {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, active: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or unrecognized coupon code.' });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
    }

    if (subtotal && Number(subtotal) < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of INR ${coupon.minOrderValue} required for this coupon.`
      });
    }

    // Calculate discount amount purely according to percentage
    let discount = Math.round(((subtotal || 0) * coupon.discountPercentage) / 100);
    if (subtotal && discount > subtotal) {
      discount = subtotal;
    }

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You save ${coupon.discountPercentage}%.`,
      data: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: discount,
        minOrderValue: coupon.minOrderValue || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Checkout / Place Order
export async function checkout(req, res) {
  try {
    const { shippingAddress, paymentMethod = 'UPI', couponCode, items: clientItems } = req.body;
    const userId = req.user._id;

    // RBAC Rule: Administrators are restricted from placing retail customer orders
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrative accounts are restricted from placing retail customer orders. Please sign in with a Customer account to make purchases.'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.line1 || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    // Retrieve user's cart
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // If database cart is empty but client passed items, sync them into the cart
    if (cart.items.length === 0 && Array.isArray(clientItems) && clientItems.length > 0) {
      for (const ci of clientItems) {
        const prodId = ci.productId || ci._id;
        const exists = await Product.findById(prodId);
        if (exists && exists.active) {
          cart.items.push({ productId: exists._id, quantity: ci.quantity || 1 });
        }
      }
      await cart.save();
      await cart.populate('items.productId');
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Validate stock and compute totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const p = item.productId;
      if (!p || !p.active) {
        return res.status(400).json({ success: false, message: `Product '${p?.name || 'Item'}' is no longer available.` });
      }

      if (p.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${p.name}'. Only ${p.stockQuantity} remaining.`
        });
      }

      const itemTotal = p.discountedPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: p._id,
        name: p.name,
        image: p.images[0] || '',
        price: p.discountedPrice,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }

    // Coupon discount calculation purely according to percentage
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
      if (appliedCoupon && new Date() <= appliedCoupon.expiresAt && (!appliedCoupon.minOrderValue || subtotal >= appliedCoupon.minOrderValue)) {
        discount = Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
        if (discount > subtotal) {
          discount = subtotal;
        }
        appliedCoupon.usedCount += 1;
        await appliedCoupon.save();
      }
    }

    // Delivery calculation
    const delivery = estimateDelivery(shippingAddress.pincode, subtotal);
    const deliveryFee = delivery.shippingFee;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    const orderNo = generateOrderNumber();
    const invoiceNo = generateInvoiceNumber();

    // Ensure state is populated for shipping address validation
    shippingAddress.state = shippingAddress.state || delivery.state || 'Karnataka';

    const order = await Order.create({
      orderNo,
      invoiceNo,
      userId,
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        deliveryFee,
        total
      },
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'ORDER_PLACED',
      timeline: [
        {
          status: 'ORDER_PLACED',
          timestamp: new Date(),
          note: 'Order successfully placed by customer.'
        }
      ],
      estimatedDeliveryDate: new Date(Date.now() + delivery.estimatedDays * 24 * 60 * 60 * 1000)
    });

    // Decrement inventory stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Get My Orders
export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Get Order By ID / Tracking
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      _id: id,
      $or: [{ userId: req.user._id }, { userId: { $exists: true } }] // allow if own or admin
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Change Shipping Address (Locked if OUT_FOR_DELIVERY or DELIVERED)
export async function updateOrderAddress(req, res) {
  try {
    const { id } = req.params;
    const { shippingAddress } = req.body;

    const order = await Order.findOne({ _id: id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // CRITICAL POLICY GATE:
    if (['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(409).json({
        success: false,
        message: `Address cannot be changed because the order is already ${order.orderStatus.toLowerCase().replace(/_/g, ' ')}.`
      });
    }

    order.shippingAddress = shippingAddress;
    order.timeline.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Delivery address updated by customer to PIN ${shippingAddress.pincode}.`
    });

    await order.save();
    return res.status(200).json({ success: true, message: 'Delivery address updated successfully!', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Cancel Order (Locked if OUT_FOR_DELIVERY or DELIVERED)
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = await Order.findOne({ _id: id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // CRITICAL POLICY GATE:
    if (['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(409).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase().replace(/_/g, ' ')}.`
      });
    }

    order.orderStatus = 'CANCELLED';
    order.timeline.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Order cancelled. Reason: ${reason}`
    });

    await order.save();

    // Restock products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. If paid online, your refund will be processed within 3-5 days.',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Download Invoice PDF
export async function downloadInvoice(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=E-Shop_Invoice_${order.invoiceNo || order._id}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
