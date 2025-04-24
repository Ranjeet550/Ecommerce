import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white pt-12 pb-6">
      <div className="container-custom">
        {/* Newsletter Section */}
        <div className="bg-green-600 rounded-xl p-8 mb-12 shadow-xl transform -translate-y-16">
          <div className="md:flex items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-white/90">
                Get the latest updates, offers and special announcements delivered directly to your inbox.
              </p>
            </div>
            <div className="md:w-1/2">
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg focus:outline-none text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4 relative inline-block">
                <span className="relative z-10">FreshMart</span>
                <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-green-500 rounded-full"></span>
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your one-stop shop for fresh groceries delivered to your doorstep. We source the finest products to ensure quality and freshness.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
                >
                  <FaFacebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
                >
                  <FaTwitter size={18} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
                >
                  <FaYoutube size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 relative inline-block">
              <span className="relative z-10">Quick Links</span>
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-green-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4 relative inline-block">
              <span className="relative z-10">Categories</span>
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-green-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=1" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=2" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link to="/products?category=3" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Bakery
                </Link>
              </li>
              <li>
                <Link to="/products?category=4" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Meat & Seafood
                </Link>
              </li>
              <li>
                <Link to="/products?category=5" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center">
                  <span className="mr-2">→</span> Organic Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 relative inline-block">
              <span className="relative z-10">Contact Us</span>
              <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-green-500 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">123 Grocery Street, Fresh City, FC 12345</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-green-500 mr-3 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-green-400 transition-colors duration-300">(123) 456-7890</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-green-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@freshmart.com" className="text-gray-300 hover:text-green-400 transition-colors duration-300">info@freshmart.com</a>
              </li>
              <li className="flex items-start">
                <FaClock className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div className="text-gray-300">
                  <p>Mon - Fri: 8:00 AM - 9:00 PM</p>
                  <p>Sat - Sun: 8:00 AM - 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile footer content - simplified version */}
        <div className="md:hidden text-center py-6 border-t border-gray-700">
          <h3 className="text-xl font-bold mb-4">FreshMart</h3>
          <div className="flex justify-center space-x-4 mb-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
            >
              <FaFacebook size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
            >
              <FaTwitter size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors duration-300"
            >
              <FaYoutube size={18} />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            Contact us: <a href="mailto:info@freshmart.com" className="text-green-400">info@freshmart.com</a>
          </p>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">&copy; {new Date().getFullYear()} FreshMart. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <Link to="/privacy-policy" className="hover:text-green-400 transition-colors duration-300">Privacy Policy</Link>
            <span>|</span>
            <Link to="/terms-of-service" className="hover:text-green-400 transition-colors duration-300">Terms of Service</Link>
            <span>|</span>
            <Link to="/refund-policy" className="hover:text-green-400 transition-colors duration-300">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
