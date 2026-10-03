import { Router } from 'express';
import {
  getDashboardSummary,
  getAdminOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createCoupon,
  getCoupons,
  deleteCoupon,
  getUsers,
  deleteUser,
  broadcastDeal,
  exportOrdersReport,
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  getAnalytics,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getStoreSettings,
  updateStoreSettings,
  getAdminReviews,
  deleteAdminReview
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes with authentication and admin role check
router.use(requireAuth, requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', getDashboardSummary);
router.get('/analytics', getAnalytics);

// 10-per-page Orders
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/orders/export', exportOrdersReport);

// Product CRUD
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Coupon Generator
router.post('/coupons', createCoupon);
router.get('/coupons', getCoupons);
router.delete('/coupons/:id', deleteCoupon);

// User Governance
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Banner Management (Hero swiping posters)
router.get('/banners', getAdminBanners);
router.post('/banners', createAdminBanner);
router.put('/banners/:id', updateAdminBanner);
router.delete('/banners/:id', deleteAdminBanner);

// Category & Curated Collections Management
router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.put('/categories/:id', updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

// Store Settings & Live Announcement Ticker
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);

// Customer Review Moderation
router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', deleteAdminReview);

// Broadcast Deals
router.post('/notifications/broadcast', broadcastDeal);

export default router;
