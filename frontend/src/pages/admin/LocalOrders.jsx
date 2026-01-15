import { useEffect, useState } from 'react';
import { Search, Eye, Truck, X, Image as ImageIcon, Plus, Filter } from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import LocalOrderModal from './LocalOrderModal';
import DeliveryModal from './OrderManagement';
import toast from 'react-hot-toast';

const LocalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLocalOrderModal, setShowLocalOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sourceFilter]);

  const fetchOrders = async () => {
    try {
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      
      const response = await orderAPI.getAll(params);
      // Filter only local orders (not from website)
      const localOrders = response.data.orders.filter(order => order.orderSource !== 'website');
      setOrders(localOrders || []);
    } catch (error) {
      console.error('Error fetching local orders:', error);
      toast.error('Failed to fetch local orders');
      setError(error.message || 'Failed to fetch local orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = (order) => {
    setSelectedOrder(order);
    setShowDeliveryModal(true);
  };

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const handleStatusChange = (orderId, newStatus) => {
    // Implementation for status change
    console.log('Change status:', orderId, newStatus);
  };

  const filteredOrders = (orders || []).filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading local orders</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Local Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage orders from Facebook, Messenger, WhatsApp, and other platforms</p>
        </div>
        <button
          onClick={() => setShowLocalOrderModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Local Order</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Local Orders</p>
              <p className="text-2xl font-bold dark:text-white">{orders.length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Facebook</p>
              <p className="text-2xl font-bold dark:text-white">
                {orders.filter(o => o.orderSource === 'facebook').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
              <p className="text-2xl font-bold dark:text-white">
                {orders.filter(o => o.orderSource === 'whatsapp').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Filter className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold dark:text-white">
                {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search local orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Sources</option>
            <option value="facebook">Facebook</option>
            <option value="messenger">Messenger</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="phone">Phone</option>
            <option value="in-person">In Person</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono dark:text-gray-300">
                    {order._id.substring(0, 10)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium dark:text-white">
                        {order.customerInfo?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerInfo?.email || 'N/A'}
                      </p>
                      {order.customerInfo?.phone && (
                        <p className="text-xs text-gray-400">{order.customerInfo.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.orderSource === 'facebook' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      order.orderSource === 'whatsapp' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      order.orderSource === 'messenger' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      order.orderSource === 'instagram' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {order.orderSource || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                    {order.orderItems.length} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium dark:text-white">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {(order.receiptImage || order.receiptData) && (
                        <button
                          onClick={() => handleViewReceipt(order)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="View Receipt"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDeliveryModal(false);
                          setShowStatusModal(false);
                          setShowReceiptModal(false);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="Change Status"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      {order.orderStatus !== 'delivered' && (
                        <button
                          onClick={() => handleDeliver(order)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Deliver Order"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter || sourceFilter ? 'No local orders found matching your filters.' : 'No local orders found.'}
              </p>
              {!searchTerm && !statusFilter && !sourceFilter && (
                <button
                  onClick={() => setShowLocalOrderModal(true)}
                  className="btn-primary mt-4"
                >
                  Create First Local Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showDeliveryModal && !showStatusModal && !showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Local Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="font-mono dark:text-white">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order Source</p>
                    <p className="dark:text-white">{selectedOrder.orderSource}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
                    <p className="dark:text-white">{selectedOrder.customerInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer Email</p>
                    <p className="dark:text-white">{selectedOrder.customerInfo?.email}</p>
                  </div>
                  {selectedOrder.customerInfo?.phone && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="dark:text-white">{selectedOrder.customerInfo.phone}</p>
                    </div>
                  )}
                  {selectedOrder.customerInfo?.address && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="dark:text-white">{selectedOrder.customerInfo.address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="dark:text-white">{selectedOrder.localOrderDetails?.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                    <p className="dark:text-white">{selectedOrder.localOrderDetails?.platform || 'N/A'}</p>
                  </div>
                </div>

                {selectedOrder.localOrderDetails?.notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="dark:text-white">{selectedOrder.localOrderDetails.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="font-medium dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.ottType} - {item.quantity}x</p>
                        </div>
                        <p className="font-medium dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold dark:text-white">Total Amount</p>
                    <p className="text-lg font-bold dark:text-white">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Payment Receipt</h2>
                <button onClick={() => setShowReceiptModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedOrder.receiptImage ? (
                <img 
                  src={selectedOrder.receiptImage} 
                  alt="Payment Receipt" 
                  className="w-full rounded-lg"
                />
              ) : selectedOrder.receiptData ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Receipt data available</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No receipt available</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Order ID:</strong> {selectedOrder._id}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Payment Method:</strong> {selectedOrder.localOrderDetails?.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Change Order Status</h2>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'confirmed')}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="font-semibold text-blue-600">Confirmed</span>
                  <p className="text-xs text-gray-500">Order has been confirmed</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'processing')}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="font-semibold text-yellow-600">Processing</span>
                  <p className="text-xs text-gray-500">Order is being processed</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="font-semibold text-green-600">Delivered</span>
                  <p className="text-xs text-gray-500">Order has been delivered</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="font-semibold text-red-600">Cancelled</span>
                  <p className="text-xs text-gray-500">Order has been cancelled</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'refunded')}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Refunded</span>
                  <p className="text-xs text-gray-500">Order has been refunded</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && selectedOrder && (
        <DeliveryModal 
          order={selectedOrder}
          onClose={() => setShowDeliveryModal(false)}
          onSuccess={() => {
            setShowDeliveryModal(false);
            fetchOrders();
          }}
        />
      )}

      {/* Local Order Modal */}
      {showLocalOrderModal && (
        <LocalOrderModal
          onClose={() => setShowLocalOrderModal(false)}
          onSuccess={() => {
            setShowLocalOrderModal(false);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default LocalOrders;
