import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { wishlistItems, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    // Refresh wishlist when component mounts
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (id) => {
    try {
      await removeFromWishlist(id);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Error handling is done in the removeFromWishlist function
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Format product for cart
      const productToAdd = {
        id: typeof product.productId === 'number' ? product.productId : parseInt(product.productId, 10),
        name: product.name,
        image: product.image ? getImageUrl(product.image) : getPlaceholderImage(product.name),
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price),
        originalPrice: typeof product.originalPrice === 'number' ?
          product.originalPrice : parseFloat(product.originalPrice || product.price),
        unit: product.unit || 'each'
      };

      await addToCart(productToAdd, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My Wishlist</h1>
        <Link to="/products" className="flex items-center text-green-600 hover:text-green-700 transition-colors">
          <FaArrowLeft className="mr-2" />
          Continue Shopping
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Add items to your wishlist to keep track of products you're interested in.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image ? getImageUrl(item.image) : getPlaceholderImage(item.name)}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getPlaceholderImage(item.name);
                    }}
                  />
                </Link>
                {item.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {item.discount}% OFF
                  </div>
                )}
              </div>

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

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
