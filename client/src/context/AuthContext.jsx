import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const response = await apiService.auth.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with data:', { ...userData, password: userData.password ? '********' : undefined });

      const response = await apiService.auth.register(userData);
      console.log('Registration response:', response.data);

      toast.success('Registration successful! Please login.');
      navigate('/login');
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with credentials:', { email: credentials.email, passwordLength: credentials.password?.length });

      const response = await apiService.auth.login(credentials);
      console.log('Login response:', response.data);

      const { token, user } = response.data;

      // Save to state
      setToken(token);
      setUser(user);

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');
      navigate('/');
      return user;
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.user.updateProfile(userData);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Profile updated successfully!');
      return response.data.user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
