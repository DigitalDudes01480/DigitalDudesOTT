import { useEffect, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { productAPI, categoryAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    ottType: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [ottTypes, setOttTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOTTTypes();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchOTTTypes = async () => {
    try {
      const response = await productAPI.getOTTTypes();
      setOttTypes(response.data.ottTypes);
    } catch (error) {
      console.error('Error fetching OTT types:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ isActive: 'true' });
      // Sort categories by displayOrder, then by name
      const sortedCategories = response.data.categories.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return a.name.localeCompare(b.name);
      });
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        status: 'active',
        ...filters
      };
      const response = await productAPI.getAll(params);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      ottType: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    });
    setSearchTerm('');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.ottType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group products by category (categories are already sorted by displayOrder)
  const productsByCategory = categories.reduce((acc, category) => {
    const categoryProducts = filteredProducts.filter(p => 
      p.category?._id === category._id
    );
    if (categoryProducts.length > 0) {
      acc.push({ 
        category, 
        products: categoryProducts,
        displayOrder: category.displayOrder 
      });
    }
    return acc;
  }, []);

  // Products without category
  const uncategorizedProducts = filteredProducts.filter(p => !p.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-8 text-center sm:text-left">
          <div className="inline-block mb-3 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold animate-fade-in">
            🎬 Premium Streaming Services
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 text-transparent bg-clip-text animate-slide-up">
            Browse OTT Subscriptions
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto sm:mx-0">
            Find the perfect subscription plan for your entertainment needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          <div className="lg:col-span-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 mb-3 flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div className={`card p-4 sm:p-6 sticky top-20 border-2 border-primary-100 dark:border-primary-900/30 ${showFilters ? 'block animate-slide-down' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold dark:text-white flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-lg">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 dark:text-gray-300">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 dark:text-gray-300">
                    OTT Platform
                  </label>
                  <select
                    value={filters.ottType}
                    onChange={(e) => handleFilterChange('ottType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Platforms</option>
                    {ottTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 dark:text-gray-300">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 dark:text-gray-300">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="input-field"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No products found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                {/* Display products grouped by category (ordered by displayOrder) */}
                {productsByCategory.map(({ category, products: categoryProducts }) => (
                  <div key={category._id} className="mb-10">
                    <div className="flex items-center mb-4 pb-3 border-b-2 border-primary-500 dark:border-primary-400">
                      {category.icon && <span className="text-3xl mr-3">{category.icon}</span>}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold dark:text-white">{category.name}</h2>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {categoryProducts.map((product) => (
                        <ProductCard key={product._id} product={product} hideDetails />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Display uncategorized products */}
                {uncategorizedProducts.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center mb-4 pb-3 border-b-2 border-gray-300 dark:border-gray-600">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold dark:text-white">Other Products</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Products without a category</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {uncategorizedProducts.length} {uncategorizedProducts.length === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {uncategorizedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} hideDetails />
                      ))}
                    </div>
                  </div>
                )}

                {/* Show all products if no categories or all filtered out */}
                {productsByCategory.length === 0 && uncategorizedProducts.length === 0 && filteredProducts.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} hideDetails />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
