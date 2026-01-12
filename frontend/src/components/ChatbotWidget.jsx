import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader, Minimize2, Ticket } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { chatbotAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({ category: '', subject: '', message: '' });
  const [receiptFile, setReceiptFile] = useState(null);
  const [currentOrderContext, setCurrentOrderContext] = useState(null);
  const [orderData, setOrderData] = useState({ paymentMethod: '' });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const { isAuthenticated, user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, typingMessage]);

  // Typing animation effect
  const simulateTyping = (fullMessage, callback) => {
    setIsTyping(true);
    setTypingMessage('');
    let currentIndex = 0;
    
    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setTypingMessage(fullMessage.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
        setTypingMessage('');
        callback();
      }
    }, 20); // 20ms per character for smooth typing
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial greeting
      setMessages([{
        id: Date.now(),
        type: 'bot',
        message: `Hello${user?.name ? ' ' + user.name : ''}! 👋\n\nI'm your Digital Dudes support assistant. How can I help you today?\n\nI can assist you with:\n• Order status and tracking\n• Subscription information\n• Account issues\n• Product inquiries\n• Technical support\n• Billing questions`,
        suggestions: ['Check my orders', 'View subscriptions', 'Product catalog', 'Create support ticket'],
        timestamp: new Date()
      }]);
    }
  }, [isOpen, user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!isAuthenticated || !user) {
      toast.error('Please login to use the chatbot');
      setIsOpen(false);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation history for AI context
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        message: msg.message
      }));
      
      const response = await chatbotAPI.chat({ 
        message: inputMessage,
        conversationHistory: conversationHistory
      });
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response structure from server');
      }
      
      const responseData = response.data.response || response.data;
      if (!responseData) {
        throw new Error('No response data received');
      }
      
      // Show AI indicator if AI-powered
      if (response.data.aiEnabled && responseData.aiPowered) {
        console.log('✨ AI-powered response');
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: responseData.message || 'I received your message but had trouble responding. Please try again.',
        suggestions: responseData.suggestions || ['Try again', 'Create ticket'],
        responseType: responseData.type || 'default',
        data: responseData.data || null,
        timestamp: new Date()
      };

      // Use typing animation for bot response
      setIsLoading(false);
      simulateTyping(botMessage.message, () => {
        setMessages(prev => [...prev, botMessage]);
        
        // If response suggests creating a ticket, show ticket form
        if (responseData.type === 'ticket_prompt') {
          setShowTicketForm(true);
        }
      });
    } catch (error) {
      console.error('Chat error:', error.message);
      
      let errorMsg = 'Sorry, I encountered an error. Please try again or create a support ticket.';
      
      if (error.response?.status === 401) {
        errorMsg = 'Your session has expired. Please refresh the page and log in again.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Our team has been notified. Please try again later.';
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        message: errorMsg,
        suggestions: ['Try again', 'Create support ticket'],
        timestamp: new Date()
      }]);
      toast.error(errorMsg);
    }
  };

  const handleSuggestionClick = (suggestion, messageData) => {
    if (suggestion === 'Create support ticket' || suggestion === 'Create ticket') {
      setShowTicketForm(true);
      return;
    }

    // Check if it's a ticket category
    const ticketCategories = ['Technical Issue', 'Billing Question', 'Account Problem', 'Subscription Help', 'Other'];
    if (ticketCategories.includes(suggestion)) {
      setTicketData(prev => ({ ...prev, category: suggestion }));
      setShowTicketForm(true);
      return;
    }

    // Handle payment method selection
    if (['Khalti', 'eSewa', 'Bank Transfer'].includes(suggestion)) {
      const paymentDetails = messageData?.paymentDetails;
      if (paymentDetails) {
        let qrMessage = `💳 ${suggestion} Payment Details:\n\n`;
        
        if (suggestion === 'Khalti' && paymentDetails.khalti) {
          qrMessage += `📱 Number: ${paymentDetails.khalti.number}\n\n`;
          qrMessage += `Scan QR code to pay:\n`;
          qrMessage += `[QR_CODE:${paymentDetails.khalti.qrCode}]\n\n`;
        } else if (suggestion === 'eSewa' && paymentDetails.esewa) {
          qrMessage += `📱 Number: ${paymentDetails.esewa.number}\n\n`;
          qrMessage += `Scan QR code to pay:\n`;
          qrMessage += `[QR_CODE:${paymentDetails.esewa.qrCode}]\n\n`;
        } else if (suggestion === 'Bank Transfer' && paymentDetails.bank) {
          qrMessage += `🏦 Bank: ${paymentDetails.bank.bankName}\n`;
          qrMessage += `📋 Account: ${paymentDetails.bank.accountNumber}\n`;
          qrMessage += `👤 Name: ${paymentDetails.bank.accountName}\n`;
          qrMessage += `🏢 Branch: ${paymentDetails.bank.branch}\n\n`;
        }
        
        qrMessage += `After payment, please upload your receipt below.`;
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          message: qrMessage,
          paymentMethod: suggestion,
          showUpload: true,
          timestamp: new Date()
        }]);
        
        setOrderData(prev => ({ ...prev, paymentMethod: suggestion }));
      }
      return;
    }

    // Handle "Proceed with payment"
    if (suggestion === 'Proceed with payment' && messageData) {
      setCurrentOrderContext(messageData);
      setInputMessage('payment');
      setTimeout(() => handleSendMessage(), 100);
      return;
    }

    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleCreateTicket = async () => {
    if (!ticketData.subject || !ticketData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatbotAPI.createTicket({
        category: ticketData.category,
        subject: ticketData.subject,
        message: ticketData.message,
        chatHistory: messages.map(m => ({ sender: m.type === 'user' ? 'User' : 'Bot', message: m.message }))
      });

      // Validate response
      if (!response || !response.data || !response.data.ticket) {
        throw new Error('Invalid response from ticket creation');
      }

      toast.success(`Ticket created! Ticket #${response.data.ticket.ticketNumber}`);
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        message: `✅ Support ticket created successfully!\n\nTicket #${response.data.ticket.ticketNumber}\nStatus: ${response.data.ticket.status}\n\nOur team will respond to your ticket soon. You can track it in the Support section.`,
        suggestions: ['View my tickets', 'Continue chatting'],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setShowTicketForm(false);
      setTicketData({ category: '', subject: '', message: '' });
    } catch (error) {
      console.error('Ticket creation error:', error.message);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create ticket. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!receiptFile) {
      toast.error('Please upload payment receipt first');
      return;
    }

    if (!currentOrderContext) {
      toast.error('Order context missing. Please start over.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('productId', currentOrderContext.productId);
      formData.append('profileType', currentOrderContext.profileType);
      formData.append('duration', JSON.stringify(currentOrderContext.pricing[0].duration));
      formData.append('paymentMethod', orderData.paymentMethod);
      formData.append('phone', user?.phone || '');

      const response = await chatbotAPI.placeOrder(formData);

      if (response.data.success) {
        toast.success(response.data.message);
        
        const successMessage = {
          id: Date.now(),
          type: 'bot',
          message: `✅ ${response.data.message}\n\nOrder #${response.data.order.orderNumber}\nAmount: ₹${response.data.order.totalAmount}\n\nYou can track your order in the Dashboard.`,
          suggestions: ['Go to Dashboard', 'Track order', 'Need help'],
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, successMessage]);
        setReceiptFile(null);
        setCurrentOrderContext(null);
        setOrderData({ productId: '', profileType: '', duration: null, paymentMethod: '', phone: '' });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[9998] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full p-4 shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[9998] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        } max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Support Assistant</h3>
                <p className="text-xs text-primary-100">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-primary-800 p-2 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="hover:bg-primary-800 p-2 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'} rounded-2xl px-4 py-3 shadow-sm`}>
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion, msg.data)}
                              className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors font-medium"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Display QR Code if present */}
                      {msg.message && msg.message.includes('[QR_CODE:') && (
                        <div className="mt-3">
                          {(() => {
                            const qrMatch = msg.message.match(/\[QR_CODE:(.*?)\]/);
                            if (qrMatch && qrMatch[1]) {
                              return (
                                <img 
                                  src={qrMatch[1]} 
                                  alt="Payment QR Code" 
                                  className="w-48 h-48 mx-auto border-2 border-gray-300 rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}
                          <p className="text-xs text-center mt-2 text-gray-500" style={{display: 'none'}}>
                            QR code not available
                          </p>
                        </div>
                      )}
                      {/* Receipt Upload Button */}
                      {msg.showUpload && (
                        <div className="mt-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setReceiptFile(file);
                                toast.success('Receipt uploaded! Click "Place Order" to complete.');
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            📎 Upload Payment Receipt
                          </button>
                          {receiptFile && (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-green-600">✓ {receiptFile.name}</p>
                              <button
                                onClick={handlePlaceOrder}
                                disabled={isLoading}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                {isLoading ? 'Placing Order...' : '🛒 Place Order'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs mt-2 opacity-60">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                      <Loader className="w-5 h-5 animate-spin text-primary-600" />
                    </div>
                  </div>
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                      <p className="text-sm whitespace-pre-line">{typingMessage}<span className="animate-pulse">|</span></p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ticket Form */}
              {showTicketForm && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Create Support Ticket</h4>
                    </div>
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={ticketData.category}
                      onChange={(e) => setTicketData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Account Problem">Account Problem</option>
                      <option value="Subscription Help">Subscription Help</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={ticketData.subject}
                      onChange={(e) => setTicketData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                      placeholder="Describe your issue..."
                      value={ticketData.message}
                      onChange={(e) => setTicketData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                    <button
                      onClick={handleCreateTicket}
                      disabled={isLoading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Ticket'}
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end space-x-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
