import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { isAndroidWebView } from '../utils/appMode';

const ProductCard = ({ product, hideProfileTypes = false, hideDetails = false }) => {
  const isApp = isAndroidWebView();
  
  const getMinPrice = () => {
    if (!product.profileTypes || product.profileTypes.length === 0) return 0;
    let minPrice = Infinity;
    product.profileTypes.forEach(profile => {
      profile.pricingOptions?.forEach(option => {
        if (option.price < minPrice) minPrice = option.price;
      });
    });
    return minPrice === Infinity ? 0 : minPrice;
  };

  const minPrice = getMinPrice();

  return (
    <Link to={`/product/${product._id}`} className="group h-full">
      <div className={`card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.03] h-full flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 ${isApp ? 'p-3' : 'md:p-5 lg:p-6'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:via-transparent group-hover:to-secondary-500/10 transition-all duration-500 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col h-full">
        <div className={`relative overflow-hidden rounded-lg ${isApp ? 'mb-2' : 'mb-3 md:mb-4 lg:mb-6'} shadow-md group-hover:shadow-xl transition-all duration-500`}>
          <img
            src={
              product.imageData?.data 
                ? `data:${product.imageData.contentType};base64,${product.imageData.data}`
                : product.image?.startsWith('/uploads') 
                  ? `http://localhost:5001${product.image}` 
                  : (product.image || 'https://via.placeholder.com/400x250')
            }
            alt={product.name}
            className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${isApp ? 'h-24' : 'h-32 md:h-48 lg:h-56'}`}
          />
          {!isApp && (
            <div className={`absolute top-3 left-3 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-full font-bold shadow-xl backdrop-blur-md z-20 border border-white/20 px-3 py-1.5 text-xs md:block lg:px-4 lg:py-2 lg:text-sm hidden`}>
              {product.ottType}
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-primary-600 dark:text-primary-400 rounded-full font-semibold px-4 py-1.5 text-xs opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 z-20 shadow-lg border border-primary-200 dark:border-primary-800">
            View Details
          </div>
        </div>

        <h3 className={`font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 line-clamp-1 ${isApp ? 'text-sm mb-1' : 'text-base mb-2 md:text-xl md:mb-3 lg:text-xl lg:mb-4'}`}>
          {product.name}
        </h3>

        {!hideDetails && (
          <p className={`text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow ${isApp ? 'text-xs mb-2' : 'text-xs mb-2 md:text-sm md:mb-3 lg:text-base lg:mb-4'}`}>
            {product.description}
          </p>
        )}

        {!isApp && !hideProfileTypes && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.profileTypes?.map((profile, index) => (
              <span 
                key={index} 
                className={`text-xs px-2 py-1 rounded ${
                  profile.accountType === 'shared' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                    : profile.accountType === 'private'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {profile.name}
                {profile.accountType === 'shared' && (
                  <span className="ml-1 text-blue-600 dark:text-blue-400">🔗</span>
                )}
                {profile.accountType === 'private' && (
                  <span className="ml-1 text-purple-600 dark:text-purple-400">🔐</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div>
            {hideDetails ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starting from</span>
                <span className={`font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent ${isApp ? 'text-xl' : 'text-xl md:text-3xl lg:text-4xl'}`}>
                  {formatCurrency(minPrice)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className={`font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent ${isApp ? 'text-xl' : 'text-xl md:text-3xl lg:text-4xl'}`}>
                  {formatCurrency(minPrice)}
                </span>
                <span className={`text-xs text-gray-500 dark:text-gray-400 ${isApp ? '' : 'lg:inline'}`}>starting from</span>
              </div>
            )}
            {!isApp && !hideProfileTypes && !hideDetails && (
              <p className="text-xs text-gray-500 mt-1">
                {product.profileTypes?.length || 0} profile type(s)
              </p>
            )}
          </div>

          <Link
            to={`/product/${product._id}`}
            className={`bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white rounded-full transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-125 hover:rotate-12 active:scale-95 group-hover:ring-4 ring-primary-200 dark:ring-primary-800 ${isApp ? 'w-10 h-10' : 'w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingCart className={`${isApp ? 'w-4 h-4' : 'w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6'} group-hover:animate-pulse`} />
          </Link>
        </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
