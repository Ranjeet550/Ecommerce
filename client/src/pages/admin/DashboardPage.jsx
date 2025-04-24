import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiUsers,
  FiShoppingCart,
  FiGrid,
  FiTrendingUp,
  FiBarChart2,
  FiDollarSign,
  FiPackage,
  FiArrowRight,
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import apiService from '../../services/api';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats from API
        const response = await apiService.admin.getDashboardStats();
        console.log('Dashboard stats:', response.data);

        if (response.data && response.data.success) {
          setStats({
            totalProducts: response.data.totalProducts || 0,
            totalCategories: response.data.totalCategories || 0,
            totalUsers: response.data.totalUsers || 0,
            totalOrders: response.data.totalOrders || 0,
            recentOrders: response.data.recentOrders || [],
            topProducts: response.data.topProducts || []
          });
        } else {
          // If API fails, use empty data
          setStats({
            totalProducts: 0,
            totalCategories: 0,
            totalUsers: 0,
            totalOrders: 0,
            recentOrders: [],
            topProducts: []
          });
          toast.error('Failed to load dashboard data');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');

        // If API fails, use empty data
        setStats({
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          totalOrders: 0,
          recentOrders: [],
          topProducts: []
        });

        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-32 bg-gray-200 rounded-xl w-full mb-8"></div>

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 h-40 rounded-xl border border-gray-100"></div>
          ))}
        </div>

        {/* Revenue Overview skeleton */}
        <div className="bg-gray-200 h-80 rounded-xl mb-8 border border-gray-100"></div>

        {/* Recent Orders and Top Products skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-96 rounded-xl border border-gray-100"></div>
          <div className="bg-gray-200 h-96 rounded-xl border border-gray-100"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold flex items-center">
          <FiBarChart2 className="mr-3" /> Dashboard
        </h1>
        <p className="mt-2 text-green-100">Welcome to your store admin panel</p>
        <div className="mt-4 text-sm bg-white bg-opacity-20 rounded-lg px-3 py-1 inline-flex items-center">
          <FiClock className="mr-1" /> Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/admin/products" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
              Manage Products <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiGrid size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Categories</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCategories}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/admin/categories" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              Manage Categories <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/admin/users" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
              Manage Users <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <FiShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/admin/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
              Manage Orders <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Overview Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FiDollarSign className="mr-2 text-green-600" /> Revenue Overview
          </h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md">Today</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">Week</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">Month</button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg flex-1 mx-2 first:ml-0 last:mr-0">
            <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-800">₹{(Math.random() * 10000).toFixed(2)}</p>
            <p className="text-xs text-green-600 flex items-center justify-center mt-1">
              <FiTrendingUp className="mr-1" /> +12.5% from yesterday
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg flex-1 mx-2">
            <p className="text-sm text-gray-500 mb-1">Weekly Revenue</p>
            <p className="text-2xl font-bold text-gray-800">₹{(Math.random() * 50000).toFixed(2)}</p>
            <p className="text-xs text-green-600 flex items-center justify-center mt-1">
              <FiTrendingUp className="mr-1" /> +8.2% from last week
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg flex-1 mx-2">
            <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-800">₹{(Math.random() * 200000).toFixed(2)}</p>
            <p className="text-xs text-green-600 flex items-center justify-center mt-1">
              <FiTrendingUp className="mr-1" /> +15.3% from last month
            </p>
          </div>
        </div>

        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Revenue chart will be displayed here</p>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FiShoppingCart className="mr-2 text-orange-600" /> Recent Orders
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              Last {stats.recentOrders.length} Orders
            </span>
          </div>
          <div className="p-6">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">No recent orders found</p>
                <button
                  onClick={() => toast.success('Order data will be refreshed soon')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold mr-2">
                              {(order.user?.fullName || order.fullName || 'U').charAt(0)}
                            </div>
                            <span>{order.user?.fullName || order.fullName || 'Unknown User'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-800">
                          ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status || 'pending')}`}>
                            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 text-gray-400" />
                            {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 text-center">
              <Link to="/admin/orders" className="text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center">
                View All Orders <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FiPackage className="mr-2 text-green-600" /> Top Selling Products
            </h2>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Best Performers
            </span>
          </div>
          <div className="p-6">
            {stats.topProducts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">No top products found</p>
                <button
                  onClick={() => toast.success('Product data will be refreshed soon')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map(product => (
                  <div key={product.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = getPlaceholderImage(product.name);
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center text-gray-500 text-xs border border-gray-200">
                        <img
                          src={getPlaceholderImage(product.name)}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-800">{product.name || 'Unknown Product'}</h3>
                      <div className="flex items-center mt-1">
                        <span className="font-bold text-gray-800 mr-2">₹{parseFloat(product.price || 0).toFixed(2)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-gray-500 line-through">₹{parseFloat(product.originalPrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <FiTrendingUp className="mr-1" />
                        <span className="font-medium">{product.sales || 0} sales</span>
                      </div>
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                      >
                        Edit Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Link to="/admin/products" className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center">
                View All Products <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
