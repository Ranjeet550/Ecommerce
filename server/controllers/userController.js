import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile using the User model
    const user = await User.findById(userId);

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
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, address, city, state, pincode } = req.body;

    // Update user profile using the User model
    const updatedUser = await User.updateProfile(userId, {
      fullName,
      phoneNumber,
      address,
      city,
      state,
      pincode
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check current password
    const isPasswordValid = await User.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Change password using the User model
    await User.changePassword(userId, newPassword);

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

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get wishlist items using the Wishlist model
    const wishlistItems = await Wishlist.getByUserId(userId);

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlist: wishlistItems,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message,
    });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    try {
      // Add to wishlist using the Wishlist model
      const wishlistItems = await Wishlist.addItem(userId, productId);

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        wishlist: wishlistItems,
      });
    } catch (err) {
      // Handle specific errors from the model
      if (err.message === 'Product already in wishlist') {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      throw err; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message,
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Remove from wishlist using the Wishlist model
    const wishlistItems = await Wishlist.removeItem(userId, id);

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: wishlistItems,
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message,
    });
  }
};
