import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes, FaSort } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');

  // Get query parameters
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  // Categories state
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Set initial selected category from URL if present
    if (categoryParam) {
      setSelectedCategories([parseInt(categoryParam)]);
    }

    // Fetch categories and products from API
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesResponse = await apiService.categories.getAll();
        const fetchedCategories = categoriesResponse.data.categories.map(category => ({
          id: category.id,
          name: category.name,
          image: category.image,
          count: category.productCount || 0
        }));
        setCategories(fetchedCategories);

        // Prepare query parameters for products API
        const params = {};
        if (categoryParam) {
          params.categoryId = categoryParam;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

        // Fetch products
        const productsResponse = await apiService.products.getAll(params);
        const fetchedProducts = productsResponse.data.products.map(product => ({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          unit: product.unit || 'each',
          discount: product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0,
          category: product.categoryId
        }));

        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products. Please check your connection and try again.');
        setCategories([]);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryParam, searchQuery]);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    // Filter by selected categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'discount':
        return b.discount - a.discount;
      default: // popularity
        return 0; // In a real app, would sort by popularity metric
    }
  });

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Handle price range change
  const handlePriceChange = (index, value) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(value);
    setPriceRange(newPriceRange);
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : categoryParam
              ? categories.find(c => c.id === parseInt(categoryParam))?.name || 'Products'
              : 'All Products'
          }
        </h1>
        <p className="text-gray-600 mt-2">
          {sortedProducts.length} products found
        </p>
      </div>

      <div className="lg:flex gap-8">
        {/* Filter Button (Mobile) */}
        <div className="lg:hidden mb-4">
          <button
            className="w-full btn bg-white border border-gray-300 text-gray-700 flex items-center justify-center gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FaFilter />
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters Sidebar */}
        <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                className="lg:hidden text-gray-500"
                onClick={() => setIsFilterOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 text-green-600"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center justify-between mb-2">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-medium mb-2">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="discount">Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Sort By (Mobile) */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center bg-white rounded-lg shadow-sm p-3">
              <FaSort className="text-gray-500 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-low-high">Sort by: Price: Low to High</option>
                <option value="price-high-low">Sort by: Price: High to Low</option>
                <option value="discount">Sort by: Discount</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
