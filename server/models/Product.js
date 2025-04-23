import db from '../config/db.js';

class Product {
  // Get all products with filtering, sorting, and pagination
  static async getAll(filters = {}, sort = 'id', order = 'asc', page = 1, limit = 10) {
    try {
      const { category, search, minPrice, maxPrice } = filters;

      // Build query
      let query = `
        SELECT p.*, c.name as categoryName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        WHERE 1=1
      `;

      const queryParams = [];

      // Add filters
      if (category) {
        query += ' AND p.categoryId = ?';
        queryParams.push(category);
      }

      if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (minPrice) {
        query += ' AND p.price >= ?';
        queryParams.push(minPrice);
      }

      if (maxPrice) {
        query += ' AND p.price <= ?';
        queryParams.push(maxPrice);
      }

      // Add sorting
      const validSortColumns = ['id', 'name', 'price', 'discount', 'createdAt'];
      const validSortOrders = ['asc', 'desc'];

      const sortColumn = validSortColumns.includes(sort) ? sort : 'id';
      const sortOrder = validSortOrders.includes(order.toLowerCase()) ? order : 'asc';

      query += ` ORDER BY p.${sortColumn} ${sortOrder}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), offset);

      // Execute query
      const [products] = await db.query(query, queryParams);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        WHERE 1=1
      `;

      const countParams = [];

      if (category) {
        countQuery += ' AND p.categoryId = ?';
        countParams.push(category);
      }

      if (search) {
        countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (minPrice) {
        countQuery += ' AND p.price >= ?';
        countParams.push(minPrice);
      }

      if (maxPrice) {
        countQuery += ' AND p.price <= ?';
        countParams.push(maxPrice);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const totalProducts = countResult[0].total;

      return {
        products,
        count: products.length,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      throw new Error(`Error getting products: ${error.message}`);
    }
  }

  // Get product by ID
  static async findById(id) {
    try {
      const [products] = await db.query(`
        SELECT p.*, c.name as categoryName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        WHERE p.id = ?
      `, [id]);

      if (!products.length) return null;

      const product = products[0];

      // Get product images if the table exists
      try {
        const [images] = await db.query('SELECT * FROM product_images WHERE productId = ?', [id]);
        product.images = images.map(img => img.imageUrl);
      } catch (imageError) {
        // If the table doesn't exist or there's another error, use the main product image
        console.log('Error fetching product images:', imageError.message);
        product.images = product.image ? [product.image] : [];
      }

      return product;
    } catch (error) {
      throw new Error(`Error finding product by ID: ${error.message}`);
    }
  }

  // Get related products
  static async getRelated(categoryId, productId, limit = 4) {
    try {
      const [products] = await db.query(`
        SELECT * FROM products
        WHERE categoryId = ? AND id != ?
        LIMIT ?
      `, [categoryId, productId, limit]);

      return products;
    } catch (error) {
      throw new Error(`Error getting related products: ${error.message}`);
    }
  }

  // Create product
  static async create(productData) {
    try {
      const {
        name,
        description,
        price,
        originalPrice,
        unit,
        stock,
        categoryId,
        image,
        featured
      } = productData;

      const [result] = await db.query(`
        INSERT INTO products (name, description, price, originalPrice, unit, stock, categoryId, image, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, description, price, originalPrice, unit, stock, categoryId, image, featured || false]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Update product
  static async update(id, productData) {
    try {
      const {
        name,
        description,
        price,
        originalPrice,
        unit,
        stock,
        categoryId,
        image,
        featured
      } = productData;

      await db.query(`
        UPDATE products
        SET name = ?, description = ?, price = ?, originalPrice = ?,
            unit = ?, stock = ?, categoryId = ?, image = ?, featured = ?
        WHERE id = ?
      `, [name, description, price, originalPrice, unit, stock, categoryId, image, featured, id]);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product
  static async delete(id) {
    try {
      await db.query('DELETE FROM products WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Update stock
  static async updateStock(id, quantity) {
    try {
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, id]);
      return true;
    } catch (error) {
      throw new Error(`Error updating product stock: ${error.message}`);
    }
  }

  // Restore stock
  static async restoreStock(id, quantity) {
    try {
      await db.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, id]);
      return true;
    } catch (error) {
      throw new Error(`Error restoring product stock: ${error.message}`);
    }
  }

  // Get total count of products
  static async getTotalCount() {
    try {
      const [result] = await db.query('SELECT COUNT(*) as count FROM products');
      return result;
    } catch (error) {
      throw new Error(`Error getting total product count: ${error.message}`);
    }
  }

  // Get top selling products
  static async getTopSellingProducts(limit = 5) {
    try {
      const [products] = await db.query(`
        SELECT p.id, p.name, p.price, p.image, SUM(oi.quantity) as sales
        FROM products p
        JOIN order_items oi ON p.id = oi.productId
        JOIN orders o ON oi.orderId = o.id
        WHERE o.status != 'cancelled'
        GROUP BY p.id
        ORDER BY sales DESC
        LIMIT ?
      `, [limit]);

      return products;
    } catch (error) {
      throw new Error(`Error getting top selling products: ${error.message}`);
    }
  }

  // Count products by category ID
  static async countByCategoryId(categoryId) {
    try {
      const [result] = await db.query('SELECT COUNT(*) as count FROM products WHERE categoryId = ?', [categoryId]);
      return result[0].count;
    } catch (error) {
      throw new Error(`Error counting products by category ID: ${error.message}`);
    }
  }
}

export default Product;
