import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaHeart, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import apiService from '../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth state from context
  const { isAuthenticated, user } = useAuth();

  // Get cart state from context
  const { itemCount: cartItemsCount } = useCart();

  // Get wishlist state from context
  const { wishlistItems } = useWishlist();

  // State for categories
  const [categories, setCategories] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    <header>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-2 hidden md:block">
        <div className="container-custom">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <FaPhoneAlt className="text-green-400 mr-2 text-xs" />
                <a href="tel:+1234567890" className="hover:text-green-400 transition-colors">(123) 456-7890</a>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-green-400 mr-2 text-xs" />
                <a href="mailto:info@freshmart.com" className="hover:text-green-400 transition-colors">info@freshmart.com</a>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-green-400 mr-2 text-xs" />
                <span>123 Grocery Street, Fresh City</span>
              </div>
            </div>
            {/* <div className="flex items-center space-x-4 text-sm">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center hover:text-green-400 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <FaUser className="mr-1" />
                    <span>My Account</span>
                    <FaChevronDown className="ml-1 text-xs" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        {user?.isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/logout"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Logout
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="hover:text-green-400 transition-colors">Login</Link>
                  <span>|</span>
                  <Link to="/register" className="hover:text-green-400 transition-colors">Register</Link>
                </>
              )}
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-md py-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-800">Fresh<span className="text-green-600">Mart</span></span>
              </div>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-xl mx-4 bg-gray-100 rounded-full px-4 py-2 border border-gray-200 focus-within:border-green-500 transition-colors"
            >
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="ml-2 text-gray-500 hover:text-green-600 transition-colors">
                <FaSearch />
              </button>
            </form>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Products
              </Link>
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  <span>Categories</span>
                  <FaChevronDown className="ml-1 text-xs" />
                </button>
                {isCategoryDropdownOpen && categories.length > 0 && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                    <div className="py-1">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link to="/wishlist" className="text-gray-700 hover:text-green-600 transition-colors relative">
                <FaHeart />
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="text-gray-700 hover:text-green-600 transition-colors relative">
                <FaShoppingCart />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
                  <FaUser />
                  <span className="hidden lg:inline">Account</span>
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Navigation - Desktop */}
      {categories.length > 0 && (
        <div className="hidden md:block bg-gray-100 border-t border-b border-gray-200">
          <div className="container-custom">
            <div className="flex items-center justify-between py-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors text-sm"
                >
                  {category.name}
                </Link>
              ))}
              {categories.length > 6 && (
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors text-sm"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <span>More Categories</span>
                    <FaChevronDown className="ml-1 text-xs" />
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                      <div className="py-1">
                        {categories.slice(6).map((category) => (
                          <Link
                            key={category.id}
                            to={`/products?category=${category.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsCategoryDropdownOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Bar - Always visible on mobile */}
      <div className="md:hidden bg-white border-t">
        <div className="container-custom py-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200"
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-green-600 font-medium py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-green-600 font-medium py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>

              <div className="py-2 border-b border-gray-100">
                <div className="font-medium text-gray-700 mb-2">Categories</div>
                <div className="pl-4 space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="block text-gray-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/wishlist"
                className="text-gray-700 hover:text-green-600 flex items-center py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="relative">
                  <FaHeart className="mr-2" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-1 bg-green-600 text-white text-xs rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <span className="ml-2">Wishlist {wishlistItems && wishlistItems.length > 0 && `(${wishlistItems.length})`}</span>
              </Link>

              <Link
                to="/cart"
                className="text-gray-700 hover:text-green-600 flex items-center py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaShoppingCart className="mr-2" />
                Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-green-600 flex items-center py-2 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-green-600 flex items-center py-2 border-b border-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 hover:text-green-600 flex items-center py-2 border-b border-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/logout"
                    className="text-gray-700 hover:text-green-600 flex items-center py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="btn btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-secondary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
