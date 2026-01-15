import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { productAPI, orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const LocalOrderModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formData, setFormData] = useState({
    customerInfo: {
      name: '',
      phone: '',
      address: ''
    },
    orderSource: 'facebook',
    localOrderDetails: {
      platform: '',
      contactPerson: '',
      notes: '',
      paymentMethod: 'cash',
      paymentReference: ''
    },
    orderItems: [],
    adminNotes: '',
    couponCode: '',
    couponDiscount: 0,
    originalAmount: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };


  const addOrderItem = () => {
    const newItem = {
      product: '',
      name: '',
      ottType: '',
      selectedProfileType: '',
      selectedDuration: '',
      duration: { value: 30, unit: 'days' },
      price: 0,
      quantity: 1
    };
    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, newItem]
    }));
  };

  const removeOrderItem = (index) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.orderItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      // If product is selected, auto-fill details and reset profile/duration
      if (field === 'product' && value) {
        const product = products.find(p => p._id === value);
        if (product) {
          updatedItems[index] = {
            ...updatedItems[index],
            name: product.name,
            ottType: product.ottType,
            selectedProfileType: '',
            selectedDuration: '',
            price: 0
          };
        }
      }
      
      // If profile type is selected, reset duration and price
      if (field === 'selectedProfileType' && value) {
        updatedItems[index] = {
          ...updatedItems[index],
          selectedProfileType: value,
          selectedDuration: '',
          price: 0
        };
      }
      
      // If duration is selected, update price
      if (field === 'selectedDuration' && value) {
        const product = products.find(p => p._id === updatedItems[index].product);
        if (product) {
          const profileType = product.profileTypes?.find(pt => pt._id === updatedItems[index].selectedProfileType);
          const pricingOption = profileType?.pricingOptions?.find(po => po._id === value);
          if (pricingOption) {
            updatedItems[index] = {
              ...updatedItems[index],
              selectedDuration: value,
              duration: pricingOption.duration,
              price: pricingOption.price
            };
          }
        }
      }
      
      return { ...prev, orderItems: updatedItems };
    });
  };

  const calculateTotal = () => {
    const total = formData.orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const discountAmount = total * (formData.couponDiscount / 100);
    const finalTotal = total - discountAmount;
    
    setFormData(prev => ({
      ...prev,
      originalAmount: total,
      totalAmount: finalTotal
    }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.orderItems, formData.couponDiscount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        totalAmount: formData.totalAmount,
        originalAmount: formData.originalAmount
      };

      await orderAPI.createLocal(orderData);
      toast.success('Local order created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating local order:', error);
      toast.error(error.response?.data?.message || 'Failed to create local order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Create Local Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="font-bold mb-3 dark:text-white">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Name *</label>
                  <input
                    type="text"
                    value={formData.customerInfo.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, name: e.target.value }
                    }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Address</label>
                  <input
                    type="text"
                    value={formData.customerInfo.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, address: e.target.value }
                    }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Order Source */}
            <div>
              <h3 className="font-bold mb-3 dark:text-white">Order Source</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Source *</label>
                  <select
                    value={formData.orderSource}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderSource: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="facebook">Facebook</option>
                    <option value="messenger">Messenger</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="phone">Phone</option>
                    <option value="in-person">In Person</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Platform</label>
                  <input
                    type="text"
                    value={formData.localOrderDetails.platform}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      localOrderDetails: { ...prev.localOrderDetails, platform: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="e.g., Facebook Page, WhatsApp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Contact Person</label>
                  <input
                    type="text"
                    value={formData.localOrderDetails.contactPerson}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      localOrderDetails: { ...prev.localOrderDetails, contactPerson: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Who handled this order"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold dark:text-white">Order Items</h3>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {formData.orderItems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No items added. Click "Add Item" to add products.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.orderItems.map((item, index) => {
                    const selectedProduct = products.find(p => p._id === item.product);
                    const selectedProfileType = selectedProduct?.profileTypes?.find(pt => pt._id === item.selectedProfileType);
                    
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Product *</label>
                            <select
                              value={item.product}
                              onChange={(e) => updateOrderItem(index, 'product', e.target.value)}
                              className="input-field"
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map(product => (
                                <option key={product._id} value={product._id}>
                                  {product.name} ({product.ottType})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Profile Type *</label>
                            <select
                              value={item.selectedProfileType}
                              onChange={(e) => updateOrderItem(index, 'selectedProfileType', e.target.value)}
                              className="input-field"
                              required
                              disabled={!item.product}
                            >
                              <option value="">Select Profile Type</option>
                              {selectedProduct?.profileTypes?.map(profileType => (
                                <option key={profileType._id} value={profileType._id}>
                                  {profileType.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Duration *</label>
                            <select
                              value={item.selectedDuration}
                              onChange={(e) => updateOrderItem(index, 'selectedDuration', e.target.value)}
                              className="input-field"
                              required
                              disabled={!item.selectedProfileType}
                            >
                              <option value="">Select Duration</option>
                              {selectedProfileType?.pricingOptions?.map(pricingOption => (
                                <option key={pricingOption._id} value={pricingOption._id}>
                                  {pricingOption.duration.value} {pricingOption.duration.unit} - NPR {pricingOption.price}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="input-field"
                              min="1"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="btn-secondary text-red-600 hover:text-red-700 w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {item.price > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm dark:text-white">
                              <span className="font-medium">Subtotal:</span> NPR {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="font-bold mb-3 dark:text-white">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Payment Method *</label>
                  <select
                    value={formData.localOrderDetails.paymentMethod}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      localOrderDetails: { ...prev.localOrderDetails, paymentMethod: e.target.value }
                    }))}
                    className="input-field"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="esewa">eSewa</option>
                    <option value="khalti">Khalti</option>
                    <option value="phonepay">PhonePay</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Payment Reference</label>
                  <input
                    type="text"
                    value={formData.localOrderDetails.paymentReference}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      localOrderDetails: { ...prev.localOrderDetails, paymentReference: e.target.value }
                    }))}
                    className="input-field"
                    placeholder="Transaction ID, Cheque No., etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div>
              <h3 className="font-bold mb-3 dark:text-white">Pricing Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>NPR {formData.originalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount ({formData.couponDiscount}%):</span>
                  <span>-NPR {(formData.originalAmount * formData.couponDiscount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>NPR {formData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Notes</label>
              <textarea
                value={formData.localOrderDetails.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  localOrderDetails: { ...prev.localOrderDetails, notes: e.target.value }
                }))}
                className="input-field"
                rows="3"
                placeholder="Additional notes about this order..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Local Order'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocalOrderModal;
