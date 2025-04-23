import db from '../config/db.js';

class Order {
  // Get user's orders
  static async getByUserId(userId) {
    try {
      // Get orders
      const [orders] = await db.query(`
        SELECT * FROM orders
        WHERE userId = ?
        ORDER BY createdAt DESC
      `, [userId]);

      // Get order items for each order
      for (let order of orders) {
        const [items] = await db.query(`
          SELECT oi.*, p.name, p.image
          FROM order_items oi
          JOIN products p ON oi.productId = p.id
          WHERE oi.orderId = ?
        `, [order.id]);

        order.items = items;
      }

      return orders;
    } catch (error) {
      throw new Error(`Error getting user orders: ${error.message}`);
    }
  }

  // Get order by ID
  static async findById(id, userId = null) {
    try {
      let query = 'SELECT * FROM orders WHERE id = ?';
      const queryParams = [id];

      // If userId is provided, ensure the order belongs to the user
      if (userId) {
        query += ' AND userId = ?';
        queryParams.push(userId);
      }

      const [orders] = await db.query(query, queryParams);

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];

      // Get order items
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = ?
      `, [id]);

      order.items = items;

      return order;
    } catch (error) {
      throw new Error(`Error finding order by ID: ${error.message}`);
    }
  }

  // Create order
  static async create(userId, orderData) {
    try {
      const { shippingAddress, paymentMethod, items } = orderData;

      // Calculate total amount
      const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Create order
        const [orderResult] = await connection.query(`
          INSERT INTO orders (userId, totalAmount, shippingAddress, paymentMethod, status, paymentStatus)
          VALUES (?, ?, ?, ?, 'pending', 'pending')
        `, [userId, totalAmount, shippingAddress, paymentMethod]);

        const orderId = orderResult.insertId;

        // Add order items
        for (const item of items) {
          await connection.query(`
            INSERT INTO order_items (orderId, productId, quantity, price)
            VALUES (?, ?, ?, ?)
          `, [orderId, item.productId, item.quantity, item.price]);

          // Update product stock
          await connection.query(`
            UPDATE products
            SET stock = stock - ?
            WHERE id = ?
          `, [item.quantity, item.productId]);
        }

        // Clear user's cart
        const [carts] = await connection.query('SELECT id FROM carts WHERE userId = ?', [userId]);
        if (carts.length > 0) {
          await connection.query('DELETE FROM cart_items WHERE cartId = ?', [carts[0].id]);
        }

        // Commit transaction
        await connection.commit();

        return await this.findById(orderId);
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Cancel order
  static async cancel(id, userId) {
    try {
      // Get order
      const order = await this.findById(id, userId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error(`Order cannot be cancelled as it is already ${order.status}`);
      }

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Update order status
        await connection.query(`
          UPDATE orders
          SET status = 'cancelled'
          WHERE id = ?
        `, [id]);

        // Restore product stock
        for (const item of order.items) {
          await connection.query(`
            UPDATE products
            SET stock = stock + ?
            WHERE id = ?
          `, [item.quantity, item.productId]);
        }

        // Commit transaction
        await connection.commit();

        return true;
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw new Error(`Error cancelling order: ${error.message}`);
    }
  }

  // Get all orders (admin)
  static async getAll() {
    try {
      // Get orders with user info
      const [orders] = await db.query(`
        SELECT o.*, u.fullName, u.email
        FROM orders o
        JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
      `);

      return orders;
    } catch (error) {
      throw new Error(`Error getting all orders: ${error.message}`);
    }
  }

  // Update order status (admin)
  static async updateStatus(id, status, paymentStatus = null) {
    try {
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      // Validate payment status if provided
      if (paymentStatus) {
        const validPaymentStatuses = ['pending', 'completed', 'failed'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
          throw new Error(`Invalid payment status: ${paymentStatus}. Valid values are: ${validPaymentStatuses.join(', ')}`);
        }

        // Update order status and payment status
        await db.query('UPDATE orders SET status = ?, paymentStatus = ? WHERE id = ?', [status, paymentStatus, id]);
      } else {
        // Update only order status
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Get total count of orders
  static async getTotalCount() {
    try {
      const [result] = await db.query('SELECT COUNT(*) as count FROM orders');
      return result;
    } catch (error) {
      throw new Error(`Error getting total order count: ${error.message}`);
    }
  }

  // Get recent orders
  static async getRecentOrders(limit = 5) {
    try {
      const [orders] = await db.query(`
        SELECT o.*, u.fullName, u.email
        FROM orders o
        JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
        LIMIT ?
      `, [limit]);

      return orders;
    } catch (error) {
      throw new Error(`Error getting recent orders: ${error.message}`);
    }
  }

  // Find all orders (admin)
  static async findAll() {
    try {
      const [orders] = await db.query(`
        SELECT o.*, u.fullName, u.email
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
      `);

      // Format orders to include user data in the expected structure
      const formattedOrders = orders.map(order => {
        return {
          ...order,
          user: order.fullName ? {
            fullName: order.fullName,
            email: order.email
          } : null
        };
      });

      return formattedOrders;
    } catch (error) {
      throw new Error(`Error finding all orders: ${error.message}`);
    }
  }

  // Get order items
  static async getOrderItems(orderId) {
    try {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = ?
      `, [orderId]);

      return items;
    } catch (error) {
      throw new Error(`Error getting order items: ${error.message}`);
    }
  }
}

export default Order;
