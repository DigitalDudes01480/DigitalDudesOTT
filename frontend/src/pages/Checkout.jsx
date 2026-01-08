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

  const total = getTotal();

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
        selectedPricing: item.selectedPricing
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
            <div className="space-y-2 text-sm dark:text-gray-300">
              <p><span className="font-semibold">Bank Name:</span> Your Bank Name</p>
              <p><span className="font-semibold">Account Name:</span> Digital Dudes</p>
              <p><span className="font-semibold">Account Number:</span> XXXX-XXXX-XXXX</p>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Transfer the amount and upload the receipt below</p>
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
