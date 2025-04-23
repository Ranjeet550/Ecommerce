import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

// Register a new user
export const register = async (req, res) => {
  try {
    console.log('Register request received:', { ...req.body, password: req.body.password ? '********' : undefined });

    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      console.log('Registration validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Registration failed: Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }
    console.log('Email check passed, proceeding with user creation');

    // Create new user
    const userId = await User.create({ fullName, email, password });
    console.log('User created successfully with ID:', userId);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    console.log('JWT token generated successfully');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        fullName,
        email,
        role: 'user',
      },
    });
    console.log('Registration response sent successfully');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email, passwordProvided: !!req.body.password });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Login validation failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('Login failed: User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    console.log('User found, checking password');

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    console.log('Password validated successfully');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    console.log('JWT token generated successfully for user:', user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
    console.log('Login response sent successfully');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message,
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    console.log('Forgot password request received:', { email: req.body.email });
    const { email } = req.body;

    // Validate input
    if (!email) {
      console.log('Forgot password validation failed: Missing email');
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    // Generate reset token
    const { resetToken, user } = await User.generatePasswordResetToken(email);
    console.log('Reset token generated for user:', user.id);

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.fullName);
    console.log('Password reset email sent to:', email);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    // Don't reveal if the user exists or not for security reasons
    if (error.message === 'User not found') {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    console.log('Reset password request received');
    const { token } = req.params;
    const { password } = req.body;

    // Validate input
    if (!password) {
      console.log('Reset password validation failed: Missing password');
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password',
      });
    }

    // Reset password
    const user = await User.resetPassword(token, password);
    console.log('Password reset successful for user:', user.id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

// Change password (for logged in users)
export const changePassword = async (req, res) => {
  try {
    console.log('Change password request received for user:', req.user.id);
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      console.log('Change password validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    // Get user
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await User.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      console.log('Change password failed: Invalid current password');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Change password
    await User.changePassword(user.id, newPassword);
    console.log('Password changed successfully for user:', user.id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};
