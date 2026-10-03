import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getWishlist,
  toggleWishlist
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/cart', requireAuth, getCart);
router.post('/cart/add', requireAuth, addToCart);
router.put('/cart/item/:productId', requireAuth, updateCartItem);
router.delete('/cart/item/:productId', requireAuth, removeFromCart);

router.get('/wishlist', requireAuth, getWishlist);
router.post('/wishlist/toggle', requireAuth, toggleWishlist);

export default router;
