import db from '../config/db.js';

class Wishlist {
  // Get user's wishlist
  static async getByUserId(userId) {
    try {
      // Get wishlist items with product details
      const [wishlistItems] = await db.query(`
        SELECT w.id, w.productId, p.name, p.price, p.originalPrice, p.unit, p.image,
               CASE WHEN p.originalPrice > p.price
                    THEN ROUND(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    ELSE 0
               END as discount
        FROM wishlist w
        JOIN products p ON w.productId = p.id
        WHERE w.userId = ?
      `, [userId]);

      return wishlistItems;
    } catch (error) {
      throw new Error(`Error getting wishlist: ${error.message}`);
    }
  }

  // Add product to wishlist
  static async addItem(userId, productId) {
    try {
      // Check if already in wishlist
      const [existingItems] = await db.query(
        'SELECT * FROM wishlist WHERE userId = ? AND productId = ?',
        [userId, productId]
      );

      if (existingItems.length > 0) {
        throw new Error('Product already in wishlist');
      }

      // Add to wishlist with current timestamp
      await db.query(
        'INSERT INTO wishlist (userId, productId, createdAt) VALUES (?, ?, NOW())',
        [userId, productId]
      );

      return await this.getByUserId(userId);
    } catch (error) {
      throw new Error(`Error adding to wishlist: ${error.message}`);
    }
  }

  // Remove product from wishlist
  static async removeItem(userId, wishlistItemId) {
    try {
      // Remove from wishlist
      await db.query('DELETE FROM wishlist WHERE id = ? AND userId = ?', [wishlistItemId, userId]);

      return await this.getByUserId(userId);
    } catch (error) {
      throw new Error(`Error removing from wishlist: ${error.message}`);
    }
  }
}

export default Wishlist;
