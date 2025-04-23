import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, cartTotal, cartDiscount, itemCount } = useCart();
  const { createOrder, loading: orderLoading } = useOrder();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.fullName || '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (!cartLoading && cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  // Calculate delivery fee
  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const total = cartTotal + deliveryFee;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Validate form
    const { fullName, phoneNumber, address, city, state, pincode } = shippingInfo;
    if (!fullName || !phoneNumber || !address || !city || !state || !pincode) {
      toast.error('Please fill all the fields');
      return;
    }

    // Move to next step
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Move to next step
    setStep(3);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Create order
      const order = await createOrder(shippingInfo, paymentMethod);

      if (order) {
        // Redirect to order success page
        navigate(`/order-success/${order.id}`);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  if (loading || cartLoading || orderLoading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="md:flex gap-8">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
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
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

      {/* Checkout Steps */}
      <div className="flex justify-between mb-8">
        <div className="flex-1 text-center">
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <p className={`mt-2 text-sm ${step >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Shipping
          </p>
        </div>
        <div className="w-full max-w-[100px] flex items-center">
          <div className={`h-1 w-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex-1 text-center">
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <p className={`mt-2 text-sm ${step >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Payment
          </p>
        </div>
        <div className="w-full max-w-[100px] flex items-center">
          <div className={`h-1 w-full ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex-1 text-center">
          <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
            step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
          <p className={`mt-2 text-sm ${step >= 3 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Review
          </p>
        </div>
      </div>

      <div className="md:flex gap-8">
        {/* Main Content */}
        <div className="md:w-2/3 mb-8 md:mb-0">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-6">Shipping Information</h2>

              <form onSubmit={handleShippingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={shippingInfo.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    required
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
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
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
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
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
                      value={shippingInfo.pincode}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link to="/cart" className="text-green-600 hover:text-green-700 font-medium">
                    Back to Cart
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-6">Payment Method</h2>

              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 font-medium">Cash on Delivery</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Pay when your order is delivered
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 font-medium">Credit/Debit Card</span>
                    </label>

                    {paymentMethod === 'card' && (
                      <div className="mt-4 ml-6 space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              placeholder="MM/YY"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              placeholder="123"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            id="nameOnCard"
                            placeholder="John Doe"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 font-medium">UPI</span>
                    </label>

                    {paymentMethod === 'upi' && (
                      <div className="mt-4 ml-6">
                        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          id="upiId"
                          placeholder="username@upi"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-700 font-medium"
                    onClick={() => setStep(1)}
                  >
                    Back to Shipping
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Continue to Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-6">Review Your Order</h2>

              {/* Shipping Information */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Shipping Information</h3>
                  <button
                    className="text-sm text-green-600 hover:text-green-700"
                    onClick={() => setStep(1)}
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">{shippingInfo.fullName}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                  <p>Phone: {shippingInfo.phoneNumber}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Payment Method</h3>
                  <button
                    className="text-sm text-green-600 hover:text-green-700"
                    onClick={() => setStep(2)}
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  {paymentMethod === 'cod' && <p>Cash on Delivery</p>}
                  {paymentMethod === 'card' && <p>Credit/Debit Card</p>}
                  {paymentMethod === 'upi' && <p>UPI</p>}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center py-2 border-b last:border-b-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.unit} x {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="text-green-600 hover:text-green-700 font-medium"
                  onClick={() => setStep(2)}
                >
                  Back to Payment
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-medium mb-6">Order Summary</h2>

            <div className="mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{cartDiscount.toFixed(2)}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
