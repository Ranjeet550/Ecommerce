import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import apiService from '../services/api';
import { format } from 'date-fns';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { FaUser, FaShoppingBag, FaShoppingCart, FaMapMarkerAlt, FaHeart, FaShieldAlt, FaSignOutAlt, FaEdit, FaTrashAlt, FaPlus, FaCheck, FaLock, FaCrown } from 'react-icons/fa';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { user: authUser, updateProfile, logout } = useAuth();
  const { orders, loading: ordersLoading, fetchOrders } = useOrder();
  const { wishlistItems, loading: wishlistLoading, fetchWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

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
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [activeTab, fetchOrders, fetchWishlist]);

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

  if (loading || (activeTab === 'orders' && ordersLoading) || (activeTab === 'wishlist' && wishlistLoading)) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-full mb-8"></div>

          <div className="md:flex gap-8">
            {/* Sidebar skeleton */}
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-200 h-40 rounded-t-xl"></div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="md:w-3/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-teal-500 text-white rounded-xl p-8 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -mb-10 -ml-10"></div>

        <div className="relative z-10">
          <div className="flex items-center">
            <div className="mr-6 bg-white bg-opacity-20 p-4 rounded-lg shadow-inner">
              <FaUser className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Account</h1>
              <p className="mt-2 text-green-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Manage your profile, orders, and preferences
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm flex items-center">
              <FaUser className="mr-2 text-xs" />
              {userData.fullName}
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {userData.email}
            </div>
            {userData.phoneNumber && (
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {userData.phoneNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:flex gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4 mb-6 md:mb-0">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mt-10 -mr-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full -mb-8 -ml-8"></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg border-2 border-white border-opacity-30 transform hover:scale-105 transition-transform duration-300">
                  {userData.fullName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-white">{userData.fullName}</h2>
                <p className="text-sm text-blue-100 mt-1 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {userData.email}
                </p>

                {userData && userData.role === 'admin' && (
                  <div className="mt-3 bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <FaCrown className="mr-2 text-yellow-300" /> Administrator
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              <nav className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-medium border-l-4 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <FaUser />
                    </div>
                    <span>Profile</span>
                  </div>
                  {activeTab === 'profile' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${activeTab === 'orders' ? 'text-blue-600' : 'text-gray-400'}`}>
                      <FaShoppingBag />
                    </div>
                    <span>Orders</span>
                  </div>
                  {orders.length > 0 ? (
                    <span className={`text-xs rounded-full px-2 py-1 ${
                      activeTab === 'orders' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {orders.length}
                    </span>
                  ) : activeTab === 'orders' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeTab === 'addresses'
                      ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-medium border-l-4 border-green-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${activeTab === 'addresses' ? 'text-green-600' : 'text-gray-400'}`}>
                      <FaMapMarkerAlt />
                    </div>
                    <span>Addresses</span>
                  </div>
                  {activeTab === 'addresses' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeTab === 'wishlist'
                      ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium border-l-4 border-red-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${activeTab === 'wishlist' ? 'text-red-600' : 'text-gray-400'}`}>
                      <FaHeart />
                    </div>
                    <span>Wishlist</span>
                  </div>
                  {wishlistItems && wishlistItems.length > 0 ? (
                    <span className={`text-xs rounded-full px-2 py-1 ${
                      activeTab === 'wishlist' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {wishlistItems.length}
                    </span>
                  ) : activeTab === 'wishlist' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 font-medium border-l-4 border-yellow-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 ${activeTab === 'security' ? 'text-yellow-600' : 'text-gray-400'}`}>
                      <FaShieldAlt />
                    </div>
                    <span>Security</span>
                  </div>
                  {activeTab === 'security' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Admin Panel Link - Only visible to admin users */}
                {userData && userData.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 text-purple-700 hover:bg-purple-50 border-l-4 border-transparent hover:border-purple-500 group"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-purple-500">
                        <FaCrown />
                      </div>
                      <span>Admin Panel</span>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full group-hover:bg-purple-200 transition-colors duration-200">
                      New
                    </span>
                  </Link>
                )}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between text-red-600 hover:bg-red-50 transition-all duration-200 border-l-4 border-transparent hover:border-red-500 group"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <FaSignOutAlt />
                      </div>
                      <span>Logout</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zM2 4a2 2 0 012-2h5.586a1 1 0 01.707.293l6 6a1 1 0 01.293.707V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Profile Information</h2>
                      <p className="text-indigo-100 text-sm mt-1">Update your personal details and preferences</p>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    Personal Details
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        disabled
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Email cannot be changed for security reasons
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-100">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                    <FaMapMarkerAlt className="text-green-600 mr-2" />
                    Address Information
                  </h3>

                  <div className="mb-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter your street address"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter your city"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter your state"
                      />
                    </div>

                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter your pincode"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Profile
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="flex items-center justify-between p-8 border-b">
                <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FaShoppingBag className="mr-1 text-blue-500" />
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center bg-gray-50">
                  <FaShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold mb-3">No orders yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    You haven't placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 inline-flex items-center"
                  >
                    Start Shopping
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              #{order.id}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              ₹{parseFloat(order.totalAmount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/orders/${order.id}`}
                              className="text-green-600 hover:text-green-700 font-medium flex items-center"
                            >
                              View Details
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {orders.length > 0 && (
                <div className="p-6 border-t bg-gray-50 text-center">
                  <Link
                    to="/orders"
                    className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
                  >
                    View All Orders
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
                {!showAddressForm && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                    onClick={handleAddNewAddress}
                  >
                    <FaPlus className="mr-2" />
                    Add New Address
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className="border border-gray-200 rounded-lg p-8 mb-8 bg-gray-50">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <FaEdit className="text-green-600 mr-2" />
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>

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

                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center"
                      onClick={handleCancelAddressForm}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                      onClick={handleSaveAddress}
                    >
                      <FaCheck className="mr-2" />
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {!showAddressForm && (
                <div>
                  {addresses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                      <FaMapMarkerAlt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-bold mb-3">No addresses found</h3>
                      <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Add a new address to make checkout faster and easier.
                      </p>
                      <button
                        onClick={handleAddNewAddress}
                        className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 inline-flex items-center"
                      >
                        <FaPlus className="mr-2" />
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(address => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300 bg-white">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                address.type === 'Home' ? 'bg-blue-100 text-blue-800' :
                                address.type === 'Work' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                  <FaCheck className="mr-1" /> Default
                                </span>
                              )}
                            </div>
                            <div className="space-x-2 flex">
                              <button
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                onClick={() => handleEditAddress(address)}
                                title="Edit Address"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                onClick={() => handleDeleteAddress(address.id)}
                                title="Delete Address"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4 mt-2">
                            <h4 className="font-bold text-gray-800">{address.fullName}</h4>
                            <div className="mt-2 text-gray-600 space-y-1">
                              <p className="flex items-start">
                                <FaMapMarkerAlt className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                                <span>{address.address}</span>
                              </p>
                              <p className="ml-6">{address.city}, {address.state} - {address.pincode}</p>
                              <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {address.phoneNumber}
                              </p>
                            </div>
                          </div>

                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="mt-4 px-4 py-2 bg-white border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center"
                            >
                              <FaCheck className="mr-1" />
                              Set as Default
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center h-48 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={handleAddNewAddress}>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                          <FaPlus className="text-green-600" />
                        </div>
                        <p className="text-gray-700 font-medium">Add New Address</p>
                        <p className="text-gray-500 text-sm mt-1">Make checkout faster</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FaHeart className="mr-1 text-red-500" />
                  {wishlistItems && wishlistItems.length} {wishlistItems && wishlistItems.length === 1 ? 'Item' : 'Items'}
                </div>
              </div>

              {!wishlistItems || wishlistItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                  <FaHeart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold mb-3">Your wishlist is empty</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Add items to your wishlist to keep track of products you're interested in purchasing later.
                  </p>
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 inline-flex items-center"
                  >
                    Explore Products
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                      <Link to={`/products/${item.productId}`} className="block">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}`;
                            }}
                          />
                          {item.discount > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {item.discount}% OFF
                            </div>
                          )}
                          <button
                            className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Find the wishlist item with this product ID
                              const wishlistItem = wishlistItems.find(wItem => wItem.productId === item.productId);
                              if (wishlistItem) {
                                removeFromWishlist(wishlistItem.id);
                              }
                            }}
                          >
                            <FaTrashAlt className="text-red-500" />
                          </button>
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link to={`/products/${item.productId}`} className="block">
                          <h3 className="text-lg font-medium text-gray-800 hover:text-green-600 mb-2 truncate">
                            {item.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through ml-2">₹{item.originalPrice}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{item.unit}</span>
                        </div>

                        <button
                          onClick={() => {
                            // Format product for cart
                            const productToAdd = {
                              id: parseInt(item.productId),
                              name: item.name,
                              image: item.image,
                              price: parseFloat(item.price),
                              originalPrice: parseFloat(item.originalPrice || item.price),
                              unit: item.unit || 'each'
                            };

                            addToCart(productToAdd, 1);
                            toast.success(`${item.name} added to cart`);
                          }}
                          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <FaShoppingCart className="mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {wishlistItems && wishlistItems.length > 0 && (
                <div className="mt-8 text-center">
                  <Link
                    to="/wishlist"
                    className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
                  >
                    View All Wishlist Items
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              )}
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
