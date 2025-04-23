import db, { executeQuery } from '../config/db.js';

class Category {
  // Get all categories
  static async getAll() {
    try {
      console.log('Category.getAll() called');

      // Use the executeQuery helper function
      const [categories, categoriesError] = await executeQuery('SELECT * FROM categories');

      if (categoriesError) {
        throw categoriesError;
      }

      console.log(`Query returned ${categories.length} categories`);

      // Get product count for each category
      console.log('Getting product count for each category...');
      for (let category of categories) {
        console.log(`Getting product count for category ID: ${category.id}`);

        const [result, countError] = await executeQuery(
          'SELECT COUNT(*) as count FROM products WHERE categoryId = ?',
          [category.id]
        );

        if (countError) {
          console.error(`Error getting product count for category ${category.id}:`, countError);
          category.productCount = 0;
        } else {
          category.productCount = result[0].count;
          console.log(`Category ${category.id} has ${category.productCount} products`);
        }
      }

      console.log('Returning categories with product counts');
      return categories;
    } catch (error) {
      console.error('Error in Category.getAll():', error);
      throw new Error(`Error getting categories: ${error.message}`);
    }
  }

  // Get category by ID
  static async findById(id) {
    try {
      const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return categories.length ? categories[0] : null;
    } catch (error) {
      throw new Error(`Error finding category by ID: ${error.message}`);
    }
  }

  // Get products by category ID
  static async getProducts(categoryId) {
    try {
      const [products] = await db.query('SELECT * FROM products WHERE categoryId = ?', [categoryId]);
      return products;
    } catch (error) {
      throw new Error(`Error getting products by category: ${error.message}`);
    }
  }

  // Create category
  static async create(categoryData) {
    try {
      const { name, description, image } = categoryData;

      const [result] = await db.query(
        'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
        [name, description, image]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  // Update category
  static async update(id, categoryData) {
    try {
      const { name, description, image } = categoryData;

      await db.query(
        'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
        [name, description, image, id]
      );

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  // Delete category
  static async delete(id) {
    try {
      await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  // Get total count of categories
  static async getTotalCount() {
    try {
      const [result] = await db.query('SELECT COUNT(*) as count FROM categories');
      return result;
    } catch (error) {
      throw new Error(`Error getting total category count: ${error.message}`);
    }
  }
}

export default Category;
