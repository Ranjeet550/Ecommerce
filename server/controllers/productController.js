import Product from '../models/Product.js';

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = 'id',
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Create filters object
    const filters = {};
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    // Get products using the Product model
    const result = await Product.getAll(filters, sort, order, page, limit);

    res.status(200).json({
      success: true,
      count: result.products.length,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      products: result.products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message,
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product details using the Product model
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get related products
    const relatedProducts = await Product.getRelated(product.categoryId, id);

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message,
    });
  }
};

// Create a new product (admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      unit,
      stock,
      categoryId,
      image
    } = req.body;

    // Validate input
    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category',
      });
    }

    // Create product using the Product model
    const product = await Product.create({
      name,
      description,
      price,
      originalPrice,
      discount,
      unit,
      stock,
      categoryId,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// Update a product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      unit,
      stock,
      categoryId,
      image
    } = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update product using the Product model
    const updatedProduct = await Product.update(id, {
      name,
      description,
      price,
      originalPrice,
      discount,
      unit,
      stock,
      categoryId,
      image
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// Delete a product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete product using the Product model
    await Product.delete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};
