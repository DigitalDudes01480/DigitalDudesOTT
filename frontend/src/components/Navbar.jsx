import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { subscriptionAPI, orderAPI, ticketAPI } from '../utils/api';
import Logo from './Logo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();

  // Load read notifications from localStorage
  useEffect(() => {
    const read = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    setReadNotifications(read);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchNotifications();
      fetchUnreadTicketCount();
    }
  }, [isAuthenticated, user, readNotifications]);

  const fetchNotifications = async () => {
    try {
      const [subsRes, ordersRes] = await Promise.all([
        subscriptionAPI.getMySubscriptions(),
        orderAPI.getMyOrders()
      ]);

      const notifs = [];
      
      // Check for expiring subscriptions (3 days or less)
      subsRes.data.subscriptions.forEach(sub => {
        if (sub.status === 'active') {
          const daysRemaining = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          if (daysRemaining <= 3 && daysRemaining > 0) {
            notifs.push({
              id: `expiry-${sub._id}`,
              type: 'expiring',
              message: `Your ${sub.ottType} subscription is expiring in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}. Renew in time!`,
              date: sub.expiryDate
            });
          }
        }
      });

      // Check for delivered orders with credentials
      ordersRes.data.orders.forEach(order => {
        if (order.orderStatus === 'delivered' && order.deliveryDetails?.credentials) {
          const deliveredDate = new Date(order.deliveryDetails.deliveredAt);
          const hoursSinceDelivery = (new Date() - deliveredDate) / (1000 * 60 * 60);
          
          // Show notification for orders delivered in last 7 days
          if (hoursSinceDelivery < 168) {
            notifs.push({
              id: `delivered-${order._id}`,
              type: 'delivered',
              message: `You have received credentials for your purchase (Order #${order._id.substring(0, 8)})`,
              date: deliveredDate
            });
          }
        }
      });

      // Don't filter out read notifications - keep them all
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadTicketCount = async () => {
    try {
      const response = await ticketAPI.getUnreadCount();
      setUnreadTicketCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread ticket count:', error);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = getItemCount();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <img 
              src="/images/Untitled design-5.png" 
              alt="Digital Dudes Logo" 
              className="h-16 w-auto object-contain transition-all transform group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium">
              Home
            </Link>
            <Link to="/shop" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium">
              Shop
            </Link>
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium">
                  My Dashboard
                </Link>
                <Link to="/support" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium relative">
                  Support
                  {unreadTicketCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadTicketCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium">
                Admin Panel
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <>
                    <Link to="/cart" className="relative p-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all">
                      <ShoppingCart className="w-6 h-6" />
                      {cartItemCount > 0 && (
                        <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => {
                          const wasOpen = showNotifications;
                          setShowNotifications(!showNotifications);
                          if (!wasOpen && notifications.length > 0) {
                            // Mark all as read when opening notification dropdown
                            const allIds = notifications.map(n => n.id);
                            const updated = [...readNotifications, ...allIds];
                            setReadNotifications(updated);
                            localStorage.setItem('readNotifications', JSON.stringify(updated));
                          }
                        }}
                        className="relative p-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                      >
                        <Bell className="w-6 h-6" />
                        {notifications.filter(n => !readNotifications.includes(n.id)).length > 0 && (
                          <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                            {notifications.filter(n => !readNotifications.includes(n.id)).length}
                          </span>
                        )}
                      </button>
                      
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                          <div className="p-4 border-b dark:border-gray-700">
                            <h3 className="font-bold dark:text-white">Notifications</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No new notifications
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                    notif.type === 'expiring' ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-green-50 dark:bg-green-900/10'
                                  }`}
                                  onClick={() => {
                                    navigate('/dashboard');
                                  }}
                                >
                                  <p className="text-sm dark:text-white">{notif.message}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(notif.date).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user?.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                      <div className="p-2">
                        <Link
                          to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="text-sm font-medium dark:text-white">Dashboard</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:scale-95"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            <Link to="/" className="flex items-center py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl px-4 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/shop" className="flex items-center py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl px-4 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <>
                    <Link to="/dashboard" className="flex items-center py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl px-4 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
                      My Dashboard
                    </Link>
                    <Link to="/support" className="flex items-center justify-between py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl px-4 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
                      <span>Support</span>
                      {unreadTicketCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                          {unreadTicketCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/cart" className="flex items-center justify-between py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl px-4 transition-all active:scale-95" onClick={() => setMobileMenuOpen(false)}>
                      <span>Cart</span>
                      {cartItemCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 font-bold">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                    {notifications.length > 0 && (
                      <div className="py-3 px-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          {notifications.filter(n => !readNotifications.includes(n.id)).length} New Notifications
                        </p>
                        <Link to="/dashboard" className="text-sm text-primary-600 dark:text-primary-400 underline" onClick={() => setMobileMenuOpen(false)}>
                          View All
                        </Link>
                      </div>
                    )}
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3" onClick={() => setMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <div className="pt-3 border-t dark:border-gray-700">
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Signed in as <span className="font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
                  </div>
                  <button onClick={handleLogout} className="block w-full text-left py-3 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block py-3 bg-primary-600 text-white text-center rounded-lg font-medium hover:bg-primary-700" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
