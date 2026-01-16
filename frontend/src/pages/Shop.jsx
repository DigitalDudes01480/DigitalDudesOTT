import { useEffect, useState } from 'react';
import { Filter, Search, X, TrendingUp, Sparkles, Grid3x3, LayoutGrid } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'compact'

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-10 text-center sm:text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-5 py-2.5 bg-gradient-to-r from-primary-100 via-secondary-100 to-primary-100 dark:from-primary-900/40 dark:via-secondary-900/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-fade-in backdrop-blur-sm border border-primary-200 dark:border-primary-800">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Premium Streaming Services
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 text-transparent bg-clip-text animate-slide-up drop-shadow-sm">
              Browse OTT Subscriptions
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto sm:mx-0 font-medium">
              Discover premium entertainment at unbeatable prices 🎯
            </p>
          </div>
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
            <div className={`card p-5 sm:p-7 sticky top-20 border border-primary-200/60 dark:border-primary-800/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl ${showFilters ? 'block animate-slide-down' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-2xl font-black dark:text-white flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg transform hover:scale-110 transition-transform">
                    <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div className="group">
                  <label className="block text-sm sm:text-base font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field font-semibold hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="">🌟 All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm sm:text-base font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></span>
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-11 font-medium hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm sm:text-base font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    OTT Platform
                  </label>
                  <select
                    value={filters.ottType}
                    onChange={(e) => handleFilterChange('ottType', e.target.value)}
                    className="input-field font-semibold hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="">🎬 All Platforms</option>
                    {ottTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm sm:text-base font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field font-semibold hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field font-semibold hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm sm:text-base font-bold mb-3 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="input-field font-semibold hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="newest">🆕 Newest First</option>
                    <option value="price_asc">💰 Price: Low to High</option>
                    <option value="price_desc">💎 Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Results Header with View Toggle */}
            {!loading && filteredProducts.length > 0 && (
              <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Premium quality subscriptions</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-inner">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Compact View"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full mb-6 shadow-lg">
                  <Search className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Products Found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Display products grouped by category (ordered by displayOrder) */}
                {productsByCategory.map(({ category, products: categoryProducts }, index) => (
                  <div key={category._id} className="mb-12 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center mb-6 pb-4 border-b-2 border-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {category.icon && <span className="text-4xl sm:text-5xl mr-4 transform group-hover:scale-110 transition-transform">{category.icon}</span>}
                      <div className="flex-1 relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-black dark:text-white bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">{category.name}</h2>
                        {category.description && (
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 font-medium">{category.description}</p>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2 rounded-full shadow-lg">
                        {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className={`grid gap-4 sm:gap-6 ${viewMode === 'compact' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'}`}>
                      {categoryProducts.map((product, idx) => (
                        <div key={product._id} className="animate-scale-in" style={{ animationDelay: `${idx * 50}ms` }}>
                          <ProductCard product={product} hideDetails />
                        </div>
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                      {uncategorizedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} hideDetails />
                      ))}
                    </div>
                  </div>
                )}

                {/* Show all products if no categories or all filtered out */}
                {productsByCategory.length === 0 && uncategorizedProducts.length === 0 && filteredProducts.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
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
