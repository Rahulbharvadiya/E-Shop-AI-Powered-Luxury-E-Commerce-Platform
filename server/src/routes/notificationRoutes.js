import { Router } from 'express';
import { getNotifications, dismissNotification } from '../controllers/notificationController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/notifications', optionalAuth, getNotifications);
router.delete('/notifications/:id', requireAuth, dismissNotification);

export default router;
