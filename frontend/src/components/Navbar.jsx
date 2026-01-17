import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Bell, Headphones, Menu, X, Star, Shield, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { subscriptionAPI, orderAPI, ticketAPI } from '../utils/api';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import './NavbarAnimations.css';

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [unreadTicketCount, setUnreadTicketCount] = useState(0);
  const [adminPendingOrders, setAdminPendingOrders] = useState(0);
  const [adminOpenTickets, setAdminOpenTickets] = useState(0);
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
    if (isAuthenticated && user?.role === 'admin') {
      fetchAdminNotifications();
    }
  }, [isAuthenticated, user, readNotifications]);

  const fetchAdminNotifications = async () => {
    try {
      const [ordersRes, ticketsRes] = await Promise.all([
        orderAPI.getAll({ status: 'pending' }),
        ticketAPI.getAll({ status: 'open' })
      ]);

      setAdminPendingOrders(ordersRes?.data?.orders?.length || 0);
      setAdminOpenTickets(ticketsRes?.data?.tickets?.length || 0);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  };

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
  const adminNotificationCount = adminPendingOrders + adminOpenTickets;

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/images/logo.png" 
                alt="Digital Dudes Logo" 
                className="h-16 w-auto object-contain transition-all duration-300 transform group-hover:scale-105 group-hover:drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300 blur-xl"></div>
            </div>
            <div className="ml-3 hidden lg:block">
              <div className="text-xs font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Digital Dudes</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Premium OTT Subscriptions</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className="relative px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 font-medium group overflow-hidden">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
            </Link>
            <Link to="/shop" className="relative px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 font-medium group overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Shop
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
            </Link>
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="relative px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 font-medium group overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                </Link>
                <Link to="/support" className="relative px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 font-medium group overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    Support
                  </span>
                  {unreadTicketCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white dark:border-gray-800">
                      {unreadTicketCount}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="relative px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 font-medium group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowAdminNotifications(!showAdminNotifications)}
                      className="relative p-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group"
                      aria-label="Admin Notifications"
                    >
                      <Bell className="w-5 h-5 group-hover:animate-bell-ring" />
                      {adminNotificationCount > 0 && (
                        <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white dark:border-gray-800">
                          {adminNotificationCount}
                        </span>
                      )}
                    </button>

                    {showAdminNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                        <div className="p-4 border-b dark:border-gray-700">
                          <h3 className="font-bold dark:text-white">Admin Notifications</h3>
                        </div>
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdminNotifications(false);
                              navigate('/admin/orders');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <span className="text-sm font-medium dark:text-white">New Orders (Pending)</span>
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{adminPendingOrders}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdminNotifications(false);
                              navigate('/admin/tickets');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <span className="text-sm font-medium dark:text-white">Open Support Tickets</span>
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{adminOpenTickets}</span>
                          </button>
                          {adminNotificationCount === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              No new notifications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {user?.role === 'customer' && (
                  <>
                    <Link to="/cart" className="relative p-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group">
                      <ShoppingCart className="w-5 h-5 group-hover:animate-cart-bounce" />
                      {cartItemCount > 0 && (
                        <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-gray-800">
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
                        className="relative p-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group"
                      >
                        <Bell className="w-5 h-5 group-hover:animate-bell-ring" />
                        {notifications.filter(n => !readNotifications.includes(n.id)).length > 0 && (
                          <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white dark:border-gray-800">
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
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <Link to="/login" className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 font-medium group">
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300"></div>
                </Link>
                <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium group overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Sign Up
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 group-hover:from-white/10 group-hover:to-white/30 rounded-xl transition-all duration-300"></div>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link
                  to="/support"
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                  aria-label="Support"
                >
                  <Headphones className="w-6 h-6" />
                  {unreadTicketCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadTicketCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => {
                      const wasOpen = showNotifications;
                      setShowNotifications(!showNotifications);
                      if (!wasOpen && notifications.length > 0) {
                        const allIds = notifications.map(n => n.id);
                        const updated = [...readNotifications, ...allIds];
                        setReadNotifications(updated);
                        localStorage.setItem('readNotifications', JSON.stringify(updated));
                      }
                    }}
                    className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="w-6 h-6" />
                    {notifications.filter(n => !readNotifications.includes(n.id)).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
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
                                setShowNotifications(false);
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

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
