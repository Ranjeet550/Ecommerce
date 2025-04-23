import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify token and set req.user
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    console.log('Verifying token...');

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully:', decoded);

      // Check if user exists
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log('User not found for token ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      // Set user in request
      req.user = user;
      console.log('User authenticated:', user.id);
      next();
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token',
        error: tokenError.message,
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error.message,
    });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};
