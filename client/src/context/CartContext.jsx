import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Use a ref to track if a fetch is in progress to prevent duplicate calls
  const fetchInProgress = useRef(false);

  // Fetch cart from API - define this before using it in useEffect
  const fetchCart = useCallback(async () => {
    // If a fetch is already in progress, don't start another one
    if (fetchInProgress.current) {
      console.log('Fetch cart already in progress, skipping duplicate call');
      return;
    }

    try {
      fetchInProgress.current = true;
      setLoading(true);
      console.log('Fetching cart data...');
      const response = await apiService.cart.getCart();
      console.log('Cart context response:', response.data);

      // Check if response has items
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        // Transform cart items to match the expected format
        const cartItemsData = response.data.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          image: item.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
          price: item.price,
          originalPrice: item.originalPrice || item.price,
          unit: item.unit || 'each',
          quantity: item.quantity
        }));

        setCartItems(cartItemsData);
      } else {
        // If no items or invalid response, set empty cart
        console.log('No items found in cart context response');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, []);  // Empty dependency array to ensure the function is stable

  // Fetch cart on initial load and when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (isAuthenticated) {
          // Use the memoized fetchCart function
          await fetchCart();
        } else {
          // If not authenticated, use local storage cart
          const localCartString = localStorage.getItem('cart');
          console.log('Loading cart from localStorage:', localCartString);

          if (localCartString) {
            try {
              const localCart = JSON.parse(localCartString);
              if (Array.isArray(localCart)) {
                setCartItems(localCart);
              } else {
                console.warn('Invalid cart format in localStorage, using empty cart');
                setCartItems([]);
              }
            } catch (parseError) {
              console.error('Error parsing cart from localStorage:', parseError);
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, fetchCart]); // Include fetchCart in dependencies

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      console.log('Adding to cart:', { product, quantity, isAuthenticated });
      if (isAuthenticated) {
        // Add to server cart if authenticated
        const productId = parseInt(product.id); // Ensure ID is a number
        console.log('Adding to server cart, product ID:', productId);

        // Validate product ID
        if (!productId || isNaN(productId)) {
          console.error('Invalid product ID:', product.id);
          toast.error('Invalid product ID. Please try again.');
          return;
        }

        const response = await apiService.cart.addToCart(productId, quantity);
        console.log('Add to cart response:', response.data);

        // Only fetch cart if there's not already a fetch in progress
        if (!fetchInProgress.current) {
          await fetchCart(); // Refresh cart from server
        }
      } else {
        // Add to local cart if not authenticated
        const existingItem = cartItems.find(item => item.productId === product.id);

        // Create new item object (will be used if item doesn't exist)
        const newItem = {
          id: Date.now(), // Temporary ID for local cart
          productId: product.id,
          name: product.name,
          image: product.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          unit: product.unit || 'each',
          quantity
        };

        if (existingItem) {
          // Update quantity if item already exists
          setCartItems(prevItems =>
            prevItems.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          );
        } else {
          // Add new item
          setCartItems(prevItems => [...prevItems, newItem]);
        }

        // Update local storage with the current state
        // Use a callback to ensure we're using the latest state
        setTimeout(() => {
          localStorage.setItem('cart', JSON.stringify(cartItems));
        }, 0);
      }

      toast.success(`${quantity} ${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      if (isAuthenticated) {
        // Update on server if authenticated
        await apiService.cart.updateCartItem(itemId, quantity);

        // Only fetch cart if there's not already a fetch in progress
        if (!fetchInProgress.current) {
          await fetchCart(); // Refresh cart from server
        }
      } else {
        // Update local cart if not authenticated
        const updatedItems = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        // Update state
        setCartItems(updatedItems);

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update quantity. Please try again.');
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      if (isAuthenticated) {
        // Remove from server if authenticated
        await apiService.cart.removeFromCart(itemId);

        // Only fetch cart if there's not already a fetch in progress
        if (!fetchInProgress.current) {
          await fetchCart(); // Refresh cart from server
        }
      } else {
        // Remove from local cart if not authenticated
        const updatedItems = cartItems.filter(item => item.id !== itemId);

        // Update state
        setCartItems(updatedItems);

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        // Clear server cart if authenticated
        await apiService.cart.clearCart();

        // Only fetch cart if there's not already a fetch in progress
        if (!fetchInProgress.current) {
          await fetchCart(); // Refresh cart from server
        }
      } else {
        // Clear local cart if not authenticated
        setCartItems([]);

        // Save to local storage
        localStorage.setItem('cart', JSON.stringify([]));
      }

      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart. Please try again.');
    }
  };

  // Calculate cart totals
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartDiscount = cartItems.reduce((total, item) =>
    total + ((item.originalPrice - item.price) * item.quantity), 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Context value
  const value = {
    cartItems,
    loading,
    cartTotal,
    cartDiscount,
    itemCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
