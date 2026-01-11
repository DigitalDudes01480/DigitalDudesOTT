import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, LayoutDashboard, ShoppingCart, User, Shield } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    ...(isAuthenticated && user?.role === 'customer' ? [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [
      { path: '/admin', icon: Shield, label: 'Admin' }
    ] : []),
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItemCount },
    { path: isAuthenticated ? '/profile' : '/login', icon: User, label: 'Profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-[9999] pb-safe pointer-events-auto">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all pointer-events-auto ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {Number(item.badge) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-600 dark:bg-primary-400 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
