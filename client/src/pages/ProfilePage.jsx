import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import apiService from '../services/api';
import { format } from 'date-fns';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { user: authUser, updateProfile, logout } = useAuth();
  const { orders, loading: ordersLoading, fetchOrders } = useOrder();

  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    id: null,
    type: 'Home',
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Form state for profile update
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Use the authenticated user data from context if available
        if (authUser) {
          console.log('Using auth user data:', authUser);
          setUserData(authUser);

          // Set form data for profile update
          setFormData({
            fullName: authUser.fullName || '',
            email: authUser.email || '',
            phoneNumber: authUser.phoneNumber || '',
            address: authUser.address || '',
            city: authUser.city || '',
            state: authUser.state || '',
            pincode: authUser.pincode || '',
          });

          // Initialize address form data with user data
          setAddressFormData(prev => ({
            ...prev,
            fullName: authUser.fullName || '',
            phoneNumber: authUser.phoneNumber || '',
            address: authUser.address || '',
            city: authUser.city || '',
            state: authUser.state || '',
            pincode: authUser.pincode || '',
          }));

          // Fetch user addresses
          fetchAddresses();
        } else {
          // Fetch user profile from API if not available in context
          console.log('Fetching user profile from API...');
          const profileResponse = await apiService.user.getProfile();
          const userData = profileResponse.data.user;
          console.log('User profile data:', userData);

          setUserData(userData);

          // Set form data for profile update
          setFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || '',
          });

          // Initialize address form data with user data
          setAddressFormData(prev => ({
            ...prev,
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || '',
          }));

          // Fetch user addresses
          fetchAddresses();
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');

        // Use auth user data if available, otherwise set to null
        if (!userData && authUser) {
          setUserData(authUser);
          setFormData({
            fullName: authUser.fullName || '',
            email: authUser.email || '',
            phoneNumber: authUser.phoneNumber || '',
            address: authUser.address || '',
            city: authUser.city || '',
            state: authUser.state || '',
            pincode: authUser.pincode || '',
          });
        } else if (!userData) {
          // Redirect to login if no user data is available
          toast.error('Please login to view your profile');
          logout();
        }

        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      // For now, we'll use mock data since we don't have an address API endpoint
      // In a real app, you would fetch addresses from the server
      const mockAddresses = [
        {
          id: 1,
          type: 'Home',
          fullName: userData?.fullName || '',
          phoneNumber: userData?.phoneNumber || '',
          address: userData?.address || '',
          city: userData?.city || '',
          state: userData?.state || '',
          pincode: userData?.pincode || '',
          isDefault: true
        }
      ];

      setAddresses(mockAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  // Fetch orders when the orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle address form input changes
  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open address form for adding a new address
  const handleAddNewAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      id: null,
      type: 'Home',
      fullName: userData?.fullName || '',
      phoneNumber: userData?.phoneNumber || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: addresses.length === 0 // Make default if it's the first address
    });
    setShowAddressForm(true);
  };

  // Open address form for editing an existing address
  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressFormData({
      ...address
    });
    setShowAddressForm(true);
  };

  // Cancel address form
  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  // Save address (add new or update existing)
  const handleSaveAddress = () => {
    // Validate form
    if (!addressFormData.fullName || !addressFormData.phoneNumber || !addressFormData.address ||
        !addressFormData.city || !addressFormData.state || !addressFormData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingAddressId) {
        // Update existing address
        const updatedAddresses = addresses.map(addr =>
          addr.id === editingAddressId ? { ...addressFormData } : addr
        );

        // If the edited address is set as default, update other addresses
        if (addressFormData.isDefault) {
          updatedAddresses.forEach(addr => {
            if (addr.id !== editingAddressId) {
              addr.isDefault = false;
            }
          });
        }

        setAddresses(updatedAddresses);
        toast.success('Address updated successfully');
      } else {
        // Add new address
        const newAddress = {
          ...addressFormData,
          id: Date.now() // Generate a unique ID (in a real app, this would come from the server)
        };

        // If the new address is set as default, update other addresses
        if (newAddress.isDefault) {
          const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: false
          }));

          setAddresses([...updatedAddresses, newAddress]);
        } else {
          setAddresses([...addresses, newAddress]);
        }

        toast.success('Address added successfully');
      }

      // Close the form
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.');
    }
  };

  // Delete address
  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);

        // If the deleted address was the default and we have other addresses,
        // make the first one the default
        if (addresses.find(addr => addr.id === addressId)?.isDefault && updatedAddresses.length > 0) {
          updatedAddresses[0].isDefault = true;
        }

        setAddresses(updatedAddresses);
        toast.success('Address deleted successfully');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address. Please try again.');
      }
    }
  };

  // Set address as default
  const handleSetDefaultAddress = (addressId) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      setAddresses(updatedAddresses);
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address. Please try again.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Call the API to update the profile
      const response = await apiService.user.updateProfile(formData);
      console.log('Profile update response:', response.data);

      // Update the user data in state
      setUserData(response.data.user);

      // Update the user data in the auth context
      updateProfile(response.data.user);

      toast.success('Profile updated successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      // Use the logout function from the auth context
      logout();

      // Toast notification is handled in the auth context
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  if (loading || (activeTab === 'orders' && ordersLoading)) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="md:flex gap-8">
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="bg-gray-200 h-64 rounded-lg"></div>
            </div>
            <div className="md:w-3/4">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>

      <div className="md:flex gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-2xl font-bold">
                  {userData.fullName.charAt(0)}
                </div>
                <div className="ml-4">
                  <h2 className="font-medium">{userData.fullName}</h2>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <nav>
                <button
                  className={`w-full text-left px-4 py-2 rounded-md mb-2 ${
                    activeTab === 'profile'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-md mb-2 ${
                    activeTab === 'orders'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-md mb-2 ${
                    activeTab === 'addresses'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('addresses')}
                >
                  Addresses
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-md mb-2 ${
                    activeTab === 'wishlist'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  Wishlist
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-md mb-2 ${
                    activeTab === 'security'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  Security
                </button>

                {/* Admin Panel Link - Only visible to admin users */}
                {userData && userData.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block w-full text-left px-4 py-2 rounded-md mb-2 text-purple-700 hover:bg-purple-100"
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-6">Profile Information</h2>

              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <h3 className="font-medium mb-4">Address Information</h3>

                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-medium">My Orders</h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Link to="/products" className="btn btn-primary">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{parseFloat(order.totalAmount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/orders/${order.id}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 border-t bg-gray-50">
                <Link to="/orders" className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center">
                  View All Orders
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">My Addresses</h2>
                {!showAddressForm && (
                  <button
                    className="btn btn-primary text-sm"
                    onClick={handleAddNewAddress}
                  >
                    Add New Address
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className="border rounded-lg p-6 mb-6">
                  <h3 className="font-medium mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <select
                        id="addressType"
                        name="type"
                        value={addressFormData.type}
                        onChange={handleAddressInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="addressFullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="addressFullName"
                        name="fullName"
                        value={addressFormData.fullName}
                        onChange={handleAddressInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="addressPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="addressPhoneNumber"
                        name="phoneNumber"
                        value={addressFormData.phoneNumber}
                        onChange={handleAddressInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="addressLine"
                      name="address"
                      value={addressFormData.address}
                      onChange={handleAddressInputChange}
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="addressCity"
                        name="city"
                        value={addressFormData.city}
                        onChange={handleAddressInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="addressState" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="addressState"
                        name="state"
                        value={addressFormData.state}
                        onChange={handleAddressInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="addressPincode" className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        id="addressPincode"
                        name="pincode"
                        value={addressFormData.pincode}
                        onChange={handleAddressInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressFormData.isDefault}
                        onChange={handleAddressInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={handleCancelAddressForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveAddress}
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {!showAddressForm && (
                <div>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium mb-2">No addresses found</h3>
                      <p className="text-gray-500 mb-6">
                        Add a new address to make checkout easier.
                      </p>
                      <button
                        onClick={handleAddNewAddress}
                        className="btn btn-primary"
                      >
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(address => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <h3 className="font-medium">{address.type}</h3>
                              {address.isDefault && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="space-x-2">
                              <button
                                className="text-sm text-green-600 hover:text-green-700"
                                onClick={() => handleEditAddress(address)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-sm text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p>{address.fullName}</p>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          <p>Phone: {address.phoneNumber}</p>

                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="border rounded-lg p-4 border-dashed flex items-center justify-center h-32">
                        <button
                          className="text-green-600 hover:text-green-700 font-medium"
                          onClick={handleAddNewAddress}
                        >
                          + Add New Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-6">My Wishlist</h2>

              <div className="text-center py-8">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">
                  Add items to your wishlist to keep track of products you're interested in.
                </p>
                <Link to="/products" className="btn btn-primary">
                  Explore Products
                </Link>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <ChangePasswordForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
