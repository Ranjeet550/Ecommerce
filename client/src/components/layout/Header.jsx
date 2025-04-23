import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import apiService from '../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get auth state from context
  const { isAuthenticated } = useAuth();

  // Get cart state from context
  const { itemCount: cartItemsCount } = useCart();

  // State for categories
  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.categories.getAll();
        if (response.data.categories.length > 0) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set categories to empty array if there's an error
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-green-600">
            FreshMart
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xl mx-4 bg-gray-100 rounded-full px-4 py-2"
          >
            <input
              type="text"
              placeholder="Search for products..."
              className="flex-1 bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="ml-2 text-gray-500 hover:text-green-600">
              <FaSearch />
            </button>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-gray-700 hover:text-green-600">
              Products
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-green-600 relative">
              <FaShoppingCart />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="text-gray-700 hover:text-green-600">
                <FaUser />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Categories Navigation */}
        {categories.length > 0 && (
          <div className="hidden md:flex items-center justify-between mt-4 border-t pt-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="text-sm text-gray-700 hover:text-green-600"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container-custom py-4">
            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-4"
            >
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="ml-2 text-gray-500 hover:text-green-600">
                <FaSearch />
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-4">
              <Link
                to="/products"
                className="text-gray-700 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              {categories.length > 0 && categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="text-sm text-gray-700 hover:text-green-600 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/cart"
                className="text-gray-700 hover:text-green-600 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaShoppingCart className="mr-2" />
                Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-green-600 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="mr-2" />
                  My Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
