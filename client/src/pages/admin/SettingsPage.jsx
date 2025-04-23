import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import apiService from '../../services/api';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Grocery Store',
    storeEmail: 'contact@grocerystore.com',
    storePhone: '+91 1234567890',
    storeAddress: '123 Main Street, City, State, 123456',
    currency: 'INR',
    currencySymbol: '₹',
    logo: '',
    favicon: ''
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    enableCOD: true,
    enableOnlinePayment: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    minOrderAmount: '0',
    freeShippingThreshold: '500'
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: ''
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch settings from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePaymentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would save settings to the API
      // await apiService.settings.updateGeneralSettings(generalSettings);
      
      toast.success('General settings updated successfully');
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    }
  };
  
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would save settings to the API
      // await apiService.settings.updatePaymentSettings(paymentSettings);
      
      toast.success('Payment settings updated successfully');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would save settings to the API
      // await apiService.settings.updateEmailSettings(emailSettings);
      
      toast.success('Email settings updated successfully');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    }
  };
  
  if (loading) {
    return (
      
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      
    );
  }
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-medium">General Settings</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleGeneralSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={generalSettings.storeName}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  id="storeEmail"
                  name="storeEmail"
                  value={generalSettings.storeEmail}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Phone
                </label>
                <input
                  type="text"
                  id="storePhone"
                  name="storePhone"
                  value={generalSettings.storePhone}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Address
                </label>
                <input
                  type="text"
                  id="storeAddress"
                  name="storeAddress"
                  value={generalSettings.storeAddress}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  id="currency"
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  id="currencySymbol"
                  name="currencySymbol"
                  value={generalSettings.currencySymbol}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logo"
                  name="logo"
                  value={generalSettings.logo}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="favicon" className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon URL
                </label>
                <input
                  type="text"
                  id="favicon"
                  name="favicon"
                  value={generalSettings.favicon}
                  onChange={handleGeneralInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiSave className="mr-2" />
                Save General Settings
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-medium">Payment Settings</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="enableCOD"
                  name="enableCOD"
                  checked={paymentSettings.enableCOD}
                  onChange={handlePaymentInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="enableCOD" className="ml-2 block text-sm text-gray-900">
                  Enable Cash on Delivery
                </label>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="enableOnlinePayment"
                  name="enableOnlinePayment"
                  checked={paymentSettings.enableOnlinePayment}
                  onChange={handlePaymentInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="enableOnlinePayment" className="ml-2 block text-sm text-gray-900">
                  Enable Online Payment (Razorpay)
                </label>
              </div>
            </div>
            
            {paymentSettings.enableOnlinePayment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="razorpayKeyId" className="block text-sm font-medium text-gray-700 mb-1">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    id="razorpayKeyId"
                    name="razorpayKeyId"
                    value={paymentSettings.razorpayKeyId}
                    onChange={handlePaymentInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="razorpayKeySecret" className="block text-sm font-medium text-gray-700 mb-1">
                    Razorpay Key Secret
                  </label>
                  <input
                    type="password"
                    id="razorpayKeySecret"
                    name="razorpayKeySecret"
                    value={paymentSettings.razorpayKeySecret}
                    onChange={handlePaymentInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  id="minOrderAmount"
                  name="minOrderAmount"
                  value={paymentSettings.minOrderAmount}
                  onChange={handlePaymentInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  id="freeShippingThreshold"
                  name="freeShippingThreshold"
                  value={paymentSettings.freeShippingThreshold}
                  onChange={handlePaymentInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiSave className="mr-2" />
                Save Payment Settings
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="font-medium">Email Settings</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleEmailSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={handleEmailInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="text"
                  id="smtpPort"
                  name="smtpPort"
                  value={emailSettings.smtpPort}
                  onChange={handleEmailInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  id="smtpUsername"
                  name="smtpUsername"
                  value={emailSettings.smtpUsername}
                  onChange={handleEmailInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  name="smtpPassword"
                  value={emailSettings.smtpPassword}
                  onChange={handleEmailInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  value={emailSettings.fromEmail}
                  onChange={handleEmailInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  value={emailSettings.fromName}
                  onChange={handleEmailInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiSave className="mr-2" />
                Save Email Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
