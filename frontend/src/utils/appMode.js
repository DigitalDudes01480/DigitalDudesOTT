export const isAndroidWebView = () => {
  if (typeof window !== 'undefined') {
    // Check if loading from Capacitor (bundled app)
    if (window.location.protocol === 'capacitor:') {
      localStorage.setItem('appMode', '1');
      return true;
    }
    
    try {
      const params = new URLSearchParams(window.location.search);
      const forced = params.get('app');
      if (forced === '1' || forced === 'true') {
        localStorage.setItem('appMode', '1');
        return true;
      }
      if (localStorage.getItem('appMode') === '1') return true;
    } catch (_) {
    }
  }

  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isWvUa = /\bwv\b/i.test(ua) || /;\s*wv\)/i.test(ua);
  const hasVersion = /Version\/\d+(?:\.\d+)*/i.test(ua);
  const hasWebViewToken = /WebView/i.test(ua) || /Crosswalk/i.test(ua);
  const hasChromeToken = /Chrome\//i.test(ua);
  const hasAndroidWebViewSignature = isWvUa || hasVersion || hasWebViewToken || (isAndroid && hasChromeToken && hasVersion);

  const hasRnBridge = typeof window !== 'undefined' && Boolean(window.ReactNativeWebView);
  const hasFlutterBridge = typeof window !== 'undefined' && Boolean(window.flutter_inappwebview);

  return isAndroid && (hasAndroidWebViewSignature || hasRnBridge || hasFlutterBridge);
};

export const getQueryParam = (key) => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

export const compareSemver = (a, b) => {
  const pa = String(a || '').split('.').map((n) => Number(n));
  const pb = String(b || '').split('.').map((n) => Number(n));
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};
