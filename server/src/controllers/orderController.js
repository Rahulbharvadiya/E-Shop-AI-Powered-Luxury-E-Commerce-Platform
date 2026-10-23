import mongoose from 'mongoose';
import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { estimateDeliveryAsync } from '../services/pincodeService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';
import { generateOrderNumber, generateInvoiceNumber } from '../models/Counter.js';
import { env } from '../config/env.js';

// 1. Validate Promo Code
export async function validateCoupon(req, res) {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
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

    const cartSubtotal = Number(subtotal || 0);
    if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of INR ${coupon.minOrderValue} required for this coupon.`
      });
    }

    // Calculate discount amount with percentage and maxDiscountAmount cap (P1-1)
    let discount = Math.round((cartSubtotal * coupon.discountPercentage) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
    if (discount > cartSubtotal) {
      discount = cartSubtotal;
    }

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You save ${coupon.discountPercentage}%${coupon.maxDiscountAmount ? ` up to ₹${coupon.maxDiscountAmount}` : ''}.`,
      data: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: discount,
        maxDiscountAmount: coupon.maxDiscountAmount || null,
        minOrderValue: coupon.minOrderValue || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Checkout / Place Order with Atomic Stock Handling and Transacted Coupon Use
export async function checkout(req, res) {
  let decrementedItems = [];
  let appliedCouponId = null;

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

    // Idempotency check (P2-5)
    const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ userId, idempotencyKey });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: 'Order retrieved via idempotency replay.',
          data: existingOrder
        });
      }
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.line1 || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    // Retrieve or reconstruct cart
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    if (cart.items.length === 0 && Array.isArray(clientItems) && clientItems.length > 0) {
      for (const ci of clientItems) {
        const prodId = ci.productId || ci._id;
        const exists = await Product.findById(prodId);
        if (exists && exists.active) {
          cart.items.push({ productId: exists._id, quantity: Math.min(10, Math.max(1, Number(ci.quantity) || 1)) });
        }
      }
      await cart.save();
      await cart.populate('items.productId');
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Validate active products and compute subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const p = item.productId;
      if (!p || !p.active) {
        return res.status(400).json({ success: false, message: `Product '${p?.name || 'Item'}' is no longer available.` });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = p.discountedPrice * qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: p._id,
        name: p.name,
        image: p.images[0] || '',
        price: p.discountedPrice,
        quantity: qty,
        subtotal: itemTotal
      });
    }

    // Atomic stock decrement with conditional update (P0-6)
    for (const item of orderItems) {
      const updateResult = await Product.updateOne(
        { _id: item.productId, stockQuantity: { $gte: item.quantity }, active: true },
        { $inc: { stockQuantity: -item.quantity } }
      );

      if (updateResult.modifiedCount !== 1) {
        // Rollback already decremented products
        for (const dec of decrementedItems) {
          await Product.updateOne({ _id: dec.productId }, { $inc: { stockQuantity: dec.quantity } });
        }
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for product '${item.name}'. Order could not be placed.`
        });
      }
      decrementedItems.push(item);
    }

    // Coupon discount calculation with atomic increment and limits (P1-1)
    let discount = 0;
    let couponRecord = null;
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const now = new Date();

      couponRecord = await Coupon.findOneAndUpdate(
        {
          code: cleanCode,
          active: true,
          expiresAt: { $gt: now },
          $expr: { $lt: ['$usedCount', '$usageLimit'] }
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (!couponRecord) {
        // Rollback reserved stock
        for (const dec of decrementedItems) {
          await Product.updateOne({ _id: dec.productId }, { $inc: { stockQuantity: dec.quantity } });
        }
        return res.status(400).json({
          success: false,
          message: `Coupon '${couponCode}' is invalid, expired, or has reached maximum usage.`
        });
      }

      appliedCouponId = couponRecord._id;

      if (couponRecord.minOrderValue && subtotal < couponRecord.minOrderValue) {
        // Rollback coupon and stock
        await Coupon.updateOne({ _id: couponRecord._id }, { $inc: { usedCount: -1 } });
        for (const dec of decrementedItems) {
          await Product.updateOne({ _id: dec.productId }, { $inc: { stockQuantity: dec.quantity } });
        }
        return res.status(400).json({
          success: false,
          message: `Minimum order value of INR ${couponRecord.minOrderValue} required for coupon '${couponRecord.code}'.`
        });
      }

      discount = Math.round((subtotal * couponRecord.discountPercentage) / 100);
      if (couponRecord.maxDiscountAmount && discount > couponRecord.maxDiscountAmount) {
        discount = couponRecord.maxDiscountAmount;
      }
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    // Dynamic Delivery calculation reading StoreSettings (P1-4)
    const delivery = await estimateDeliveryAsync(shippingAddress.pincode, subtotal);
    const deliveryFee = delivery.shippingFee;
    const total = Math.max(0, subtotal - discount + deliveryFee);

    // Collision-free monotonic numbering (P1-5)
    const orderNo = await generateOrderNumber();
    const invoiceNo = await generateInvoiceNumber();

    shippingAddress.state = shippingAddress.state || delivery.state || 'Karnataka';

    // Payment Gateway Order Reference (P0-1)
    const isCod = paymentMethod === 'COD';
    const gatewayOrderId = isCod ? null : `rzp_order_${crypto.randomBytes(8).toString('hex')}`;
    const paymentId = isCod ? null : `pay_${crypto.randomBytes(8).toString('hex')}`;

    // Cryptographic signature simulation for verified payment
    const paymentSignature = isCod
      ? null
      : crypto.createHmac('sha256', env.JWT_ACCESS_SECRET)
          .update(`${gatewayOrderId}|${paymentId}`)
          .digest('hex');

    const order = await Order.create({
      orderNo,
      invoiceNo,
      idempotencyKey: idempotencyKey || null,
      userId,
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        deliveryFee,
        total
      },
      couponCode: couponRecord ? couponRecord.code : null,
      paymentMethod,
      paymentGatewayOrderId: gatewayOrderId,
      paymentGatewayPaymentId: paymentId,
      paymentGatewaySignature: paymentSignature,
      paymentStatus: isCod ? 'PENDING' : 'PAID',
      orderStatus: 'ORDER_PLACED',
      timeline: [
        {
          status: 'ORDER_PLACED',
          timestamp: new Date(),
          note: isCod
            ? 'Order placed with Cash on Delivery (Payment pending on arrival).'
            : `Order placed online via ${paymentMethod} (Transaction ID: ${paymentId}).`
        }
      ],
      estimatedDeliveryDate: new Date(Date.now() + delivery.estimatedDays * 24 * 60 * 60 * 1000)
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
  } catch (error) {
    // Failure compensation rollback
    for (const dec of decrementedItems) {
      await Product.updateOne({ _id: dec.productId }, { $inc: { stockQuantity: dec.quantity } });
    }
    if (appliedCouponId) {
      await Coupon.updateOne({ _id: appliedCouponId }, { $inc: { usedCount: -1 } });
    }
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

// 4. Get Order By ID / Tracking (P2-7: Safe ID validation)
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const query = { _id: id };
    if (req.user.role?.toLowerCase() !== 'admin') {
      query.userId = req.user._id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Change Shipping Address with Re-pricing & Strict Timing Gate (P1-3)
export async function updateOrderAddress(req, res) {
  try {
    const { id } = req.params;
    const { shippingAddress } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.line1 || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Valid address details and pincode are required.' });
    }

    const order = await Order.findOne({ _id: id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Critical Policy Gate: Changes permitted only before dispatch (P1-3)
    if (!['ORDER_PLACED', 'CONFIRMED'].includes(order.orderStatus)) {
      return res.status(409).json({
        success: false,
        message: `Delivery address cannot be modified once the order is in '${order.orderStatus.replace(/_/g, ' ')}' stage.`
      });
    }

    // Recalculate delivery fee and ETA for new pincode
    const newDelivery = await estimateDeliveryAsync(shippingAddress.pincode, order.pricing.subtotal);
    const oldFee = order.pricing.deliveryFee;
    const newFee = newDelivery.shippingFee;

    order.shippingAddress = shippingAddress;
    order.pricing.deliveryFee = newFee;
    order.pricing.total = Math.max(0, order.pricing.subtotal - order.pricing.discount + newFee);
    order.estimatedDeliveryDate = new Date(Date.now() + newDelivery.estimatedDays * 24 * 60 * 60 * 1000);

    const feeDifferenceNote = (newFee !== oldFee)
      ? ` Shipping adjusted from ₹${oldFee} to ₹${newFee}.`
      : '';

    order.timeline.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Delivery address updated by customer to PIN ${shippingAddress.pincode}.${feeDifferenceNote}`
    });

    await order.save();
    return res.status(200).json({
      success: true,
      message: 'Delivery address updated and delivery fee recalculated!',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Cancel Order with Atomic Restock, Coupon Reversion, and Refund Handling (P1-2)
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Atomic conditional status update to prevent double-cancellation and duplicate restocking
    const currentOrder = await Order.findOne({ _id: id, userId: req.user._id });
    if (!currentOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!['ORDER_PLACED', 'CONFIRMED'].includes(currentOrder.orderStatus)) {
      return res.status(409).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${currentOrder.orderStatus.replace(/_/g, ' ')}'.`
      });
    }

    const refundApplicable = currentOrder.paymentStatus === 'PAID';
    const newPaymentStatus = refundApplicable ? 'REFUNDED' : currentOrder.paymentStatus;

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
        orderStatus: { $in: ['ORDER_PLACED', 'CONFIRMED'] }
      },
      {
        $set: {
          orderStatus: 'CANCELLED',
          paymentStatus: newPaymentStatus
        },
        $push: {
          timeline: {
            status: 'CANCELLED',
            timestamp: new Date(),
            note: `Order cancelled. Reason: ${reason}.${refundApplicable ? ' Refund of INR ' + currentOrder.pricing.total + ' initiated.' : ''}`
          }
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(409).json({ success: false, message: 'Order status has changed. Cancellation aborted.' });
    }

    // Atomically restock products
    for (const item of updatedOrder.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    // Restore coupon usage count
    if (updatedOrder.couponCode) {
      await Coupon.updateOne(
        { code: updatedOrder.couponCode },
        { $inc: { usedCount: -1 } }
      );
    }

    return res.status(200).json({
      success: true,
      message: refundApplicable
        ? `Order cancelled. A refund of ₹${updatedOrder.pricing.total} has been initiated to your original payment method.`
        : 'Order cancelled successfully and reserved inventory has been restocked.',
      data: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Verify Online Payment Endpoint (P0-1)
export async function verifyPayment(req, res) {
  try {
    const { id } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = await Order.findOne({ _id: id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, message: 'Order is already marked as paid.', data: order });
    }

    // Signature verification
    const expectedSignature = crypto.createHmac('sha256', env.JWT_ACCESS_SECRET)
      .update(`${razorpay_order_id || order.paymentGatewayOrderId}|${razorpay_payment_id || order.paymentGatewayPaymentId}`)
      .digest('hex');

    const isValid = (razorpay_signature === expectedSignature) || (env.NODE_ENV === 'development');

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }

    order.paymentStatus = 'PAID';
    order.paymentGatewayPaymentId = razorpay_payment_id || order.paymentGatewayPaymentId;
    order.paymentGatewaySignature = razorpay_signature || expectedSignature;
    order.timeline.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Online payment verified. Reference ID: ${order.paymentGatewayPaymentId}.`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully!',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Download Invoice PDF
export async function downloadInvoice(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role?.toLowerCase() !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=E-Shop_Invoice_${order.invoiceNo || order._id}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
