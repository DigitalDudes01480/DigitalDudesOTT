import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, updateItemEmail, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [emailInputs, setEmailInputs] = useState({});

  const total = getTotal();

  const handleEmailChange = (itemId, email) => {
    setEmailInputs({ ...emailInputs, [itemId]: email });
  };

  const handleEmailBlur = (itemId, email) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      updateItemEmail(itemId, email);
      toast.success('Email saved!');
    } else if (email) {
      toast.error('Please enter a valid email address');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-400 mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 dark:text-white">Your Cart is Empty</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
              Add some amazing OTT subscriptions to your cart!
            </p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-lg sm:text-3xl font-bold dark:text-white">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm sm:text-base text-red-600 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item._id} className="card p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <img
                    src={item.image || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="w-full sm:w-28 h-32 sm:h-28 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold dark:text-white">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {item.ottType} • {item.duration.value} {item.duration.unit}
                        </p>
                        {item.selectedProfile?.name && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            Profile: {item.selectedProfile.name}
                          </p>
                        )}
                        {item.selectedProfile?.requiresOwnAccount && (
                          <span className="inline-flex items-center text-[10px] sm:text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-medium mt-0.5">
                            Own Account
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 p-1.5 sm:p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {item.selectedProfile?.requiresOwnAccount && (
                      <div className="mt-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
                        <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-gray-900 dark:text-white">
                          Email for Account Activation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={emailInputs[item._id] !== undefined ? emailInputs[item._id] : (item.customerEmail || '')}
                          onChange={(e) => handleEmailChange(item._id, e.target.value)}
                          onBlur={(e) => handleEmailBlur(item._id, e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-1.5 sm:mt-2 font-medium">
                          📧 We'll activate the service on this email address
                        </p>
                        {item.customerEmail && (
                          <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1.5 sm:mt-2 flex items-center font-semibold">
                            ✓ Email saved: {item.customerEmail}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-medium dark:text-white w-8 sm:w-10 text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base sm:text-xl font-bold text-primary-600">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatCurrency(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-4 sm:p-6 sticky top-20">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 dark:text-white">Order Summary</h2>

              {/* Coupon Code Input */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Have a Coupon Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-2 sm:pt-3">
                  <div className="flex justify-between text-lg sm:text-xl font-bold dark:text-white">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-3 sm:py-4 text-base sm:text-lg mb-3 sm:mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center text-sm sm:text-base text-primary-600 hover:text-primary-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
