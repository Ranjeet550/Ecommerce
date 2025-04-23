import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get orders using the Order model
    const orders = await Order.getByUserId(userId);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get order using the Order model
    const order = await Order.findById(id, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message,
    });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      paymentMethod,
      items // Array of { productId, quantity, price }
    } = req.body;

    // Validate input
    if (!shippingAddress || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shipping address, payment method, and items',
      });
    }

    // Create order using the Order model
    const order = await Order.create(userId, {
      shippingAddress,
      paymentMethod,
      items
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// Cancel an order
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      // Cancel order using the Order model
      await Order.cancel(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
      });
    } catch (err) {
      // Handle specific errors from the model
      if (err.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      } else if (err.message.includes('Order cannot be cancelled')) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      throw err; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message,
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    // Get all orders using the Order model
    const orders = await Order.getAll();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status',
      });
    }

    try {
      // Update order status using the Order model
      await Order.updateStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
      });
    } catch (err) {
      // Handle specific errors from the model
      if (err.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }
      throw err; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};
