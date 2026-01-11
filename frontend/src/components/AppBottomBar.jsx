import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, LayoutDashboard, User } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const AppBottomBar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const pathname = location.pathname;

  const isActive = (target) => {
    if (target === '/') return pathname === '/';
    return pathname.startsWith(target);
  };

  const dashboardHref = isAuthenticated ? '/dashboard' : '/login';
  const profileHref = isAuthenticated ? '/dashboard?tab=profile' : '/login';

  const items = [
    { to: '/', label: 'Home', icon: Home, active: isActive('/') },
    { to: '/shop', label: 'Shop', icon: ShoppingBag, active: isActive('/shop') },
    { to: dashboardHref, label: 'Dashboard', icon: LayoutDashboard, active: isActive('/dashboard') },
    { to: profileHref, label: 'Profile', icon: User, active: isActive('/dashboard') && new URLSearchParams(location.search).get('tab') === 'profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-stretch h-16">
          {items.map((item) => {
            const Icon = item.icon;
            const active = Boolean(item.active);

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all active:scale-95 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-semibold leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppBottomBar;
