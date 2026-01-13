import React, { useState, useEffect } from 'react';
import { Lock, Key, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import axios from 'axios';

const SharedProfileCodeRequest = ({ subscription, onCodeGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [activeCode, setActiveCode] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    checkActiveCode();
  }, [subscription]);

  const checkActiveCode = async () => {
    try {
      const response = await axios.get('/api/shared-profile/my-codes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const activeCodes = response.data.data.filter(code => 
        code.subscription._id === subscription._id && 
        code.status === 'active' && 
        new Date(code.expiresAt) > new Date()
      );
      
      if (activeCodes.length > 0) {
        setActiveCode(activeCodes[0]);
      }
    } catch (err) {
      console.error('Error checking active codes:', err);
    }
  };

  const requestCode = async () => {
    setRequesting(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `/api/shared-profile/subscriptions/${subscription._id}/request-code`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Code request submitted successfully! You will receive your access code via email.');
      if (onCodeGenerated) {
        onCodeGenerated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request code');
    } finally {
      setRequesting(false);
    }
  };

  const validateCode = async () => {
    if (!codeInput.trim()) {
      setError('Please enter a code');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const response = await axios.get(
        `/api/shared-profile/validate/${codeInput.trim()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Code validated successfully! Accessing your shared profile...');
      setShowCodeInput(false);
      setCodeInput('');
      
      if (onCodeGenerated) {
        onCodeGenerated(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setValidating(false);
    }
  };

  const formatExpiryTime = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Shared Profile Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Request or validate your access code</p>
        </div>
      </div>

      {activeCode && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">Active Code Available</span>
          </div>
          <div className="text-center mb-3">
            <div className="inline-block bg-white dark:bg-gray-800 px-4 py-2 rounded border border-green-300 dark:border-green-700">
              <span className="font-mono text-lg font-bold text-green-700 dark:text-green-300">
                {activeCode.code}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300">
            <Clock className="w-4 h-4" />
            <span>Expires in {formatExpiryTime(activeCode.expiresAt)}</span>
          </div>
        </div>
      )}

      {!showCodeInput ? (
        <div className="space-y-3">
          <button
            onClick={() => setShowCodeInput(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Lock className="w-4 h-4" />
            Enter Access Code
          </button>
          
          <button
            onClick={requestCode}
            disabled={requesting || activeCode !== null}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {requesting ? 'Requesting...' : 'Request New Code'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Your Access Code
            </label>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={8}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={validateCode}
              disabled={validating}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {validating ? 'Validating...' : 'Validate Code'}
            </button>
            
            <button
              onClick={() => {
                setShowCodeInput(false);
                setCodeInput('');
                setError('');
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">How it works:</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Request a code from this dashboard</li>
          <li>• Receive code via email</li>
          <li>• Enter code to access shared profile</li>
          <li>• Codes expire in 24 hours</li>
        </ul>
      </div>
    </div>
  );
};

export default SharedProfileCodeRequest;
