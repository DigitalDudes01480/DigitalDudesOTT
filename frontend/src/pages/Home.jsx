import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, CreditCard, Headphones, ArrowRight, Users, Target, Award, Heart, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { faqAPI, productAPI, tutorialAPI, orderAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { isAndroidWebView } from '../utils/appMode';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [tutorials, setTutorials] = useState([]);
  const [openTutorialId, setOpenTutorialId] = useState(null);
  const [showSubscriptionLookup, setShowSubscriptionLookup] = useState(false);
  const [customerCode, setCustomerCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const isApp = isAndroidWebView();

  const getYouTubeEmbedUrl = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    try {
      const url = new URL(raw);
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      if (url.hostname.includes('youtube.com')) {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
    } catch {
      // not a full URL
    }

    // Treat as raw video id
    return `https://www.youtube.com/embed/${raw}`;
  };

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

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await faqAPI.getAll();
        setFaqs(res.data.faqs || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFaqs();
  }, []);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const res = await tutorialAPI.getAll();
        setTutorials(res.data.tutorials || []);
      } catch (error) {
        console.error('Error fetching tutorials:', error);
      }
    };

    fetchTutorials();
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Secure & Trusted',
      description: 'All transactions are encrypted and secure'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Delivery',
      description: 'Get your subscription details instantly'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Multiple Payment Options',
      description: 'PayPal, Credit/Debit cards accepted'
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'We are here to help you anytime'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative gradient-bg text-white py-6 sm:py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0yNCA0NGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
        
        {/* Winter Decorations */}
        {/* Snowman - Left Side */}
        <div className="absolute left-4 sm:left-10 bottom-10 sm:bottom-16 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="text-4xl sm:text-6xl md:text-7xl filter drop-shadow-lg">⛄</div>
        </div>
        
        {/* Snowman - Right Side */}
        <div className="absolute right-4 sm:right-10 bottom-10 sm:bottom-16 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
          <div className="text-4xl sm:text-6xl md:text-7xl filter drop-shadow-lg">☃️</div>
        </div>
        
        {/* Christmas Trees */}
        <div className="absolute left-20 sm:left-32 bottom-8 sm:bottom-12 animate-pulse" style={{ animationDuration: '4s' }}>
          <div className="text-3xl sm:text-5xl md:text-6xl filter drop-shadow-lg">🎄</div>
        </div>
        <div className="absolute right-20 sm:right-32 bottom-8 sm:bottom-12 animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
          <div className="text-3xl sm:text-5xl md:text-6xl filter drop-shadow-lg">🎄</div>
        </div>
        
        {/* Floating Snowflakes */}
        <div className="absolute top-10 left-1/4 animate-bounce" style={{ animationDuration: '2s' }}>
          <div className="text-2xl sm:text-4xl filter drop-shadow-lg opacity-80">❄️</div>
        </div>
        <div className="absolute top-20 right-1/4 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>
          <div className="text-2xl sm:text-4xl filter drop-shadow-lg opacity-80">❄️</div>
        </div>
        <div className="absolute top-16 left-1/3 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.7s' }}>
          <div className="text-xl sm:text-3xl filter drop-shadow-lg opacity-70">❄️</div>
        </div>
        <div className="absolute top-24 right-1/3 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
          <div className="text-xl sm:text-3xl filter drop-shadow-lg opacity-70">❄️</div>
        </div>
        
        {/* Gift Boxes */}
        <div className="hidden md:block absolute left-40 bottom-6 animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="text-3xl filter drop-shadow-lg">🎁</div>
        </div>
        <div className="hidden md:block absolute right-40 bottom-6 animate-pulse" style={{ animationDuration: '3.2s', animationDelay: '0.5s' }}>
          <div className="text-3xl filter drop-shadow-lg">🎁</div>
        </div>
        
        {/* Stars */}
        <div className="absolute top-8 left-1/2 animate-pulse" style={{ animationDuration: '2s' }}>
          <div className="text-2xl sm:text-3xl filter drop-shadow-lg">⭐</div>
        </div>
        <div className="hidden sm:block absolute top-12 left-20 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <div className="text-xl filter drop-shadow-lg">✨</div>
        </div>
        <div className="hidden sm:block absolute top-12 right-20 animate-pulse" style={{ animationDuration: '2.3s', animationDelay: '0.8s' }}>
          <div className="text-xl filter drop-shadow-lg">✨</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold animate-fade-in">
              🎉 Premium Subscriptions at 50% Off
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold mb-3 sm:mb-4 animate-fade-in leading-tight px-2">
              Premium OTT Subscriptions
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 text-transparent bg-clip-text">At Unbeatable Prices</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-5 sm:mb-6 text-white/90 max-w-3xl mx-auto animate-slide-in-right px-4">
              Netflix, Prime Video, Disney+, Spotify & More - All in One Place
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-in-left px-4 max-w-4xl mx-auto">
              <Link to="/shop" className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-2.5 sm:py-3 px-5 sm:px-8 rounded-xl transition-all transform active:scale-95 hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center group text-sm">
                Browse Subscriptions
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionLookup(true);
                  setLookupError('');
                  setLookupResult(null);
                }}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold py-2.5 sm:py-3 px-5 sm:px-8 rounded-xl transition-all transform active:scale-95 hover:scale-105 inline-flex items-center justify-center group text-sm"
              >
                Search Your Subscription
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </section>

      <div className="flex flex-col">
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              {!isApp && (
                <div className="inline-block mb-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold">
                  🔥 Hot Deals
                </div>
              )}
              {!isApp && (
                <>
                  <h2 className="text-xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
                    Featured Subscriptions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto">
                    Discover our handpicked selection of premium streaming services at incredible prices
                  </p>
                </>
              )}
            </div>

            {loading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} hideProfileTypes hideDetails />
                ))}
              </div>
            )}

            <div className="text-center mt-10 sm:mt-12">
              <Link to="/shop" className="btn-primary inline-flex items-center px-5 py-2.5 text-sm">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-block mb-3 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold">
                ⚡ Features
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
                Why You’ll Love Digital Dudes
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need for a smooth subscription experience
              </p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-4 gap-2 sm:gap-6 md:gap-8 animate-fade-in">
              {features.map((feature, index) => (
                <div key={index} className="card-hover text-center transform transition-all duration-300 hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 dark:from-primary-900/30 dark:via-primary-800/30 dark:to-primary-700/30 rounded-2xl text-primary-600 dark:text-primary-400 mb-2 sm:mb-4 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-[10px] sm:text-base lg:text-lg font-bold mb-0.5 sm:mb-2 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0yNCA0NGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold">
              💫 About Us
            </div>
            <h2 className="text-xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 text-transparent bg-clip-text">
              Your Trusted OTT Subscription Partner
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make premium entertainment accessible to everyone. With years of experience and thousands of satisfied customers, we deliver the best streaming subscriptions at unbeatable prices.
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8 mb-12 sm:mb-16">
            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 animate-slide-in-left">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-2 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-2xl font-bold mb-1 sm:mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">10,000+</h3>
              <p className="text-[10px] sm:text-base text-gray-600 dark:text-gray-400 leading-tight">Happy Customers Worldwide</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 animate-slide-in-left" style={{animationDelay: '100ms'}}>
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white mb-2 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-2xl font-bold mb-1 sm:mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">99.9%</h3>
              <p className="text-[10px] sm:text-base text-gray-600 dark:text-gray-400 leading-tight">Customer Satisfaction Rate</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 animate-slide-in-left" style={{animationDelay: '200ms'}}>
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white mb-2 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-2xl font-bold mb-1 sm:mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">5+ Years</h3>
              <p className="text-[10px] sm:text-base text-gray-600 dark:text-gray-400 leading-tight">Industry Experience</p>
            </div>

            <div className="group bg-white dark:bg-gray-800 p-3 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700 animate-slide-in-left" style={{animationDelay: '300ms'}}>
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl text-white mb-2 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-2xl font-bold mb-1 sm:mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">24/7</h3>
              <p className="text-[10px] sm:text-base text-gray-600 dark:text-gray-400 leading-tight">Dedicated Support Team</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in">
            <h3 className="text-lg sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-6">
              Why Choose Digital Dudes?
            </h3>
            <p className="text-sm sm:text-lg md:text-xl text-white/90 mb-5 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              We believe everyone deserves access to premium entertainment. That's why we offer authentic subscriptions at prices that won't break the bank, backed by our commitment to excellent service and instant delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/shop" className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3.5 sm:py-4 px-6 sm:px-10 rounded-xl transition-all transform active:scale-95 hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center group text-sm sm:text-base">
                Start Shopping Now
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold py-3.5 sm:py-4 px-6 sm:px-10 rounded-xl transition-all transform active:scale-95 hover:scale-105 inline-flex items-center justify-center text-sm sm:text-base">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-block mb-3 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold">
              ❓ FAQ
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Quick answers to common questions
            </p>
          </div>

          {faqs.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              No FAQs available.
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq._id;
                return (
                  <div key={faq._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      onClick={() => setOpenFaqId(isOpen ? null : faq._id)}
                    >
                      <span className="font-semibold text-sm sm:text-base dark:text-white">
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-block mb-3 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs sm:text-sm font-semibold">
              ▶ Tutorials
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
              Video Tutorials
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Watch step-by-step guides inside our website
            </p>
          </div>

          {tutorials.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              No tutorials available.
            </div>
          ) : (
            <div className="space-y-3">
              {tutorials.map((tutorial) => {
                const isOpen = openTutorialId === tutorial._id;
                const embedUrl = getYouTubeEmbedUrl(tutorial.youtubeUrl);

                return (
                  <div key={tutorial._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      onClick={() => setOpenTutorialId(isOpen ? null : tutorial._id)}
                    >
                      <span className="font-semibold text-sm sm:text-base dark:text-white">
                        {tutorial.title}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4">
                        {embedUrl && (
                          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mb-3">
                            <iframe
                              className="w-full h-full"
                              src={embedUrl}
                              title={tutorial.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {tutorial.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {tutorial.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {showSubscriptionLookup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white">Search Your Subscription</h3>
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionLookup(false);
                  setLookupError('');
                  setLookupResult(null);
                  setCustomerCode('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <span className="sr-only">Close</span>
                <ChevronDown className="w-5 h-5 rotate-180 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <form
              className="p-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const code = customerCode.trim();
                if (!code) {
                  setLookupError('Please enter your customer code');
                  return;
                }
                setLookupLoading(true);
                setLookupError('');
                setLookupResult(null);
                try {
                  const res = await orderAPI.lookupByCustomerCode(code);
                  setLookupResult(res.data);
                } catch (err) {
                  setLookupError(err.response?.data?.message || 'Failed to lookup subscription');
                } finally {
                  setLookupLoading(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Customer Code</label>
                <input
                  type="text"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                  className="input-field"
                  placeholder="e.g., DD-XXXXXXXXXXXX..."
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={lookupLoading}
              >
                {lookupLoading ? 'Searching...' : 'Search'}
              </button>

              {lookupError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-sm">
                  {lookupError}
                </div>
              )}

              {lookupResult?.order && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order Status</p>
                      <p className="font-semibold dark:text-white">{lookupResult.order.orderStatus}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer Code</p>
                      <p className="font-mono text-sm dark:text-white">{lookupResult.order.customerCode}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                      <p className="text-sm dark:text-white">{lookupResult.order.createdAt ? new Date(lookupResult.order.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>

                  {lookupResult.order.deliveryDetails && (
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold mb-3 dark:text-white">Delivery Details</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Delivered At</p>
                          <p className="text-sm dark:text-white">
                            {lookupResult.order.deliveryDetails.deliveredAt
                              ? new Date(lookupResult.order.deliveryDetails.deliveredAt).toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
                          <p className="text-sm dark:text-white">
                            {lookupResult.subscriptions && lookupResult.subscriptions.length > 0 && lookupResult.subscriptions[0].expiryDate
                              ? new Date(lookupResult.subscriptions[0].expiryDate).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="text-sm font-mono dark:text-white">
                            {lookupResult.order.deliveryDetails.credentials?.email || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Password</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono dark:text-white">
                              {lookupResult.order.deliveryDetails.credentials?.password 
                                ? (showPassword ? lookupResult.order.deliveryDetails.credentials.password : '********')
                                : 'N/A'}
                            </p>
                            {lookupResult.order.deliveryDetails.credentials?.password && (
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Profile</p>
                          <p className="text-sm font-mono dark:text-white">
                            {lookupResult.order.deliveryDetails.credentials?.profile || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Profile PIN</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono dark:text-white">
                              {lookupResult.order.deliveryDetails.credentials?.profilePin 
                                ? (showPin ? lookupResult.order.deliveryDetails.credentials.profilePin : '****')
                                : 'N/A'}
                            </p>
                            {lookupResult.order.deliveryDetails.credentials?.profilePin && (
                              <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Instructions</p>
                          <p className="text-sm dark:text-white whitespace-pre-wrap">
                            {lookupResult.order.deliveryDetails.instructions || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold mb-3 dark:text-white">Subscriptions</p>
                    {(lookupResult.subscriptions || []).length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No subscriptions found yet. Please wait for delivery.</p>
                    ) : (
                      <div className="space-y-2">
                        {lookupResult.subscriptions.map((sub) => (
                          <div key={sub._id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className="font-semibold text-sm dark:text-white">{sub.product?.name || sub.ottType || 'Subscription'}</p>
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                {sub.status || 'unknown'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Start Date:</span> {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Expiry Date:</span> {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
