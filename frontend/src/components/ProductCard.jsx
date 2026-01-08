import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const ProductCard = ({ product }) => {
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
    <Link to={`/product/${product._id}`} className="group">
      <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={product.image?.startsWith('/uploads') ? `http://localhost:5001${product.image}` : (product.image || 'https://via.placeholder.com/400x250')}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
            {product.ottType}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {product.profileTypes?.map((profile, index) => (
            <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              {profile.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(minPrice)}
              </span>
              <span className="text-xs text-gray-500">starting from</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {product.profileTypes?.length || 0} profile type(s)
            </p>
          </div>

          <Link
            to={`/product/${product._id}`}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ShoppingCart className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
