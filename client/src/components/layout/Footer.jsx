import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-4 pb-2">
      <div className="container-custom">
        <div className="hidden md:grid md:grid-cols-4 gap-4">
        {/* Desktop footer content */}
          {/* About */}
          <div>
            <h3 className="text-xl font-semibold mb-2">FreshMart</h3>
            <p className="text-gray-300 mb-2">
              Your one-stop shop for fresh groceries delivered to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/products?category=1" className="text-gray-300 hover:text-white">
                  Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=2" className="text-gray-300 hover:text-white">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link to="/products?category=3" className="text-gray-300 hover:text-white">
                  Bakery
                </Link>
              </li>
              <li>
                <Link to="/products?category=4" className="text-gray-300 hover:text-white">
                  Meat & Seafood
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-1">123 Grocery Street</p>
              <p className="mb-1">Fresh City, FC 12345</p>
              <p className="mb-1">Phone: (123) 456-7890</p>
              <p className="mb-1">Email: info@freshmart.com</p>
            </address>
          </div>
        </div>

        {/* Mobile footer content - simplified version */}
        <div className="md:hidden text-center py-2">
          <h3 className="text-lg font-semibold mb-2">FreshMart</h3>
          <div className="flex justify-center space-x-4 mb-2">
            <a href="#" className="text-gray-300 hover:text-white"><FaFacebook /></a>
            <a href="#" className="text-gray-300 hover:text-white"><FaTwitter /></a>
            <a href="#" className="text-gray-300 hover:text-white"><FaInstagram /></a>
            <a href="#" className="text-gray-300 hover:text-white"><FaYoutube /></a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-2 pt-2 text-center text-gray-300 text-sm">
          <p>&copy; {new Date().getFullYear()} FreshMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
