import { Router } from 'express';
import {
  validateCoupon,
  checkout,
  getMyOrders,
  getOrderById,
  updateOrderAddress,
  cancelOrder,
  downloadInvoice
} from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Coupon validation (accessible to both guest and authenticated shoppers)
router.post('/coupons/validate', optionalAuth, validateCoupon);

// 2. Customer order management routes
router.post('/orders/checkout', requireAuth, checkout);
router.get('/orders', requireAuth, getMyOrders);
router.get('/orders/my-orders', requireAuth, getMyOrders);
router.get('/orders/:id', requireAuth, getOrderById);
router.put('/orders/:id/address', requireAuth, updateOrderAddress);
router.post('/orders/:id/cancel', requireAuth, cancelOrder);
router.put('/orders/:id/cancel', requireAuth, cancelOrder);
router.get('/orders/:id/invoice', requireAuth, downloadInvoice);

export default router;
