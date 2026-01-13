import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AppBottomBar from './components/AppBottomBar';
import UpdateAppBanner from './components/UpdateAppBanner';
import MobileBottomNav from './components/MobileBottomNav';
import { isAndroidWebView } from './utils/appMode';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Support from './pages/Support';
import DownloadApp from './pages/DownloadApp';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import TicketManagement from './pages/admin/TicketManagement';
import FAQManagement from './pages/admin/FAQManagement';
import TutorialManagement from './pages/admin/TutorialManagement';
import CouponManagement from './pages/admin/CouponManagement';

function App() {
  const isApp = isAndroidWebView();

  return (
    <Router>
      <Toaster position="top-right" />
      <UpdateAppBanner />
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="tickets" element={<TicketManagement />} />
          <Route path="faqs" element={<FAQManagement />} />
          <Route path="tutorials" element={<TutorialManagement />} />
        </Route>

        <Route path="/*" element={
          <>
            <Navbar />
            <div className={isApp ? 'pb-32 md:pb-0' : 'pb-20 md:pb-0'}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/download" element={<DownloadApp />} />
              <Route path="/download-app" element={<DownloadApp />} />
              </Routes>
            </div>
            <Footer />
            {isApp ? <AppBottomBar /> : <MobileBottomNav />}
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
