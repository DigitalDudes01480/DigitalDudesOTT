import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader, Building2, Smartphone } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { orderAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('khalti');
  const [receiptFile, setReceiptFile] = useState(null);
  const [itemEmails, setItemEmails] = useState({});

  const total = getTotal();

  // Get items that require own account email
  const ownAccountItems = items.filter(item => 
    item.selectedProfile?.requiresOwnAccount && !item.customerEmail
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiptFile) {
      toast.error('Please upload payment receipt');
      return;
    }

    // Validate emails for own account items
    for (const item of ownAccountItems) {
      const email = itemEmails[item._id];
      if (!email) {
        toast.error(`Please provide email for ${item.name} (Own Account)`);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error(`Please provide a valid email for ${item.name}`);
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      const orderItems = items.map(item => ({
        product: item._id,
        name: item.name,
        ottType: item.ottType,
        quantity: item.quantity,
        price: item.price,
        selectedProfile: item.selectedProfile,
        selectedPricing: item.selectedPricing,
        customerEmail: item.customerEmail || itemEmails[item._id]
      }));

      formData.append('orderItems', JSON.stringify(orderItems));
      formData.append('paymentMethod', paymentMethod);
      formData.append('totalAmount', total);
      formData.append('receipt', receiptFile);

      const response = await orderAPI.create(formData);

      clearCart();
      toast.success('Order placed successfully! We will verify your payment and deliver soon.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-6 dark:text-white">Payment Method</h2>
        
        <div className="space-y-4 mb-6">
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="khalti"
              checked={paymentMethod === 'khalti'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <Smartphone className="w-5 h-5 mr-2 text-primary-600" />
            <span className="font-medium dark:text-white">Khalti</span>
          </label>

          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="bank-transfer"
              checked={paymentMethod === 'bank-transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <Building2 className="w-5 h-5 mr-2 text-primary-600" />
            <span className="font-medium dark:text-white">Bank Transfer</span>
          </label>
        </div>

        {paymentMethod === 'khalti' && (
          <div className="mb-6 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800">
            <h3 className="font-bold text-lg mb-4 text-secondary-700 dark:text-white">Scan QR Code for Payment</h3>
            <div className="flex justify-center mb-4">
              <img 
                src="/images/WhatsApp Image 2026-01-06 at 17.24.10.jpeg" 
                alt="Khalti QR Code" 
                className="w-64 h-64 object-contain bg-white p-4 rounded-lg shadow-lg"
              />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              Scan this QR code with your Khalti app to make payment
            </p>
          </div>
        )}

        {paymentMethod === 'bank-transfer' && (
          <div className="mb-6 p-6 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg border-2 border-secondary-200 dark:border-secondary-800">
            <h3 className="font-bold text-lg mb-4 text-secondary-700 dark:text-white">Bank Transfer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm dark:text-gray-300">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Name</p>
                  <p className="font-bold text-lg">NIC Asia</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Name</p>
                  <p className="font-bold text-lg">Digital Dudes</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
                  <p className="font-bold text-lg font-mono">0265753195560001</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4 text-xs">
                  📱 Scan QR code or transfer manually and upload receipt below
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-semibold mb-3 dark:text-white">Scan QR Code</p>
                <img 
                  src="/images/nic-asia-qr.png" 
                  alt="NIC Asia Bank QR Code" 
                  className="w-full max-w-xs h-auto object-contain bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">NIC Asia MoBank</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Upload Payment Receipt <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                id="receipt-upload"
                required
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {receiptFile ? receiptFile.name : 'Click to upload receipt (Image or PDF)'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {ownAccountItems.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Account Activation Details</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please provide your email address for the following items that require own account activation:
          </p>
          
          <div className="space-y-4">
            {ownAccountItems.map((item) => (
              <div key={item._id} className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Profile: {item.selectedProfile?.name}
                    </p>
                  </div>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded font-medium">
                    Own Account
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={itemEmails[item._id] || ''}
                    onChange={(e) => setItemEmails({
                      ...itemEmails,
                      [item._id]: e.target.value
                    })}
                    placeholder="Enter email for account activation"
                    className="input-field w-full"
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    We'll activate the service on this email address
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-6 dark:text-white">Order Summary</h2>
        
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm">
              <span className="dark:text-gray-300">
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium dark:text-white">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t dark:border-gray-700 pt-4">
          <div className="flex justify-between text-xl font-bold dark:text-white mb-6">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(total)}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order - ${formatCurrency(total)}`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

const Checkout = () => {
  const { items } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Scan the QR code for payment and upload the receipt.
          </p>
        </div>
        <CheckoutForm />
      </div>
    </div>
  );
};

export default Checkout;
