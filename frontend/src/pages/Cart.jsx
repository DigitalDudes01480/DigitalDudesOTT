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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Your Cart is Empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm sm:text-base text-red-600 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div key={item._id} className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.image || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.ottType} • {item.duration.value} {item.duration.unit}
                        </p>
                        {item.selectedProfile?.name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Profile: {item.selectedProfile.name}
                          </p>
                        )}
                        {item.selectedProfile?.requiresOwnAccount && (
                          <span className="inline-flex items-center text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded font-medium mt-1">
                            Own Account
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {item.selectedProfile?.requiresOwnAccount && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                        <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                          Email for Account Activation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={emailInputs[item._id] !== undefined ? emailInputs[item._id] : (item.customerEmail || '')}
                          onChange={(e) => handleEmailChange(item._id, e.target.value)}
                          onBlur={(e) => handleEmailBlur(item._id, e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                        />
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 font-medium">
                          📧 We'll activate the service on this email address
                        </p>
                        {item.customerEmail && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center font-semibold">
                            ✓ Email saved: {item.customerEmail}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-2 sm:p-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium dark:text-white w-10 text-center text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-2 sm:p-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
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
            <div className="card sticky top-20">
              <h2 className="text-xl font-bold mb-6 dark:text-white">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold dark:text-white">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-4 text-lg mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center text-primary-600 hover:text-primary-700 font-medium"
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
