import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Validate token format (basic check)
  useEffect(() => {
    if (!token || token.length < 32) {
      setTokenValid(false);
      toast.error('Invalid reset token');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await apiService.auth.resetPassword(token, password);
      setResetSuccess(true);
      toast.success('Password reset successful');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      
      // If token is invalid or expired
      if (error.response?.data?.error === 'Invalid or expired token') {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Invalid Reset Link</h1>
          <div className="text-center mb-6 text-red-600 bg-red-50 p-4 rounded-md">
            <p className="mb-2">This password reset link is invalid or has expired.</p>
            <p className="text-sm text-gray-600">
              Please request a new password reset link.
            </p>
          </div>
          <div className="flex justify-center">
            <Link to="/forgot-password" className="btn btn-primary">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        
        {resetSuccess ? (
          <div className="text-center">
            <div className="mb-6 text-green-600 bg-green-50 p-4 rounded-md">
              <p className="mb-2">Password Reset Successful!</p>
              <p className="text-sm text-gray-600">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Enter your new password below.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter new password"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/login" className="text-green-600 hover:text-green-700">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
