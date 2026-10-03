import { Router } from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/reviews', requireAuth, createReview);

export default router;
