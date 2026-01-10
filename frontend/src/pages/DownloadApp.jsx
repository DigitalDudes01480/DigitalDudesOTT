import { Download, Smartphone, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DownloadApp = () => {
  const [apkAvailable, setApkAvailable] = useState(false);
  const [checkingApk, setCheckingApk] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkApkAvailability = async () => {
      try {
        const res = await fetch('/downloads/digital-dudes.apk', { method: 'HEAD', cache: 'no-store' });
        const isAvailable = Boolean(res.ok || res.status === 405);
        if (!cancelled) setApkAvailable(isAvailable);
      } catch (e) {
        if (!cancelled) setApkAvailable(false);
      } finally {
        if (!cancelled) setCheckingApk(false);
      }
    };

    checkApkAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = () => {
    // Download the APK file
    const link = document.createElement('a');
    link.href = '/downloads/digital-dudes.apk';
    link.download = 'digital-dudes.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-xl">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text">
            Download Digital Dudes App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get the best OTT subscription deals right on your Android device
          </p>
        </div>

        {/* Download Card */}
        <div className="card mb-8 text-center">
          <div className="mb-6">
            <img 
              src="/images/Untitled design-5.png" 
              alt="Digital Dudes Logo" 
              className="h-24 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold dark:text-white mb-2">Digital Dudes OTT</h2>
            <p className="text-gray-600 dark:text-gray-400">Version 1.0.0 • 5.2 MB</p>
          </div>

          {apkAvailable ? (
            <>
              <button
                onClick={handleDownload}
                className="btn-primary inline-flex items-center justify-center text-lg mb-4"
              >
                <Download className="w-6 h-6 mr-2" />
                Download APK
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                For Android 7.0 and above • Version 1.0.0
              </p>
            </>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">APK Coming Soon!</h4>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
                      {checkingApk
                        ? 'Checking APK availability...'
                        : "We're currently building the Android app. The APK will be available for download very soon."}
                    </p>
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      Want to be notified when it's ready? Contact us at{' '}
                      <a href="mailto:digitaldudes18@gmail.com" className="font-semibold underline">
                        digitaldudes18@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold py-4 px-10 rounded-xl inline-flex items-center justify-center text-lg mb-4 cursor-not-allowed opacity-60"
              >
                <Download className="w-6 h-6 mr-2" />
                APK Coming Soon
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                For Android 7.0 and above • Version 1.0.0
              </p>
            </>
          )}
        </div>

        {/* Installation Instructions */}
        <div className="card mb-8">
          <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-primary-600" />
            Installation Instructions
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h4 className="font-semibold dark:text-white mb-1">Download the APK</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Click the "Download APK" button above to download the app file to your device.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h4 className="font-semibold dark:text-white mb-1">Enable Unknown Sources</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Go to Settings → Security → Enable "Install from Unknown Sources" or "Allow from this source"
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h4 className="font-semibold dark:text-white mb-1">Install the App</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Open the downloaded APK file and tap "Install". Wait for installation to complete.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div>
                <h4 className="font-semibold dark:text-white mb-1">Launch & Enjoy</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Open the Digital Dudes app from your home screen and start shopping for premium subscriptions!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Safe & Secure</h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                This APK is the official Digital Dudes app. We don't collect any unnecessary data and all transactions are encrypted and secure.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-yellow-600" />
            Troubleshooting
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold dark:text-white mb-1">Can't install the app?</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Make sure you've enabled "Install from Unknown Sources" in your device settings. The exact location varies by device manufacturer.
              </p>
            </div>

            <div>
              <h4 className="font-semibold dark:text-white mb-1">App not working properly?</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Try uninstalling and reinstalling the app. Make sure you have a stable internet connection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold dark:text-white mb-1">Need help?</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Contact our support team at{' '}
                <Link to="/support" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Support Page
                </Link>
                {' '}or email us at digitaldudes18@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Back to Website */}
        <div className="text-center mt-8">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
