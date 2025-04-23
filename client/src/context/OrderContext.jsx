import { createContext, useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

// Create context
const OrderContext = createContext();

// Order provider component
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.orders.getMyOrders();
      console.log('Orders response:', response.data);

      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch order details
  const fetchOrderDetails = useCallback(async (orderId) => {
    if (!isAuthenticated || !orderId) {
      setCurrentOrder(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.orders.getOrderById(orderId);
      console.log('Order details response:', response.data);

      if (response.data && response.data.order) {
        setCurrentOrder(response.data.order);
      } else {
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details. Please try again.');
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new order
  const createOrder = async (shippingAddress, paymentMethod) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      return null;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return null;
    }

    try {
      setLoading(true);

      // Format items for the API
      const items = cartItems.map(item => ({
        productId: parseInt(item.productId),
        quantity: item.quantity,
        price: parseFloat(item.price)
      }));

      // Create order data
      const orderData = {
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
        items
      };

      console.log('Creating order with data:', orderData);

      const response = await apiService.orders.createOrder(orderData);
      console.log('Create order response:', response.data);

      if (response.data && response.data.order) {
        // Clear the cart after successful order
        await clearCart();
        
        // Set the current order
        setCurrentOrder(response.data.order);
        
        // Add to orders list
        setOrders(prevOrders => [response.data.order, ...prevOrders]);
        
        toast.success('Order placed successfully!');
        return response.data.order;
      } else {
        toast.error('Failed to place order. Please try again.');
        return null;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId) => {
    if (!isAuthenticated || !orderId) {
      return false;
    }

    try {
      setLoading(true);
      const response = await apiService.orders.cancelOrder(orderId);
      console.log('Cancel order response:', response.data);

      if (response.data && response.data.success) {
        // Update orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' } 
              : order
          )
        );
        
        // Update current order if it's the one being cancelled
        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder(prev => ({ ...prev, status: 'cancelled' }));
        }
        
        toast.success('Order cancelled successfully');
        return true;
      } else {
        toast.error('Failed to cancel order. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    orders,
    currentOrder,
    loading,
    fetchOrders,
    fetchOrderDetails,
    createOrder,
    cancelOrder
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Custom hook to use order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
