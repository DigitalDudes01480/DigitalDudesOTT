import { useState, useEffect } from 'react';
import { subscriptionAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Key, Send, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

const SignInCodeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingCode, setSendingCode] = useState(null);
  const [codeInput, setCodeInput] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await subscriptionAPI.getSignInRequests();
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch sign-in code requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (subscriptionId, requestId) => {
    const code = codeInput[requestId];
    if (!code || code.trim() === '') {
      toast.error('Please enter a sign-in code');
      return;
    }

    setSendingCode(requestId);
    try {
      await subscriptionAPI.sendSignInCode({
        subscriptionId,
        requestId,
        code: code.trim()
      });
      toast.success('Sign-in code sent successfully!');
      setCodeInput({ ...codeInput, [requestId]: '' });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send sign-in code');
    } finally {
      setSendingCode(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white mb-2">Sign-In Code Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer requests for sign-in codes
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="card p-12 text-center">
            <Key className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold dark:text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-600 dark:text-gray-400">
              All sign-in code requests have been processed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => (
              <div key={item.subscription._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold dark:text-white">
                        {item.subscription.product?.name}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Customer:</span> {item.subscription.user?.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {item.subscription.user?.email}
                      </div>
                      <div>
                        <span className="font-medium">Account Email:</span> {item.subscription.credentials?.email}
                      </div>
                      <div>
                        <span className="font-medium">Login PIN:</span> {item.subscription.credentials?.loginPin}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {item.pendingRequests.map((request) => (
                    <div key={request._id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Requested: {formatDate(request.requestedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={codeInput[request._id] || ''}
                          onChange={(e) => setCodeInput({ ...codeInput, [request._id]: e.target.value })}
                          placeholder="Enter sign-in code (e.g., 123456)"
                          className="input-field flex-1"
                          disabled={sendingCode === request._id}
                        />
                        <button
                          onClick={() => handleSendCode(item.subscription._id, request._id)}
                          disabled={sendingCode === request._id}
                          className="btn-primary flex items-center space-x-2"
                        >
                          {sendingCode === request._id ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInCodeRequests;
