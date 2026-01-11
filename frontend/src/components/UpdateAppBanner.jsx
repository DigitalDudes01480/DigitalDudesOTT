import { Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isAndroidWebView, getQueryParam, compareSemver } from '../utils/appMode';

const UpdateAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isApp = isAndroidWebView();
  const currentVersion = getQueryParam('appVersion');
  const latestVersion = '1.2'; // Update this when releasing new versions

  useEffect(() => {
    if (!isApp || !currentVersion || dismissed) {
      setShowBanner(false);
      return;
    }

    // Check if dismissed in this session
    const dismissedInSession = sessionStorage.getItem('updateBannerDismissed');
    if (dismissedInSession === 'true') {
      setShowBanner(false);
      return;
    }

    // Compare versions
    const needsUpdate = compareSemver(currentVersion, latestVersion) === -1;
    setShowBanner(needsUpdate);
  }, [isApp, currentVersion, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('updateBannerDismissed', 'true');
  };

  const handleUpdate = () => {
    // Open download page in external browser
    window.open('https://frontend-virid-nu-28.vercel.app/download', '_blank');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Download className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">New Version Available!</p>
              <p className="text-xs opacity-90">Update to v{latestVersion} for the latest features and fixes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAppBanner;
