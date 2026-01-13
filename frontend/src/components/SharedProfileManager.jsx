import React, { useState, useEffect } from 'react';
import { Users, Key, Clock, CheckCircle, XCircle, Mail, Send } from 'lucide-react';
import axios from 'axios';

const SharedProfileManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/shared-profile/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(response.data.data);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (subscriptionId, userId) => {
    setGenerating(prev => ({ ...prev, [`${subscriptionId}-${userId}`]: true }));
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `/api/shared-profile/subscriptions/${subscriptionId}/generate-code`,
        { userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess(`Code generated: ${response.data.data.code}`);
      fetchRequests(); // Refresh requests
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate code');
    } finally {
      setGenerating(prev => ({ ...prev, [`${subscriptionId}-${userId}`]: false }));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Profile Requests</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage customer access code requests</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
          </div>
        </div>
      )}

      <div className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No pending shared profile requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Pending
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Requested {formatDate(request.requestDate)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Customer Information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.user?.name} ({request.user?.email})
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Subscription Details</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.subscription?.ottType} - {request.subscription?.product?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {request.subscription?._id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Request pending for {Math.floor((new Date() - new Date(request.requestDate)) / (1000 * 60 * 60))} hours</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => generateCode(request.subscription._id, request.user._id)}
                      disabled={generating[`${request.subscription._id}-${request.user._id}`]}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {generating[`${request.subscription._id}-${request.user._id}`] ? 'Generating...' : 'Generate Code'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedProfileManager;
