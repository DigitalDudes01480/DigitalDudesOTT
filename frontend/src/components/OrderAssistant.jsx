import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Upload, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://digitaldudesott-production.up.railway.app/api';

const OrderAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [qrCodePath, setQrCodePath] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial greeting
      setMessages([{
        type: 'bot',
        message: "Hi! 👋 I'm your Digital Dudes Order Assistant. I can help you purchase OTT subscriptions like Netflix, Prime Video, Disney+, Spotify, and YouTube Premium.\n\nWhich product are you interested in?",
        suggestions: ['Netflix', 'Prime Video', 'Disney+']
      }]);
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    // Add user message
    const userMessage = { type: 'user', message };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/order-assistant/chat`, {
        message,
        conversationHistory: messages
      });

      const botResponse = response.data.response;

      // Add bot message
      const botMessage = {
        type: 'bot',
        message: botResponse.message,
        suggestions: botResponse.suggestions || [],
        showPaymentQR: botResponse.showPaymentQR,
        qrCodePath: botResponse.qrCodePath,
        showReceiptUpload: botResponse.showReceiptUpload
      };

      setMessages(prev => [...prev, botMessage]);

      // Update UI state
      if (botResponse.showPaymentQR && botResponse.qrCodePath) {
        setQrCodePath(botResponse.qrCodePath);
      }
      if (botResponse.showReceiptUpload) {
        setShowReceiptUpload(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_URL}/order-assistant/chat`
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Sorry, I encountered an error. Please try again.';
      
      setMessages(prev => [...prev, {
        type: 'bot',
        message: `Error: ${errorMessage}\n\nAPI URL: ${API_URL}/order-assistant/chat\nPlease check browser console for details.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptFile(file);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${API_URL}/order-assistant/upload-receipt`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Add confirmation message
      setMessages(prev => [...prev, {
        type: 'bot',
        message: response.data.message
      }]);

      // Reset state
      setShowReceiptUpload(false);
      setQrCodePath(null);
      setReceiptFile(null);
    } catch (error) {
      console.error('Receipt upload error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        message: 'Failed to upload receipt. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50"
          aria-label="Open Order Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Order Assistant</h3>
                <p className="text-xs text-white/80">Digital Dudes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>

                {/* QR Code Display */}
                {msg.showPaymentQR && msg.qrCodePath && (
                  <div className="mt-3 flex justify-start">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                      <img
                        src={msg.qrCodePath}
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                        Scan to pay
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <Loader className="w-5 h-5 animate-spin text-primary-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Receipt Upload */}
          {showReceiptUpload && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <label className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {receiptFile ? receiptFile.name : 'Upload Receipt'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-2 rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderAssistant;
