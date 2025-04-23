import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart using the Cart model
    const cart = await Cart.getByUserId(userId);

    res.status(200).json({
      success: true,
      cartId: cart.cartId,
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      discount: cart.discount,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message,
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    console.log('Adding to cart:', { userId, productId, quantity });

    // Validate input
    if (!productId) {
      console.log('Invalid input: productId is required');
      return res.status(400).json({
        success: false,
        message: 'Please provide productId',
      });
    }

    // Ensure productId is a number
    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId)) {
      console.log('Invalid input: productId must be a number');
      return res.status(400).json({
        success: false,
        message: 'Product ID must be a number',
      });
    }

    // Ensure quantity is a number and at least 1
    const parsedQuantity = Math.max(1, parseInt(quantity) || 1);
    console.log('Parsed values:', { parsedProductId, parsedQuantity });

    // Check if product exists
    const product = await Product.findById(parsedProductId);
    if (!product) {
      console.log('Product not found:', parsedProductId);
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    console.log('Product found:', product);

    // Add item to cart using the Cart model
    const cart = await Cart.addItem(userId, parsedProductId, parsedQuantity);
    console.log('Item added to cart:', { cartId: cart.cartId, itemCount: cart.itemCount });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cartId: cart.cartId,
      items: cart.items,
      itemCount: cart.itemCount,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity',
      });
    }

    // Update cart item using the Cart model
    try {
      const cart = await Cart.updateItemQuantity(userId, itemId, quantity);

      res.status(200).json({
        success: true,
        message: 'Cart item updated',
        items: cart.items,
      });
    } catch (err) {
      // Handle specific errors from the model
      if (err.message === 'Cart not found' || err.message === 'Cart item not found') {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }
      throw err; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Remove item from cart using the Cart model
    try {
      const cart = await Cart.removeItem(userId, itemId);

      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        items: cart.items,
      });
    } catch (err) {
      // Handle specific errors from the model
      if (err.message === 'Cart not found' || err.message === 'Cart item not found') {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }
      throw err; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear cart using the Cart model
    try {
      const cart = await Cart.clear(userId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared',
        items: cart.items,
      });
    } catch (err) {
      // Handle specific errors from the model
      if (err.message === 'Cart not found') {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }
      throw err; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};
