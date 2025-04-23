import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will use the proxy set up in vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    toast.error(message);

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service object with methods for different endpoints
const apiService = {
  // Auth endpoints
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
    debug: () => api.get('/auth/debug'),
  },

  // Categories endpoints
  categories: {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    // Admin category endpoints
    createCategory: (categoryData) => api.post('/admin/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  },

  // Products endpoints
  products: {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    // Admin product endpoints
    createProduct: (productData) => api.post('/admin/products', productData),
    updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  },

  // Track the last cart fetch time to prevent too frequent requests
  _lastCartFetchTime: 0,
  _minFetchInterval: 500, // Minimum time between fetches in milliseconds

  // Cart endpoints
  cart: {
    getCart: () => {
      const now = Date.now();
      const timeSinceLastFetch = now - apiService._lastCartFetchTime;

      // If we've fetched the cart recently, log it and return the same promise
      if (timeSinceLastFetch < apiService._minFetchInterval) {
        console.log(`API: Skipping cart fetch, last fetch was ${timeSinceLastFetch}ms ago`);
        return Promise.resolve({ data: { items: [] } });
      }

      console.log('API: Getting cart');
      apiService._lastCartFetchTime = now;
      return api.get('/cart');
    },
    addToCart: (productId, quantity) => {
      console.log('API: Adding to cart', { productId, quantity });
      // Ensure productId is a number and quantity is at least 1
      const parsedProductId = parseInt(productId);
      const parsedQuantity = Math.max(1, parseInt(quantity) || 1);

      if (isNaN(parsedProductId)) {
        console.error('Invalid product ID:', productId);
        return Promise.reject(new Error('Invalid product ID'));
      }

      console.log('API: Sending request with', { productId: parsedProductId, quantity: parsedQuantity });
      return api.post('/cart/add', { productId: parsedProductId, quantity: parsedQuantity });
    },
    updateCartItem: (itemId, quantity) => {
      console.log('API: Updating cart item', { itemId, quantity });
      return api.put(`/cart/item/${itemId}`, { quantity });
    },
    removeFromCart: (itemId) => {
      console.log('API: Removing from cart', { itemId });
      return api.delete(`/cart/item/${itemId}`);
    },
    clearCart: () => {
      console.log('API: Clearing cart');
      return api.delete('/cart/clear');
    },
  },

  // Orders endpoints
  orders: {
    getMyOrders: () => {
      console.log('API: Getting my orders');
      return api.get('/orders/my-orders');
    },
    getOrderById: (id) => {
      console.log('API: Getting order details', { id });
      return api.get(`/orders/${id}`);
    },
    createOrder: (orderData) => {
      console.log('API: Creating order', { orderData });
      return api.post('/orders', orderData);
    },
    cancelOrder: (id) => {
      console.log('API: Cancelling order', { id });
      return api.put(`/orders/${id}/cancel`);
    },
    // Admin order endpoints
    getAllOrders: () => api.get('/admin/orders'),
    updateOrderStatus: (id, statusData) => api.put(`/admin/orders/${id}/status`, statusData),
  },

  // User endpoints
  user: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
    getWishlist: () => api.get('/users/wishlist'),
    addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
    removeFromWishlist: (wishlistItemId) => api.delete(`/users/wishlist/${wishlistItemId}`),
    // Admin user endpoints
    getAllUsers: () => api.get('/admin/users'),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    createUser: (userData) => api.post('/admin/users', userData),
    updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
  },

  // Test endpoint
  test: {
    ping: () => api.get('/test'),
  },

  // Admin dashboard endpoints
  admin: {
    getDashboardStats: () => api.get('/admin/dashboard'),
  },
};

export default apiService;
