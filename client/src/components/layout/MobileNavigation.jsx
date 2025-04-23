import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const MobileNavigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { itemCount: cartItemsCount } = useCart();

  // Navigation items
  const navItems = [
    { path: '/', icon: <FaHome size={20} />, label: 'Home' },
    { path: '/products', icon: <FaShoppingBag size={20} />, label: 'Products' },
    { path: '/cart', icon: <FaShoppingCart size={20} />, label: 'Cart', badge: cartItemsCount },
    {
      path: isAuthenticated ? '/profile' : '/login',
      icon: <FaUser size={20} />,
      label: isAuthenticated ? 'Profile' : 'Login'
    },
  ];

  // Check if the current path matches the nav item path
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.path) ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
