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
      <div className={`card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col relative overflow-hidden ${isApp ? 'p-3' : 'p-4 md:p-5 lg:p-6'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:via-transparent group-hover:to-secondary-500/5 transition-all duration-500 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col h-full">
        <div className={`relative overflow-hidden rounded-xl ${isApp ? 'mb-2' : 'mb-3 md:mb-4'} shadow-lg group-hover:shadow-2xl transition-shadow duration-500`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
          <img
            src={
              product.imageData?.data 
                ? `data:${product.imageData.contentType};base64,${product.imageData.data}`
                : product.image?.startsWith('/uploads') 
                  ? `http://localhost:5001${product.image}` 
                  : (product.image || 'https://via.placeholder.com/400x250')
            }
            alt={product.name}
            className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${isApp ? 'h-24' : 'h-40 md:h-48 lg:h-56'}`}
          />
          <div className={`absolute top-2 left-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold shadow-lg backdrop-blur-sm z-20 ${isApp ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs'}`}>
            {product.ottType}
          </div>
          <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-primary-600 dark:text-primary-400 rounded-lg font-bold px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
            View Details
          </div>
        </div>

        <h3 className={`font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 ${isApp ? 'text-sm mb-1' : 'text-base mb-2 md:text-lg md:mb-3 lg:text-xl'}`}>
          {product.name}
        </h3>

        {!hideDetails && (
          <p className={`text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow ${isApp ? 'text-xs mb-2' : 'text-xs mb-3 md:text-sm md:mb-4'}`}>
            {product.description}
          </p>
        )}

        {!isApp && !hideProfileTypes && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.profileTypes?.map((profile, index) => (
              <span key={index} className="text-xs bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full font-medium">
                {profile.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div>
            {hideDetails ? (
              <div className="text-xs text-gray-500">
                Starting from{' '}
                <span className={`font-bold text-primary-600 ${isApp ? 'text-lg' : 'text-base md:text-2xl'}`}>
                  {formatCurrency(minPrice)}
                </span>
              </div>
            ) : (
              <div className={`flex items-baseline ${isApp ? 'space-x-1' : 'space-x-1 md:space-x-2'}`}>
                <span className={`font-bold text-primary-600 ${isApp ? 'text-lg' : 'text-base md:text-2xl'}`}>
                  {formatCurrency(minPrice)}
                </span>
                <span className={`text-xs text-gray-500 ${isApp ? '' : 'hidden md:inline'}`}>starting from</span>
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
            className={`bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 ${isApp ? 'w-9 h-9' : 'w-9 h-9 md:w-10 md:h-10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingCart className={isApp ? 'w-4 h-4' : 'w-4 h-4 md:w-5 md:h-5'} />
          </Link>
        </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
