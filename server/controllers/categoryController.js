import Category from '../models/Category.js';

// Get all categories
export const getCategories = async (req, res) => {
  console.log('GET /api/categories request received');
  try {
    // Get all categories with product counts using the Category model
    console.log('Fetching categories from database...');
    const categories = await Category.getAll();
    console.log(`Found ${categories.length} categories`);

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
    console.log('Categories sent successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message,
    });
  }
};

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get category by ID using the Category model
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get products in this category
    const products = await Category.getProducts(id);

    res.status(200).json({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message,
    });
  }
};

// Create a new category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category name',
      });
    }

    // Create category using the Category model
    const category = await Category.create({ name, description, image });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

// Update a category (admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Update category using the Category model
    const updatedCategory = await Category.update(id, { name, description, image });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

// Delete a category (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Delete category using the Category model
    await Category.delete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
};
