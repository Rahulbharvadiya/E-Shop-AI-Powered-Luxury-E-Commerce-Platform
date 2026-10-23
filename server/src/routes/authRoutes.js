import { Router } from 'express';
import {
  register,
  registerRequest,
  registerVerify,
  login,
  requestLoginOtp,
  verifyLoginOtp,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  deleteAccount
} from '../controllers/authController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/register/request-otp', registerRequest);
router.post('/register/verify', registerVerify);
router.post('/login', login);
router.post('/login/request-otp', requestLoginOtp);
router.post('/login/verify-otp', verifyLoginOtp);
router.post('/refresh', refreshAccessToken);
router.post('/logout', optionalAuth, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.delete('/account', requireAuth, deleteAccount);

export default router;
