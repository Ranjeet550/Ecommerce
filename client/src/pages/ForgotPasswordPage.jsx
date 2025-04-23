import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      await apiService.auth.forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      console.error('Forgot password error:', error);
      // Don't show error message as it might reveal if the email exists or not
      // Instead, still show success message for security reasons
      setEmailSent(true);
      toast.success('If your email is registered, you will receive password reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        
        {emailSent ? (
          <div className="text-center">
            <div className="mb-6 text-green-600 bg-green-50 p-4 rounded-md">
              <p className="mb-2">Password reset instructions sent!</p>
              <p className="text-sm text-gray-600">
                We've sent an email with instructions to reset your password. 
                Please check your inbox and spam folder.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
              <button 
                onClick={() => setEmailSent(false)} 
                className="text-green-600 hover:text-green-700"
              >
                Try another email
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPasswordPage;
