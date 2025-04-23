import db from '../config/db.js';

class Cart {
  // Get user's cart
  static async getByUserId(userId) {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Ensure userId is a number
      const parsedUserId = parseInt(userId);

      if (isNaN(parsedUserId)) {
        throw new Error('User ID must be a number');
      }

      console.log('getByUserId called with:', { parsedUserId });

      // Get user's cart
      const [carts] = await db.query('SELECT * FROM carts WHERE userId = ?', [parsedUserId]);
      console.log('Found carts:', carts);

      // If cart doesn't exist, create one
      let cartId;
      if (carts.length === 0) {
        console.log('Creating new cart for user:', parsedUserId);
        const [result] = await db.query('INSERT INTO carts (userId) VALUES (?)', [parsedUserId]);
        cartId = result.insertId;
        console.log('New cart created with ID:', cartId);
      } else {
        cartId = carts[0].id;
        console.log('Using existing cart with ID:', cartId);
      }

      // Get cart items with product details
      const [cartItems] = await db.query(`
        SELECT ci.id, ci.productId, ci.quantity, p.name, p.price, p.originalPrice, p.unit, p.image
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
        WHERE ci.cartId = ?
      `, [cartId]);

      // Calculate totals
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const discount = cartItems.reduce((total, item) =>
        total + ((item.originalPrice - item.price) * item.quantity), 0);

      return {
        cartId,
        items: cartItems,
        itemCount: cartItems.length,
        subtotal,
        discount
      };
    } catch (error) {
      throw new Error(`Error getting cart: ${error.message}`);
    }
  }

  // Add item to cart
  static async addItem(userId, productId, quantity = 1) {
    try {
      console.log('Cart.addItem called with:', { userId, productId, quantity });

      // Validate inputs
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required');
      }

      // Ensure userId and productId are numbers
      const parsedUserId = parseInt(userId);
      const parsedProductId = parseInt(productId);
      const parsedQuantity = Math.max(1, parseInt(quantity) || 1);

      if (isNaN(parsedUserId) || isNaN(parsedProductId)) {
        throw new Error('User ID and Product ID must be numbers');
      }

      console.log('Parsed values:', { parsedUserId, parsedProductId, parsedQuantity });

      // Get user's cart
      const [carts] = await db.query('SELECT * FROM carts WHERE userId = ?', [parsedUserId]);
      console.log('Existing carts for user:', carts);

      // If cart doesn't exist, create one
      let cartId;
      if (carts.length === 0) {
        console.log('Creating new cart for user:', parsedUserId);
        const [result] = await db.query('INSERT INTO carts (userId) VALUES (?)', [parsedUserId]);
        cartId = result.insertId;
        console.log('New cart created with ID:', cartId);
      } else {
        cartId = carts[0].id;
        console.log('Using existing cart with ID:', cartId);
      }

      // Check if item already exists in cart
      const [existingItems] = await db.query(
        'SELECT * FROM cart_items WHERE cartId = ? AND productId = ?',
        [cartId, parsedProductId]
      );
      console.log('Existing items in cart:', existingItems);

      if (existingItems.length > 0) {
        // Update quantity
        const newQuantity = existingItems[0].quantity + parsedQuantity;
        console.log('Updating existing item quantity:', { itemId: existingItems[0].id, oldQuantity: existingItems[0].quantity, newQuantity });
        await db.query(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, existingItems[0].id]
        );
      } else {
        // Add new item
        console.log('Adding new item to cart:', { cartId, parsedProductId, parsedQuantity });
        const [result] = await db.query(
          'INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)',
          [cartId, parsedProductId, parsedQuantity]
        );
        console.log('New item added with ID:', result.insertId);
      }

      return await this.getByUserId(parsedUserId);
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error.message}`);
    }
  }

  // Update cart item quantity
  static async updateItemQuantity(userId, itemId, quantity) {
    try {
      // Validate inputs
      if (!userId || !itemId || !quantity) {
        throw new Error('User ID, Item ID, and Quantity are required');
      }

      // Ensure userId, itemId, and quantity are numbers
      const parsedUserId = parseInt(userId);
      const parsedItemId = parseInt(itemId);
      const parsedQuantity = Math.max(1, parseInt(quantity) || 1);

      if (isNaN(parsedUserId) || isNaN(parsedItemId)) {
        throw new Error('User ID and Item ID must be numbers');
      }

      console.log('updateItemQuantity called with:', { parsedUserId, parsedItemId, parsedQuantity });

      // Get user's cart
      const [carts] = await db.query('SELECT * FROM carts WHERE userId = ?', [parsedUserId]);
      if (carts.length === 0) {
        throw new Error('Cart not found');
      }

      const cartId = carts[0].id;

      // Check if item exists in user's cart
      const [cartItems] = await db.query(
        'SELECT * FROM cart_items WHERE id = ? AND cartId = ?',
        [parsedItemId, cartId]
      );

      if (cartItems.length === 0) {
        throw new Error('Cart item not found');
      }

      // Update quantity
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [parsedQuantity, parsedItemId]
      );

      return await this.getByUserId(parsedUserId);
    } catch (error) {
      throw new Error(`Error updating cart item: ${error.message}`);
    }
  }

  // Remove item from cart
  static async removeItem(userId, itemId) {
    try {
      // Validate inputs
      if (!userId || !itemId) {
        throw new Error('User ID and Item ID are required');
      }

      // Ensure userId and itemId are numbers
      const parsedUserId = parseInt(userId);
      const parsedItemId = parseInt(itemId);

      if (isNaN(parsedUserId) || isNaN(parsedItemId)) {
        throw new Error('User ID and Item ID must be numbers');
      }

      console.log('removeItem called with:', { parsedUserId, parsedItemId });

      // Get user's cart
      const [carts] = await db.query('SELECT * FROM carts WHERE userId = ?', [parsedUserId]);
      if (carts.length === 0) {
        throw new Error('Cart not found');
      }

      const cartId = carts[0].id;

      // Check if item exists in user's cart
      const [cartItems] = await db.query(
        'SELECT * FROM cart_items WHERE id = ? AND cartId = ?',
        [parsedItemId, cartId]
      );

      if (cartItems.length === 0) {
        throw new Error('Cart item not found');
      }

      // Remove item
      await db.query('DELETE FROM cart_items WHERE id = ?', [parsedItemId]);

      return await this.getByUserId(parsedUserId);
    } catch (error) {
      throw new Error(`Error removing item from cart: ${error.message}`);
    }
  }

  // Clear cart
  static async clear(userId) {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Ensure userId is a number
      const parsedUserId = parseInt(userId);

      if (isNaN(parsedUserId)) {
        throw new Error('User ID must be a number');
      }

      console.log('clear called with:', { parsedUserId });

      // Get user's cart
      const [carts] = await db.query('SELECT * FROM carts WHERE userId = ?', [parsedUserId]);
      if (carts.length === 0) {
        throw new Error('Cart not found');
      }

      const cartId = carts[0].id;

      // Remove all items
      await db.query('DELETE FROM cart_items WHERE cartId = ?', [cartId]);

      return {
        cartId,
        items: [],
        itemCount: 0,
        subtotal: 0,
        discount: 0
      };
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }
}

export default Cart;
