import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { currentOrder, loading, fetchOrderDetails, cancelOrder } = useOrder();
  
  useEffect(() => {
    fetchOrderDetails(id);
  }, [fetchOrderDetails, id]);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // Helper function to get status badge color
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
  
  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const success = await cancelOrder(id);
      if (success) {
        toast.success('Order cancelled successfully');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (!currentOrder) {
    return (
      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-xl font-medium mb-4">Order not found</h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  // Parse shipping address
  let shippingAddress = {};
  try {
    shippingAddress = JSON.parse(currentOrder.shippingAddress);
  } catch (error) {
    console.error('Error parsing shipping address:', error);
    shippingAddress = { address: currentOrder.shippingAddress };
  }
  
  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Order #{currentOrder.id}</h1>
        <Link to="/orders" className="text-green-600 hover:text-green-700 font-medium flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-wrap justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium mb-2">Order Information</h2>
              <p className="text-gray-600">
                <span className="font-medium">Date Placed:</span> {formatDate(currentOrder.createdAt)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Order Status:</span>{' '}
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentOrder.status)}`}>
                  {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                </span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Payment Method:</span> {currentOrder.paymentMethod.toUpperCase()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Payment Status:</span>{' '}
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  currentOrder.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                </span>
              </p>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-2">Shipping Address</h2>
              <p className="text-gray-600">{shippingAddress.fullName}</p>
              <p className="text-gray-600">{shippingAddress.address}</p>
              <p className="text-gray-600">
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
              </p>
              <p className="text-gray-600">Phone: {shippingAddress.phoneNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrder.items && currentOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'}
                            alt={item.name}
                            className="h-full w-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{parseFloat(currentOrder.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">₹{parseFloat(currentOrder.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          
          {currentOrder.status === 'pending' && (
            <div className="mt-6 text-right">
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
