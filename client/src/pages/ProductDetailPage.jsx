import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaMinus, FaPlus, FaShoppingCart, FaHeart, FaShare, FaRegHeart } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, isInWishlist, removeFromWishlist, wishlistItems, fetchWishlist } = useWishlist();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const productResponse = await apiService.products.getById(id);
        const productData = productResponse.data.product;

        // Calculate discount percentage
        const discount = productData.originalPrice > productData.price
          ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
          : 0;

        // Create images array from available images
        let images = [];

        if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
          images = productData.images.map(img => getImageUrl(img));
        } else if (productData.image) {
          images = [getImageUrl(productData.image)];
        }

        // If only one image is available, duplicate it for the gallery
        if (images.length === 1) {
          images.push(images[0]);
          images.push(images[0]);
        }

        console.log('Product images:', images);

        // Create specifications and nutritional info if not available
        const specifications = productData.specifications || [];
        const nutritionalInfo = productData.nutritionalInfo || [];

        // Create enhanced product object
        const enhancedProduct = {
          ...productData,
          images,
          discount,
          specifications,
          nutritionalInfo,
          rating: productData.rating || 4.5,
          reviews: productData.reviews || 0,
          stock: productData.stock || 0
        };

        setProduct(enhancedProduct);

        // Fetch related products from the same category
        const relatedResponse = await apiService.products.getAll({
          categoryId: productData.categoryId,
          limit: 3,
          exclude: id
        });

        const relatedProductsData = relatedResponse.data.products.map(product => ({
          ...product,
          discount: product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0
        }));

        setRelatedProducts(relatedProductsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
        toast.error('Failed to load product details. Please check your connection and try again.');
        setProduct(null);
        setRelatedProducts([]);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      console.log('ProductDetailPage - Adding to cart:', { product, quantity, isAuthenticated });

      // Make sure we have all the required product properties
      const productToAdd = {
        id: parseInt(product.id), // Ensure ID is a number
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : getPlaceholderImage(product.name),
        price: parseFloat(product.price), // Ensure price is a number
        originalPrice: parseFloat(product.originalPrice || product.price), // Ensure originalPrice is a number
        unit: product.unit || 'each'
      };

      console.log('ProductDetailPage - Formatted product:', productToAdd);
      await addToCart(productToAdd, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleWishlistAction = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      return;
    }

    try {
      // Check if product is already in wishlist
      const productId = parseInt(product.id);
      const productInWishlist = isInWishlist(productId);

      if (productInWishlist) {
        // Find the wishlist item with this product ID
        const wishlistItem = wishlistItems.find(item => {
          const itemProductId = typeof item.productId === 'number' ?
            item.productId : parseInt(item.productId, 10);
          return itemProductId === productId;
        });

        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          // Toast message will be shown by the removeFromWishlist function
        } else {
          console.error('Product is in wishlist but item not found');
          // Refresh wishlist to get the latest data
          await fetchWishlist();
        }
      } else {
        await addToWishlist(productId);
        // Toast message will be shown by the addToWishlist function
      }
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="md:flex gap-8">
            <div className="md:w-1/2 h-96 bg-gray-200 rounded-lg mb-6 md:mb-0"></div>
            <div className="md:w-1/2">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-green-600">Products</Link>
        <span className="mx-2">/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-green-600">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="md:flex gap-8 mb-12">
        {/* Product Images */}
        <div className="md:w-1/2 mb-6 md:mb-0">
          <div className="bg-white rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-contain"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = getPlaceholderImage(product.name);
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500">
                <img
                  src={getPlaceholderImage(product.name)}
                  alt={product.name}
                  className="w-full h-96 object-contain"
                />
              </div>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-green-500"
                >
                  <img
                    src={image}
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = getPlaceholderImage(product.name);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600 ml-2">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900 mr-2">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
              )}
              {product.discount > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">Price per {product.unit}</p>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.stock > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                className="px-3 py-1 text-gray-600 hover:text-green-600"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <FaMinus />
              </button>
              <span className="px-4 py-1 border-l border-r border-gray-300">
                {quantity}
              </span>
              <button
                className="px-3 py-1 text-gray-600 hover:text-green-600"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <FaShoppingCart />
              Add to Cart
            </button>
            <button
              className={`btn ${isInWishlist(parseInt(product.id)) ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'btn-secondary'} flex items-center justify-center gap-2`}
              onClick={handleWishlistAction}
            >
              {isInWishlist(parseInt(product.id)) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              {isInWishlist(parseInt(product.id)) ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
            <button className="btn btn-secondary flex items-center justify-center">
              <FaShare />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Delivery:</span> Usually delivered in 2-3 business days
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Return Policy:</span> 7 days easy return
            </p>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            <button className="px-6 py-3 border-b-2 border-green-600 text-green-600 font-medium">
              Details
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
              Specifications
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
              Nutritional Info
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700">
              Reviews ({product.reviews})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Product Details</h3>
          <p className="text-gray-700 mb-4">{product.description}</p>

          {product.specifications && product.specifications.length > 0 && (
            <>
              <h4 className="font-medium mb-2">Specifications</h4>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                {product.specifications.map((spec, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{spec.name}:</span> {spec.value}
                  </li>
                ))}
              </ul>
            </>
          )}

          {product.nutritionalInfo && product.nutritionalInfo.length > 0 && (
            <>
              <h4 className="font-medium mb-2">Nutritional Information</h4>
              <ul className="list-disc pl-5 space-y-1">
                {product.nutritionalInfo.map((info, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{info.name}:</span> {info.value}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
