import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { id, name, price, originalPrice, unit, discount, image } = product;
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('ProductCard - Adding to cart:', product);
      // Make sure we have all the required product properties
      const productToAdd = {
        id: parseInt(product.id), // Ensure ID is a number
        name: product.name,
        image: product.image ? getImageUrl(product.image) : getPlaceholderImage(product.name),
        price: parseFloat(product.price), // Ensure price is a number
        originalPrice: parseFloat(product.originalPrice || product.price), // Ensure originalPrice is a number
        unit: product.unit || 'each'
      };
      console.log('ProductCard - Formatted product:', productToAdd);
      addToCart(productToAdd, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  return (
    <div className="card group">
      {/* Product Image */}
      <Link to={`/products/${id}`} className="block overflow-hidden">
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = getPlaceholderImage(name);
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            <img
              src={getPlaceholderImage(name)}
              alt={name}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </Link>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </div>
      )}

      {/* Product Details */}
      <div className="p-4">
        <Link to={`/products/${id}`} className="block">
          <h3 className="text-lg font-medium text-gray-800 hover:text-green-600 mb-1 truncate">
            {name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 mb-2">{unit}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{price}</span>
            {originalPrice > price && (
              <span className="text-sm text-gray-500 line-through ml-2">₹{originalPrice}</span>
            )}
          </div>

          <button
            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-colors"
            aria-label="Add to cart"
            onClick={handleAddToCart}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
