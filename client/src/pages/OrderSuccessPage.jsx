import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import confetti from 'canvas-confetti';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { currentOrder, loading, fetchOrderDetails } = useOrder();
  
  useEffect(() => {
    // Fetch order details
    fetchOrderDetails(id);
    
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };
    
    const confettiAnimation = () => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return;
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // since particles fall down, start a bit higher than random
      confetti({
        particleCount,
        spread: randomInRange(50, 70),
        origin: { y: 0.6 }
      });
      
      requestAnimationFrame(confettiAnimation);
    };
    
    confettiAnimation();
  }, [fetchOrderDetails, id]);
  
  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded-lg w-3/4 mx-auto mb-8"></div>
          <div className="h-12 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your order has been placed and is being processed.
        </p>
        
        {currentOrder && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="font-medium">Order Number: <span className="font-normal">#{currentOrder.id}</span></p>
            <p className="font-medium">Total Amount: <span className="font-normal">₹{parseFloat(currentOrder.totalAmount).toFixed(2)}</span></p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to={`/orders/${id}`}
            className="btn btn-primary"
          >
            View Order Details
          </Link>
          
          <Link
            to="/products"
            className="btn btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
