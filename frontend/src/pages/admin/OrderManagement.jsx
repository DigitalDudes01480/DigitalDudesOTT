import { useEffect, useState } from 'react';
import { Search, Eye, Truck, X, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    email: '',
    password: '',
    profile: '',
    profilePin: '',
    additionalNote: ''
  });

  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setError(null);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await orderAPI.getAll(params);
      
      const allOrders = response.data.orders || [];
      
      // Filter only website orders (orders without orderSource or with orderSource = 'website')
      const websiteOrders = allOrders.filter(order => {
        // Handle cases where orderSource might not exist yet
        const orderSource = order.orderSource || 'website'; // Default to website for backward compatibility
        const isWebsite = orderSource === 'website';
        return isWebsite;
      });
      
      setOrders(websiteOrders);
    } catch (error) {
      console.error('Error fetching website orders:', error);
      toast.error('Failed to fetch website orders');
      setError(error.response?.data?.message || error.message || 'Failed to fetch website orders');
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = (order) => {
    setSelectedOrder(order);
    setDeliveryForm({
      email: '',
      password: '',
      profile: '',
      profilePin: '',
      additionalNote: ''
    });
    setShowDeliveryModal(true);
  };

  const handleViewReceipt = (order) => {
    console.log('Viewing receipt for order:', order._id);
    console.log('Receipt Image:', order.receiptImage);
    console.log('Receipt Data:', order.receiptData ? 'Present' : 'Missing');
    if (order.receiptData) {
      console.log('Receipt Data Type:', order.receiptData.contentType);
      console.log('Receipt Data Size:', order.receiptData.data?.length || 0, 'characters');
    }
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const handleDeliverOrder = async () => {
    try {
      await orderAPI.deliver(selectedOrder._id, {
        credentials: deliveryForm
      });
      toast.success('Order delivered successfully!');
      setShowDeliveryModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error delivering order:', error);
      toast.error(error.response?.data?.message || 'Failed to deliver order');
    }
  };

  const handleMarkAsDone = async (orderId) => {
    try {
      await orderAPI.updateStatus(orderId, { orderStatus: 'delivered' });
      toast.success('Order marked as done!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}!`);
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleUpdateCredentials = (order) => {
    setSelectedOrder(order);
    setDeliveryForm({
      email: order.deliveryDetails?.credentials?.email || '',
      password: order.deliveryDetails?.credentials?.password || '',
      profile: order.deliveryDetails?.credentials?.profile || '',
      profilePin: order.deliveryDetails?.credentials?.profilePin || '',
      additionalNote: order.deliveryDetails?.credentials?.additionalNote || ''
    });
    setShowDeliveryModal(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await orderAPI.deleteAdmin(orderId);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const filteredOrders = (orders || []).filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading orders</p>
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
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Order Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and deliver website orders</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
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
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono dark:text-gray-300">
                    {order._id.substring(0, 10)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium dark:text-white">
                        {order.user?.name || order.customerInfo?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.email || order.customerInfo?.email || 'N/A'}
                      </p>
                    </div>
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
                      {order.orderStatus === 'delivered' && order.deliveryDetails?.credentials && (
                        <button
                          onClick={() => handleUpdateCredentials(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Update Credentials"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Edit Order"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
              </p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedOrder && !showDeliveryModal && !showStatusModal && !showReceiptModal && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

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

      {showEditModal && editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => {
            setShowEditModal(false);
            setEditingOrder(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingOrder(null);
            fetchOrders();
          }}
        />
      )}

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

              <div className="flex justify-center">
                {selectedOrder.receiptData?.data ? (
                  <img 
                    src={`data:${selectedOrder.receiptData.contentType};base64,${selectedOrder.receiptData.data}`}
                    alt="Payment Receipt" 
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                ) : selectedOrder.receiptImage ? (
                  <img 
                    src={selectedOrder.receiptImage.startsWith('http') ? selectedOrder.receiptImage : `http://localhost:5001${selectedOrder.receiptImage}`}
                    alt="Payment Receipt" 
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No receipt available</p>
                )}
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Order ID:</strong> {selectedOrder._id}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Current Status: <span className="font-semibold capitalize">{selectedOrder.orderStatus}</span>
                </p>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'pending')}
                  className="w-full p-3 text-left rounded-lg border-2 border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                >
                  <span className="font-semibold text-yellow-600">Pending</span>
                  <p className="text-xs text-gray-500">Order is awaiting processing</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'confirmed')}
                  className="w-full p-3 text-left rounded-lg border-2 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <span className="font-semibold text-blue-600">Confirmed</span>
                  <p className="text-xs text-gray-500">Order has been confirmed</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'processing')}
                  className="w-full p-3 text-left rounded-lg border-2 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                >
                  <span className="font-semibold text-purple-600">Processing</span>
                  <p className="text-xs text-gray-500">Order is being processed</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                  className="w-full p-3 text-left rounded-lg border-2 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                >
                  <span className="font-semibold text-green-600">Delivered</span>
                  <p className="text-xs text-gray-500">Order has been delivered</p>
                </button>

                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                  className="w-full p-3 text-left rounded-lg border-2 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
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
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Order Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                <p className="font-mono dark:text-white">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="dark:text-white">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                <p className="dark:text-white">{order.user?.name}</p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                <p className="dark:text-white capitalize">{order.paymentMethod}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2 dark:text-white">Order Items</h3>
              <div className="space-y-2">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.ottType} • {item.duration.value} {item.duration.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium dark:text-white">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.deliveryDetails && (
              <div>
                <h3 className="font-bold mb-2 dark:text-white">Delivery Details</h3>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  {order.deliveryDetails.credentials && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Credentials:</p>
                      <p className="text-sm">Email: {order.deliveryDetails.credentials.email}</p>
                      {order.deliveryDetails.credentials.password ? (
                        <p className="text-sm">Password: {order.deliveryDetails.credentials.password}</p>
                      ) : null}
                      {order.deliveryDetails.credentials.profile && (
                        <p className="text-sm">Profile: {order.deliveryDetails.credentials.profile}</p>
                      )}
                      {order.deliveryDetails.credentials.profilePin && (
                        <p className="text-sm">Profile PIN: {order.deliveryDetails.credentials.profilePin}</p>
                      )}
                      {order.deliveryDetails.credentials.additionalNote && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Additional Note:</p>
                          <p className="text-sm">{order.deliveryDetails.credentials.additionalNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {order.deliveryDetails.instructions && (
                    <div>
                      <p className="text-sm font-medium">Instructions:</p>
                      <p className="text-sm">{order.deliveryDetails.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span className="dark:text-white">Total</span>
                <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full btn-primary mt-6">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeliveryModal = ({ order, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    credentials: { email: '', password: '', profile: '', profilePin: '' },
    instructions: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill form with existing delivery details if order is already delivered
  useEffect(() => {
    if (order.deliveryDetails) {
      const existingCreds = order.deliveryDetails.credentials || {};
      
      setFormData({
        credentials: {
          email: existingCreds.email || '',
          password: existingCreds.password || '',
          profile: existingCreds.profile || '',
          profilePin: existingCreds.profilePin || ''
        },
        instructions: order.deliveryDetails.instructions || '',
        startDate: order.deliveryDetails.deliveredAt 
          ? new Date(order.deliveryDetails.deliveredAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await orderAPI.deliver(order._id, formData);
      toast.success('Order delivered successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delivery failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Deliver Order</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="font-bold mb-3 dark:text-white">Login Credentials (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.credentials.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, email: e.target.value }
                    })}
                    className="input-field"
                    placeholder="account@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Password</label>
                  <input
                    type="text"
                    value={formData.credentials.password}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, password: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Profile</label>
                  <input
                    type="text"
                    value={formData.credentials.profile}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, profile: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Profile name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Profile PIN</label>
                  <input
                    type="text"
                    value={formData.credentials.profilePin}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, profilePin: e.target.value }
                    })}
                    className="input-field"
                    placeholder="Profile PIN (if any)"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Additional instructions for the customer..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Delivering...' : 'Deliver Order'}
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

const EditOrderModal = ({ order, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    orderStatus: order.orderStatus || 'pending',
    paymentStatus: order.paymentStatus || 'pending',
    totalAmount: order.totalAmount ?? 0,
    adminNotes: order.adminNotes || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await orderAPI.updateAdmin(order._id, formData);
      toast.success('Order updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Edit Order</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Order Status</label>
              <select
                value={formData.orderStatus}
                onChange={(e) => setFormData((p) => ({ ...p, orderStatus: e.target.value }))}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData((p) => ({ ...p, paymentStatus: e.target.value }))}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Total Amount</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData((p) => ({ ...p, totalAmount: e.target.value }))}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Admin Notes</label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => setFormData((p) => ({ ...p, adminNotes: e.target.value }))}
                className="input-field"
                rows="3"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
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

export default OrderManagement;
