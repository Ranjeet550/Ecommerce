import db from './db.js';

/**
 * Initialize database tables and sample data
 */
export const initialize = async () => {
  try {
    // Create tables if they don't exist
    await createTables();

    // Check if we need to add sample data
    const needsSampleData = await checkIfNeedsSampleData();

    if (needsSampleData) {
      await insertSampleData();
    }

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    return false;
  }
};

/**
 * Create database tables if they don't exist
 */
const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        role ENUM('user', 'admin') DEFAULT 'user',
        resetPasswordToken VARCHAR(255),
        resetPasswordExpire DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        originalPrice DECIMAL(10, 2),
        categoryId INT,
        image VARCHAR(255),
        unit VARCHAR(50) NOT NULL,
        stock INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Carts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Cart items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cartId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        totalAmount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shippingAddress TEXT NOT NULL,
        paymentMethod VARCHAR(50) NOT NULL,
        paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Order items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Wishlist table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        productId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

/**
 * Check if we need to insert sample data
 */
const checkIfNeedsSampleData = async () => {
  try {
    // Check if categories table is empty
    const [categories] = await db.query('SELECT COUNT(*) as count FROM categories');
    return categories[0].count === 0;
  } catch (error) {
    console.error('Error checking for sample data:', error.message);
    return false;
  }
};

/**
 * Insert sample data into the database
 */
const insertSampleData = async () => {
  try {
    // Insert sample categories
    const categories = [
      { name: 'Fruits & Vegetables', description: 'Fresh fruits and vegetables', image: '/uploads/categories/fruits-vegetables.jpg' },
      { name: 'Dairy & Eggs', description: 'Milk, cheese, butter, and eggs', image: '/uploads/categories/dairy-eggs.jpg' },
      { name: 'Meat & Seafood', description: 'Fresh meat and seafood', image: '/uploads/categories/meat-seafood.jpg' },
      { name: 'Bakery', description: 'Bread, cakes, and pastries', image: '/uploads/categories/bakery.jpg' },
      { name: 'Beverages', description: 'Juices, soft drinks, and water', image: '/uploads/categories/beverages.jpg' }
    ];

    for (const category of categories) {
      await db.query(
        'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
        [category.name, category.description, category.image]
      );
    }

    // Get category IDs
    const [categoryRows] = await db.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categoryRows.forEach(row => {
      categoryMap[row.name] = row.id;
    });

    // Insert sample products
    const products = [
      {
        name: 'Organic Bananas',
        description: 'Sweet and nutritious organic bananas',
        price: 1.99,
        originalPrice: 2.49,
        categoryId: categoryMap['Fruits & Vegetables'],
        image: '/uploads/products/bananas.jpg',
        unit: 'bunch',
        stock: 50,
        featured: true
      },
      {
        name: 'Red Apples',
        description: 'Crisp and juicy red apples',
        price: 2.99,
        originalPrice: 3.49,
        categoryId: categoryMap['Fruits & Vegetables'],
        image: '/uploads/products/apples.jpg',
        unit: 'kg',
        stock: 40,
        featured: true
      },
      {
        name: 'Whole Milk',
        description: 'Fresh whole milk',
        price: 3.49,
        originalPrice: 3.99,
        categoryId: categoryMap['Dairy & Eggs'],
        image: '/uploads/products/milk.jpg',
        unit: 'gallon',
        stock: 30,
        featured: true
      },
      {
        name: 'Large Eggs',
        description: 'Farm fresh large eggs',
        price: 4.99,
        originalPrice: 5.49,
        categoryId: categoryMap['Dairy & Eggs'],
        image: '/uploads/products/eggs.jpg',
        unit: 'dozen',
        stock: 25,
        featured: false
      },
      {
        name: 'Chicken Breast',
        description: 'Boneless, skinless chicken breast',
        price: 8.99,
        originalPrice: 9.99,
        categoryId: categoryMap['Meat & Seafood'],
        image: '/uploads/products/chicken.jpg',
        unit: 'kg',
        stock: 20,
        featured: true
      }
    ];

    for (const product of products) {
      await db.query(
        'INSERT INTO products (name, description, price, originalPrice, categoryId, image, unit, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          product.name,
          product.description,
          product.price,
          product.originalPrice,
          product.categoryId,
          product.image,
          product.unit,
          product.stock,
          product.featured
        ]
      );
    }

    // Insert sample admin user
    const adminPassword = await require('bcrypt').hash('admin123', 10);
    await db.query(
      'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', adminPassword, 'admin']
    );

    console.log('Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
    throw error;
  }
};
