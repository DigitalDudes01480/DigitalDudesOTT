import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, CreditCard, Headphones, ArrowRight, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getAll({ status: 'active' });
        setFeaturedProducts(response.data.products.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Secure & Trusted',
      description: 'All transactions are encrypted and secure'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Delivery',
      description: 'Get your subscription details instantly'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Multiple Payment Options',
      description: 'PayPal, Credit/Debit cards accepted'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'We are here to help you anytime'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0yNCA0NGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold animate-fade-in">
              🎉 Premium Subscriptions at 50% Off
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in leading-tight">
              Premium OTT Subscriptions
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 text-transparent bg-clip-text">At Unbeatable Prices</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto animate-slide-in-right">
              Netflix, Prime Video, Disney+, Spotify & More - All in One Place
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-left">
              <Link to="/shop" className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center group">
                Browse Subscriptions
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/download" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center group">
                <Download className="mr-2 w-5 h-5" />
                Download App
              </Link>
              <Link to="/support" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 inline-flex items-center justify-center">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold">
              🔥 Hot Deals
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
              Featured Subscriptions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our handpicked selection of premium streaming services at incredible prices
            </p>
            <div className="mt-4 inline-block">
              <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="btn-primary inline-flex items-center">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of happy customers enjoying premium subscriptions at amazing prices
          </p>
          <Link to="/shop" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 inline-flex items-center">
            Start Shopping Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
