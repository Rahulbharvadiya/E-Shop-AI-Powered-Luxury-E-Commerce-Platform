import { Router } from 'express';
import {
  getStoreSettingsPublic,
  getBanners,
  getCategories,
  getProducts,
  getProductBySlug,
  getRecommendationsGrid,
  searchProductsAI,
  checkDelivery
} from '../controllers/productController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/settings', getStoreSettingsPublic);
router.get('/banners', getBanners);
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/recommendations', optionalAuth, getRecommendationsGrid);
router.get('/products/search', searchProductsAI);
router.get('/products/:slug', getProductBySlug);
router.post('/pincode/estimate', checkDelivery);

export default router;
