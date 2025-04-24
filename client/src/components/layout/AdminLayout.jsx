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
  FiShoppingCart,
  FiBarChart2,
  FiPackage,
  FiDollarSign,
  FiClock
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

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
    { path: '/admin', icon: <FiBarChart2 size={20} />, label: 'Dashboard', badge: null },
    { path: '/admin/products', icon: <FiShoppingBag size={20} />, label: 'Products', badge: 'Products' },
    { path: '/admin/categories', icon: <FiGrid size={20} />, label: 'Categories', badge: 'Categories' },
    { path: '/admin/orders', icon: <FiShoppingCart size={20} />, label: 'Orders', badge: 'Orders' },
    { path: '/admin/users', icon: <FiUsers size={20} />, label: 'Users', badge: 'Users' },
    { path: '/admin/settings', icon: <FiSettings size={20} />, label: 'Settings', badge: null },
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
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out border-r border-gray-200 overflow-hidden`}
      >
        {/* Admin Panel Header */}
        <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white py-8 px-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/admin" className="text-2xl font-bold flex items-center group">
                <div className="mr-3 bg-white bg-opacity-20 p-2 rounded-lg transform group-hover:rotate-12 transition-transform duration-300">
                  <FaCrown className="text-yellow-300 drop-shadow" />
                </div>
                <div>
                  <span className="tracking-wide">Admin Panel</span>
                  <div className="h-1 w-0 group-hover:w-full bg-white mt-1 transition-all duration-300"></div>
                </div>
              </Link>
              <p className="text-green-100 text-sm mt-2 ml-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Manage your store efficiently
              </p>
            </div>
            <button
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 lg:hidden focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 hover:rotate-90"
              onClick={closeSidebar}
            >
              <FiX size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable sidebar content */}
        <div className="h-[calc(100vh-176px)] overflow-y-auto pr-1">
          {/* Admin Profile */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-5 text-white relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mt-10 -mr-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full -mb-8 -ml-8"></div>

              <div className="flex items-center relative z-10">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white border-opacity-30 transform hover:scale-105 transition-transform duration-300">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="ml-4">
                  <p className="font-bold text-white text-lg">{user?.fullName || 'Admin User'}</p>
                  <p className="text-sm text-blue-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center">
                <FaCrown className="mr-1 text-yellow-500" /> Administrator
              </div>
              <Link
                to="/profile"
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center group"
              >
                Edit Profile
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-4">
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-medium border-l-4 border-green-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  } ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                  onClick={closeSidebar}
                >
                  <div className="flex items-center">
                    <span className={`mr-3 ${location.pathname === item.path ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs rounded-full px-2 py-1 ${
                      location.pathname === item.path
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {item.badge === 'Products' && '10+'}
                      {item.badge === 'Orders' && '5'}
                      {item.badge === 'Users' && '20'}
                      {item.badge === 'Categories' && '8'}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Utility Links */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-50 group"
            >
              <span className="mr-3 text-gray-400 group-hover:text-green-500 transition-colors duration-200">
                <FiPackage size={20} />
              </span>
              <span>View Store</span>
              <span className="ml-auto transform group-hover:translate-x-1 transition-transform duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 group"
            >
              <span className="mr-3 group-hover:text-red-700 transition-colors duration-200">
                <FiLogOut size={20} />
              </span>
              <span>Logout</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm">
          <div className="flex items-center">
            <button
              className="p-2 rounded-full hover:bg-gray-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={toggleSidebar}
            >
              <FiMenu size={24} />
            </button>
            <div className="ml-4 lg:hidden flex items-center">
              <FaCrown className="text-green-600 mr-2" />
              <span className="font-medium text-gray-800">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <FiClock className="mr-1" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <Link
              to="/"
              className="hidden md:flex items-center text-gray-600 hover:text-green-600 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
            >
              <FiPackage className="mr-1" />
              <span>View Store</span>
            </Link>
            <div className="relative">
              <Link to="/profile" className="block">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white hover:border-green-100 transition-colors">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
