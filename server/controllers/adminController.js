import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import bcrypt from 'bcrypt';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [productCount] = await Product.getTotalCount();
    const [categoryCount] = await Category.getTotalCount();
    const [userCount] = await User.getTotalCount();
    const [orderCount] = await Order.getTotalCount();

    // Get recent orders
    const recentOrders = await Order.getRecentOrders(5);

    // Format recent orders to include user data in the expected structure
    const formattedRecentOrders = recentOrders.map(order => {
      return {
        ...order,
        user: {
          fullName: order.fullName,
          email: order.email
        }
      };
    });

    // Get top selling products
    const topProducts = await Product.getTopSellingProducts(4);

    res.status(200).json({
      success: true,
      totalProducts: productCount.count,
      totalCategories: categoryCount.count,
      totalUsers: userCount.count,
      totalOrders: orderCount.count,
      recentOrders: formattedRecentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber, address, city, state, pincode } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const userData = {
      fullName,
      email,
      password,
      role: role || 'user',
      phoneNumber,
      address,
      city,
      state,
      pincode
    };

    const userId = await User.create(userData);

    // Get the created user
    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, role, phoneNumber, address, city, state, pincode } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const userWithEmail = await User.findByEmail(email);
      if (userWithEmail && userWithEmail.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Prepare update data
    const userData = {
      fullName: fullName || existingUser.fullName,
      email: email || existingUser.email,
      role: role || existingUser.role,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : existingUser.phoneNumber,
      address: address !== undefined ? address : existingUser.address,
      city: city !== undefined ? city : existingUser.city,
      state: state !== undefined ? state : existingUser.state,
      pincode: pincode !== undefined ? pincode : existingUser.pincode
    };

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    await User.update(id, userData);

    // Get the updated user
    const updatedUser = await User.findById(id);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    // Delete user
    await User.delete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

// Get order by ID (admin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get user details
    if (order.userId) {
      const user = await User.findById(order.userId);
      if (user) {
        order.user = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber
        };
      }
    }

    // Get order items
    const items = await Order.getOrderItems(id);
    order.items = items;

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    const updatedOrder = await Order.updateStatus(id, status, paymentStatus);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get all products (admin)
export const getAllProducts = async (req, res) => {
  try {
    const result = await Product.getAll();

    res.status(200).json({
      success: true,
      count: result.products.length,
      total: result.total,
      products: result.products
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
};

// Get product by ID (admin)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
};

// Create product (admin)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, categoryId, image, unit, stock, featured } = req.body;

    console.log('Creating product:', req.body);

    // Validate input
    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }

    // Create product
    const productData = {
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      categoryId,
      image,
      unit: unit || 'each',
      stock: stock || 0,
      featured: featured || false
    };

    console.log('Product data for creation:', productData);

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product (admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, originalPrice, categoryId, image, unit, stock, featured } = req.body;

    console.log('Updating product:', { id, body: req.body });

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Prepare update data
    const productData = {
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      price: price || existingProduct.price,
      originalPrice: originalPrice || existingProduct.originalPrice,
      categoryId: categoryId || existingProduct.categoryId,
      image: image !== undefined ? image : existingProduct.image,
      unit: unit || existingProduct.unit,
      stock: stock !== undefined ? stock : existingProduct.stock,
      featured: featured !== undefined ? featured : existingProduct.featured
    };

    console.log('Product data for update:', productData);

    // Update product
    const updatedProduct = await Product.update(id, productData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    await Product.delete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get all categories (admin)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

// Get category by ID (admin)
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message
    });
  }
};

// Create category (admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category name'
      });
    }

    // Create category
    const categoryData = {
      name,
      description,
      image
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category (admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Prepare update data
    const categoryData = {
      name: name || existingCategory.name,
      description: description !== undefined ? description : existingCategory.description,
      image: image !== undefined ? image : existingCategory.image
    };

    // Update category
    const updatedCategory = await Category.update(id, categoryData);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category (admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productsCount = await Product.countByCategoryId(id);
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productsCount} products. Please reassign or delete the products first.`
      });
    }

    // Delete category
    await Category.delete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};
