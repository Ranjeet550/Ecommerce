import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

// Create context
const WishlistContext = createContext();

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.user.getWishlist();
      setWishlistItems(response.data.wishlist || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);

      // Check if it's a 500 error specifically
      if (error.response && error.response.status === 500) {
        toast.error('Wishlist service is currently unavailable. Please try again later.');
        console.log('Server error details:', error.response.data);
      } else {
        toast.error('Failed to load wishlist. Please try again.');
      }

      setWishlistItems([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch wishlist on initial load and when auth state changes
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your wishlist');
      return;
    }

    try {
      const response = await apiService.user.addToWishlist(productId);
      setWishlistItems(response.data.wishlist || []);
      toast.success('Product added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);

      // Check for the specific error message in the 500 response
      if (error.response &&
          error.response.status === 500 &&
          error.response.data &&
          error.response.data.error &&
          error.response.data.error.includes('Product already in wishlist')) {
        toast.error('Product is already in your wishlist');
        // Refresh wishlist to ensure UI is in sync
        fetchWishlist();
      }
      // Handle specific error for product already in wishlist (400 status)
      else if (error.response &&
               error.response.status === 400 &&
               error.response.data &&
               error.response.data.message === 'Product already in wishlist') {
        toast.error('Product is already in your wishlist');
        // Refresh wishlist to ensure UI is in sync
        fetchWishlist();
      }
      // Generic 500 error
      else if (error.response && error.response.status === 500) {
        console.log('Server error details:', error.response.data);
        toast.error('Wishlist service is currently unavailable. Please try again later.');
      }
      // Any other error
      else {
        toast.error('Failed to add to wishlist. Please try again.');
      }
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (wishlistItemId) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      return;
    }

    try {
      const response = await apiService.user.removeFromWishlist(wishlistItemId);
      setWishlistItems(response.data.wishlist || []);
      toast.success('Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);

      if (error.response && error.response.status === 500) {
        console.log('Server error details:', error.response.data);
        toast.error('Wishlist service is currently unavailable. Please try again later.');
      } else if (error.response && error.response.status === 404) {
        // Item might have been already removed
        toast.error('Item not found in your wishlist');
        // Refresh the wishlist to get the current state
        fetchWishlist();
      } else {
        toast.error('Failed to remove from wishlist. Please try again.');
      }
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!wishlistItems || !Array.isArray(wishlistItems) || wishlistItems.length === 0) {
      return false;
    }

    // Convert productId to number if it's not already
    const numericProductId = typeof productId === 'number' ? productId : parseInt(productId, 10);

    // Check if any wishlist item has matching productId
    return wishlistItems.some(item => {
      const itemProductId = typeof item.productId === 'number' ?
        item.productId : parseInt(item.productId, 10);
      return itemProductId === numericProductId;
    });
  };

  // Context value
  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
