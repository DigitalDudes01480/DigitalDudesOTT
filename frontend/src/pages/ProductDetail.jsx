import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Clock, Monitor } from 'lucide-react';
import { productAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import useCartStore from '../store/useCartStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const [selectedPricingIndex, setSelectedPricingIndex] = useState(0);
  const [customerEmail, setCustomerEmail] = useState('');
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProfile = () => {
    return product?.profileTypes?.[selectedProfileIndex];
  };

  const getSelectedPricing = () => {
    const profile = getSelectedProfile();
    return profile?.pricingOptions?.[selectedPricingIndex];
  };

  const handleAddToCart = () => {
    const profile = getSelectedProfile();
    const pricing = getSelectedPricing();
    
    if (!profile || !pricing) {
      toast.error('Please select a profile type and duration');
      return;
    }

    if (profile.requiresOwnAccount && !customerEmail) {
      toast.error('Please provide your email address for account activation');
      return;
    }

    if (profile.requiresOwnAccount && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error('Please provide a valid email address');
      return;
    }

    const cartItem = {
      ...product,
      selectedProfile: {
        profileId: profile._id,
        name: profile.name,
        screenCount: profile.screenCount,
        quality: profile.quality,
        requiresOwnAccount: profile.requiresOwnAccount
      },
      selectedPricing: {
        duration: pricing.duration,
        price: pricing.price
      },
      price: pricing.price,
      duration: pricing.duration,
      customerEmail: profile.requiresOwnAccount ? customerEmail : undefined
    };

    addToCart(cartItem);
    toast.success('Added to cart!');
    if (profile.requiresOwnAccount) {
      setCustomerEmail('');
    }
  };

  const handleBuyNow = () => {
    const profile = getSelectedProfile();
    const pricing = getSelectedPricing();
    
    if (!profile || !pricing) {
      toast.error('Please select a profile type and duration');
      return;
    }

    if (profile.requiresOwnAccount && !customerEmail) {
      toast.error('Please provide your email address for account activation');
      return;
    }

    if (profile.requiresOwnAccount && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error('Please provide a valid email address');
      return;
    }

    const cartItem = {
      ...product,
      selectedProfile: {
        profileId: profile._id,
        name: profile.name,
        screenCount: profile.screenCount,
        quality: profile.quality,
        requiresOwnAccount: profile.requiresOwnAccount
      },
      selectedPricing: {
        duration: pricing.duration,
        price: pricing.price
      },
      price: pricing.price,
      duration: pricing.duration,
      customerEmail: profile.requiresOwnAccount ? customerEmail : undefined
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const selectedProfile = getSelectedProfile();
  const selectedPricing = getSelectedPricing();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:hidden">
            <div className="card flex gap-3 p-3 sm:p-5 items-start">
              <div className="relative shrink-0">
                <img
                  src={
                    product.imageData?.data 
                      ? `data:${product.imageData.contentType};base64,${product.imageData.data}`
                      : product.image?.startsWith('/uploads') 
                        ? `http://localhost:5001${product.image}` 
                        : (product.image || 'https://via.placeholder.com/600x400')
                  }
                  alt={product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold dark:text-white leading-snug">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm ${
                    product.status === 'active'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {product.status === 'active' ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={
                  product.imageData?.data 
                    ? `data:${product.imageData.contentType};base64,${product.imageData.data}`
                    : product.image?.startsWith('/uploads') 
                      ? `http://localhost:5001${product.image}` 
                      : (product.image || 'https://via.placeholder.com/600x400')
                }
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              <div className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold">
                {product.ottType}
              </div>
            </div>
          </div>

          <div>
            <div className="hidden lg:block">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                {product.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="card hover:shadow-2xl transition-all duration-300 mb-6">
              <h3 className="text-sm sm:text-lg font-semibold mb-3 dark:text-white">Select Profile Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                {product.profileTypes?.map((profile, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedProfileIndex(index);
                      setSelectedPricingIndex(0);
                    }}
                    className={`p-2.5 sm:p-4 rounded-lg border-2 transition-all active:scale-95 ${
                      selectedProfileIndex === index
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold dark:text-white text-xs sm:text-base leading-tight">{profile.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
                        <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{profile.screenCount} Screen{profile.screenCount > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{profile.quality}</span>
                      </div>
                      {profile.description && (
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{profile.description}</p>
                      )}
                      {profile.requiresOwnAccount && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-primary-600 dark:text-primary-400">
                          <Check className="w-3 h-3" />
                          <span className="font-medium">Own Account - Email Required</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedProfile && (
              <div className="mb-6">
                <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4 dark:text-white flex items-center">
                  <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
                  Select Duration
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                  {selectedProfile.pricingOptions?.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedPricingIndex(index)}
                      className={`p-3 sm:p-5 rounded-xl border-2 transition-all duration-300 text-left transform ${
                        selectedPricingIndex === index
                          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-bold text-xs sm:text-sm dark:text-white">
                          {option.duration.value} {option.duration.unit}
                        </p>
                        <p className="text-[10px] sm:text-xs text-primary-600 font-semibold mt-1">
                          {formatCurrency(option.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedProfile?.requiresOwnAccount && (
              <div className="mb-6 p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <label className="block text-xs sm:text-sm font-medium mb-2 dark:text-white">
                  Your Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field w-full text-sm"
                  required
                />
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2">
                  We'll activate the service on this email address
                </p>
              </div>
            )}

            {selectedPricing && (
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Price</p>
                    <span className="text-lg sm:text-4xl font-bold text-primary-600">
                      {formatCurrency(selectedPricing.price)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="text-xs sm:text-lg font-bold dark:text-white">
                      {selectedPricing.duration.value} {selectedPricing.duration.unit}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="hidden lg:block card hover:shadow-2xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 px-4 py-2 rounded-xl shadow-md">
                  {product.ottType}
                </span>
                <span className={`text-sm font-bold px-4 py-2 rounded-xl shadow-md ${
                  product.status === 'active' 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-400' 
                    : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-400'
                }`}>
                  {product.status === 'active' ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Features</h2>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full btn-outline flex items-center justify-center text-sm sm:text-lg py-3 sm:py-4"
              >
                <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full btn-primary flex items-center justify-center text-sm sm:text-lg py-3 sm:py-4"
              >
                <Check className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                Buy Now
              </button>
            </div>

            <div className="mt-8 p-3 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-1 sm:mb-2 text-sm sm:text-base">
                Instant Delivery Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-400">
                Your subscription details will be delivered to your email within minutes of purchase confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
