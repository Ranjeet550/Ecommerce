import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiShoppingBag,
  FiGrid,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiShoppingCart
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FiShoppingBag size={20} />, label: 'Products' },
    { path: '/admin/categories', icon: <FiGrid size={20} />, label: 'Categories' },
    { path: '/admin/orders', icon: <FiShoppingCart size={20} />, label: 'Orders' },
    { path: '/admin/users', icon: <FiUsers size={20} />, label: 'Users' },
    { path: '/admin/settings', icon: <FiSettings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/admin" className="text-xl font-bold text-green-600">
            Admin Panel
          </Link>
          <button
            className="p-1 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={closeSidebar}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center p-3 mb-6 bg-gray-100 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeSidebar}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 mt-4 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="mr-3">
                <FiLogOut size={20} />
              </span>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <button
            className="p-1 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={toggleSidebar}
          >
            <FiMenu size={24} />
          </button>

          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-600 hover:text-green-600">
              View Store
            </Link>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
