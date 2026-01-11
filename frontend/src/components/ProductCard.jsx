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
      <div className={`card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col ${isApp ? 'p-3' : 'md:p-6'}`}>
        <div className={`relative overflow-hidden rounded-lg ${isApp ? 'mb-2' : 'mb-2 md:mb-4'}`}>
          <img
            src={
              product.imageData?.data 
                ? `data:${product.imageData.contentType};base64,${product.imageData.data}`
                : product.image?.startsWith('/uploads') 
                  ? `http://localhost:5001${product.image}` 
                  : (product.image || 'https://via.placeholder.com/400x250')
            }
            alt={product.name}
            className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${isApp ? 'h-24' : 'h-32 md:h-64'}`}
          />
          <div className={`absolute top-2 left-2 bg-primary-600 text-white rounded-lg font-semibold ${isApp ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs'}`}>
            {product.ottType}
          </div>
        </div>

        <h3 className={`font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition ${isApp ? 'text-sm mb-1' : 'text-sm mb-1 md:text-lg md:mb-2'}`}>
          {product.name}
        </h3>

        {!hideDetails && (
          <p className={`text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow ${isApp ? 'text-xs mb-2' : 'text-xs mb-2 md:text-sm md:mb-3'}`}>
            {product.description}
          </p>
        )}

        {!isApp && !hideProfileTypes && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.profileTypes?.map((profile, index) => (
              <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
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
            className={`bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center ${isApp ? 'w-9 h-9' : 'w-9 h-9 md:w-10 md:h-10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingCart className={isApp ? 'w-4 h-4' : 'w-4 h-4 md:w-5 md:h-5'} />
          </Link>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
