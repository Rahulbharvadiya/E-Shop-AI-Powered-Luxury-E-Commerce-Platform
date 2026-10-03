import { Router } from 'express';
import { chat, getChatHistory, clearChatHistory } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(optionalAuth);

router.post('/chat', chat);
router.get('/chat/history', getChatHistory);
router.post('/chat/clear', clearChatHistory);

export default router;
