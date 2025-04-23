import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, loading, updateCartItem, removeFromCart, clearCart, fetchCart } = useCart();

  // We don't need to fetch the cart here anymore since it's already being fetched in the CartContext
  // The CartContext will handle fetching the cart when the component mounts
  // This prevents duplicate API calls

  const handleQuantityChange = async (id, change) => {
    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) {
        console.error('Item not found in cart:', id);
        return;
      }

      const newQuantity = Math.max(1, item.quantity + change);
      await updateCartItem(id, newQuantity);
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart. Please try again.');
    }
  };

  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((total, item) =>
    total + ((item.originalPrice - item.price) * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="md:flex gap-8">
            <div className="md:w-2/3 mb-6 md:mb-0">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-gray-200 h-32 rounded-lg mb-4"></div>
              ))}
            </div>
            <div className="md:w-1/3">
              <div className="bg-gray-200 h-64 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="md:flex gap-8">
          {/* Cart Items */}
          <div className="md:w-2/3 mb-8 md:mb-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-medium">Cart Items ({cartItems.length})</h2>
                <button
                  className="text-sm text-red-600 hover:text-red-800"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>

              <div>
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="p-4 border-b last:border-b-0 flex flex-col sm:flex-row gap-4"
                  >
                    {/* Product Image */}
                    <div className="sm:w-24 h-24 flex-shrink-0">
                      <Link to={`/products/${item.productId}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-lg font-medium text-gray-800 hover:text-green-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mb-2">{item.unit}</p>

                      <div className="flex flex-wrap justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-900">₹{item.price}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center mt-2 sm:mt-0">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-300 rounded-md mr-4">
                            <button
                              className="px-2 py-1 text-gray-600 hover:text-green-600"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="px-3 py-1 border-l border-r border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              className="px-2 py-1 text-gray-600 hover:text-green-600"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            className="text-gray-500 hover:text-red-600"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
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
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-medium mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {deliveryFee > 0 && (
                <p className="text-sm text-gray-600 mb-6">
                  Add ₹{(500 - subtotal).toFixed(2)} more to get free delivery
                </p>
              )}

              <Link
                to="/checkout"
                className="btn btn-primary w-full text-center"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>We accept:</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 rounded">Credit Card</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Debit Card</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">UPI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
