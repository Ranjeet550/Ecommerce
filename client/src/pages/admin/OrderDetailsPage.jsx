import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPrinter } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import apiService from '../../services/api';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusOptions] = useState(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
  const [paymentStatusOptions] = useState(['pending', 'completed', 'failed']);
  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.orders.getOrderById(id);
      console.log('Order details response:', response.data);
      setOrder(response.data.order);
      setNewStatus(response.data.order.status);
      setNewPaymentStatus(response.data.order.paymentStatus);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
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

  const handleUpdateStatus = async () => {
    try {
      console.log('Updating order status:', { id, status: newStatus, paymentStatus: newPaymentStatus });

      const response = await apiService.orders.updateOrderStatus(id, {
        status: newStatus,
        paymentStatus: newPaymentStatus
      });

      console.log('Update status response:', response.data);

      setOrder({
        ...order,
        status: newStatus,
        paymentStatus: newPaymentStatus
      });

      setEditStatus(false);
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to update order status: ${errorMessage}`);
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="btn btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Parse shipping address
  let shippingAddress = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch (error) {
    console.error('Error parsing shipping address:', error);
    shippingAddress = { address: order.shippingAddress };
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/orders')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>
        <button
          onClick={handlePrintOrder}
          className="btn btn-secondary flex items-center"
        >
          <FiPrinter className="mr-2" />
          Print Order
        </button>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium mb-2">Order Status</h2>
            <div className="flex items-center">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(order.status || 'pending')}`}>
                {order.status
                  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                  : 'Pending'}
              </span>
              <span className="mx-2">|</span>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                (order.paymentStatus || '') === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : (order.paymentStatus || '') === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                Payment: {order.paymentStatus
                  ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                  : 'Pending'}
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            {editStatus ? (
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  >
                    {paymentStatusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleUpdateStatus}
                    className="btn btn-primary flex items-center"
                  >
                    <FiSave className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditStatus(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditStatus(true)}
                className="btn btn-primary"
              >
                Update Status
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Info and Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Order Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span>{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</span>
            </div>
            {order.updatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Customer Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span>{order.user?.fullName || shippingAddress.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{order.user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span>{shippingAddress.phoneNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
        <div className="space-y-1">
          <p>{shippingAddress.fullName || 'N/A'}</p>
          <p>{shippingAddress.address || 'N/A'}</p>
          <p>
            {shippingAddress.city || 'N/A'},
            {shippingAddress.state || 'N/A'}
            {shippingAddress.pincode ? `- ${shippingAddress.pincode}` : ''}
          </p>
          <p>Phone: {shippingAddress.phoneNumber || 'N/A'}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items && order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = getPlaceholderImage(item.name);
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">
                            <img
                              src={getPlaceholderImage(item.name)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name || 'Unknown Product'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{parseFloat(item.price || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{(parseFloat(item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t">
          <div className="flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Order Notes</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
          rows="3"
          placeholder="Add notes about this order (only visible to admins)"
        ></textarea>
        <div className="mt-2 flex justify-end">
          <button className="btn btn-primary">Save Notes</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetailsPage;
