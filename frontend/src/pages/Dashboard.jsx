import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, CreditCard, User, Calendar, Clock, CheckCircle, XCircle, Key } from 'lucide-react';
import { subscriptionAPI, orderAPI, transactionAPI } from '../utils/api';
import { formatCurrency, formatDate, getDaysRemaining, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, ordersRes, transRes] = await Promise.all([
        subscriptionAPI.getMySubscriptions().catch(() => ({ data: { subscriptions: [] } })),
        orderAPI.getMyOrders().catch(() => ({ data: { orders: [] } })),
        transactionAPI.getMyTransactions().catch(() => ({ data: { transactions: [] } }))
      ]);

      setSubscriptions(subsRes.data?.subscriptions || []);
      setOrders(ordersRes.data?.orders || []);
      setTransactions(transRes.data?.transactions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubscriptions([]);
      setOrders([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired');

  const tabs = [
    { id: 'subscriptions', label: 'My Subscriptions', icon: Package },
    { id: 'orders', label: 'Order History', icon: Calendar },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-lg md:text-3xl font-bold dark:text-white mb-1 md:mb-2">My Dashboard</h1>
          <p className="text-xs md:text-base text-gray-600 dark:text-gray-400">
            Manage your subscriptions and account
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
          <div className="card p-3 md:p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Active Subscriptions</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{activeSubscriptions.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="card p-3 md:p-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Total Orders</p>
                <p className="text-2xl md:text-3xl font-bold text-primary-600 mt-1">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 md:w-12 md:h-12 text-primary-600 opacity-20" />
            </div>
          </div>

          <div className="card p-3 md:p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Expired Subscriptions</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">{expiredSubscriptions.length}</p>
              </div>
              <XCircle className="w-8 h-8 md:w-12 md:h-12 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="card p-3 md:p-6">
          <div className="border-b dark:border-gray-700 mb-4 md:mb-6">
            <div className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 md:space-x-2 pb-3 md:pb-4 px-1 md:px-2 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 font-semibold'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-medium hidden sm:inline">{tab.label}</span>
                    <span className="font-medium sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === 'subscriptions' && <SubscriptionsTab subscriptions={subscriptions} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} />}
              {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
              {activeTab === 'profile' && <ProfileTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SubscriptionsTab = ({ subscriptions }) => {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">No subscriptions yet</p>
        <Link to="/shop" className="btn-primary">
          Browse Subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {subscriptions.map((subscription) => (
        <div key={subscription._id} className="border dark:border-gray-700 rounded-lg p-3 md:p-6 hover:shadow-md transition bg-white dark:bg-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                <h3 className="text-base md:text-lg font-bold dark:text-white">{subscription.ottType}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Started: {formatDate(subscription.startDate)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Expires: {formatDate(subscription.expiryDate)}
                </div>
              </div>
              {subscription.status === 'active' && (
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-green-600">
                      {subscription.daysRemaining} days remaining
                    </span>
                  </div>
                </div>
              )}
            </div>
            {subscription.credentials && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 p-3 md:p-5 rounded-lg w-full md:min-w-[320px]">
                <p className="text-xs md:text-sm font-bold text-primary-700 dark:text-primary-300 mb-2 md:mb-3 uppercase">🔑 Login Credentials</p>
                <div className="space-y-1.5 md:space-y-2">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-mono font-semibold dark:text-white break-all">
                      {subscription.credentials.email || 'Not provided'}
                    </p>
                  </div>
                  {subscription.credentials.credentialType === 'loginPin' ? (
                    <>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Login PIN</p>
                        <p className="text-sm font-mono font-semibold dark:text-white break-all">
                          {subscription.credentials.loginPin || 'Not provided'}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await subscriptionAPI.requestSignInCode(subscription._id);
                            toast.success('Sign-in code request submitted! Admin will send the code shortly.');
                          } catch (error) {
                            toast.error(error.response?.data?.message || 'Failed to request sign-in code');
                          }
                        }}
                        className="w-full btn-secondary flex items-center justify-center space-x-2 text-sm"
                      >
                        <Key className="w-4 h-4" />
                        <span>Request Sign-In Code</span>
                      </button>
                    </>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Password</p>
                      <p className="text-sm font-mono font-semibold dark:text-white break-all">
                        {subscription.credentials.password || 'Not provided'}
                      </p>
                    </div>
                  )}
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profile</p>
                    <p className="text-sm font-mono font-semibold dark:text-white break-all">
                      {subscription.credentials.profile || 'Not provided'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profile PIN</p>
                    <p className="text-sm font-mono font-semibold dark:text-white break-all">
                      {subscription.credentials.profilePin || 'Not provided'}
                    </p>
                  </div>
                  {subscription.credentials.additionalNote && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">📝 Additional Note</p>
                      <p className="text-sm dark:text-white">{subscription.credentials.additionalNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {subscription.activationKey && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Activation Key</p>
                <p className="text-sm font-mono dark:text-white">{subscription.activationKey}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const OrdersTab = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="border dark:border-gray-700 rounded-lg p-3 md:p-6 bg-white dark:bg-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 mb-3 md:mb-4">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">Order ID: {order._id.substring(0, 12)}...</p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
              <span className="text-sm md:text-base font-medium dark:text-white">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          <div className="space-y-1.5 md:space-y-2">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between text-xs md:text-sm">
                <span className="dark:text-gray-300">{item.name} x {item.quantity}</span>
                <span className="font-medium dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t dark:border-gray-700 mt-3 md:mt-4 pt-3 md:pt-4 flex justify-between items-center">
            <span className="text-sm md:text-base font-bold dark:text-white">Total</span>
            <span className="text-lg md:text-xl font-bold text-primary-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TransactionsTab = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-3 md:mx-0">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Transaction ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-mono dark:text-gray-300">
                {transaction.transactionId.substring(0, 20)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                {formatDate(transaction.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300 capitalize">
                {transaction.paymentMethod}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProfileTab = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-bold mb-6 dark:text-white">Profile Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field"
            placeholder="Your phone number"
          />
        </div>

        <div className="border-t dark:border-gray-700 pt-6">
          <h4 className="text-lg font-bold mb-4 dark:text-white">Change Password</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="btn-primary">Save Changes</button>
          <button className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
