import express from 'express';
import { register, login, getCurrentUser, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Debug route
router.get('/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth routes are working',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Register a new user' },
      { method: 'POST', path: '/api/auth/login', description: 'Login a user' },
      { method: 'POST', path: '/api/auth/forgot-password', description: 'Request password reset' },
      { method: 'POST', path: '/api/auth/reset-password/:token', description: 'Reset password with token' },
      { method: 'GET', path: '/api/auth/me', description: 'Get current user (protected)' },
      { method: 'POST', path: '/api/auth/change-password', description: 'Change password (protected)' }
    ]
  });
});

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/change-password', protect, changePassword);

export default router;
