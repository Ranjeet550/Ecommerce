import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUsers, FiShoppingCart, FiGrid, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import apiService from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

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
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/products" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all products
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiGrid size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Categories</p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/categories" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all categories
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View all users
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <FiShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              View all orders
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="font-medium">Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                          #{order.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {order.user?.fullName || order.fullName || 'Unknown User'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status || 'pending')}`}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all orders
              </Link>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="font-medium">Top Selling Products</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topProducts.map(product => (
                <div key={product.id} className="flex items-center">
                  {product.image ? (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded mr-4"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = getPlaceholderImage(product.name);
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded mr-4 flex items-center justify-center text-gray-500 text-xs">
                      <img
                        src={getPlaceholderImage(product.name)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="font-medium">{product.name || 'Unknown Product'}</h3>
                    <p className="text-sm text-gray-500">₹{parseFloat(product.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600">
                      <FiTrendingUp className="mr-1" />
                      <span>{product.sales || 0} sales</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/admin/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
