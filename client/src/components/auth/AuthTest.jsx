import { useState } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const AuthTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAuthAPI = async () => {
    try {
      setLoading(true);
      const response = await apiService.auth.debug();
      setTestResult(response.data);
      toast.success('Auth API is working!');
    } catch (error) {
      console.error('Auth API test failed:', error);
      setTestResult({
        success: false,
        message: 'Auth API test failed',
        error: error.message
      });
      toast.error('Auth API test failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Auth API Test</h2>
      
      <button
        onClick={testAuthAPI}
        disabled={loading}
        className="btn btn-primary mb-4"
      >
        {loading ? 'Testing...' : 'Test Auth API'}
      </button>
      
      {testResult && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Test Result:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
