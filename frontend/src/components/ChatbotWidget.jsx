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
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({ category: '', subject: '', message: '' });
  const messagesEndRef = useRef(null);
  const { isAuthenticated, user } = useAuthStore();

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

    if (!isAuthenticated) {
      toast.error('Please login to use the chatbot');
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
      const response = await chatbotAPI.chat({ message: inputMessage });
      
      // Validate response structure
      if (!response || !response.data || !response.data.response) {
        throw new Error('Invalid response structure from server');
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.data.response.message || 'I received your message but had trouble responding. Please try again.',
        suggestions: response.data.response.suggestions || ['Try again', 'Create ticket'],
        responseType: response.data.response.type || 'default',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // If response suggests creating a ticket, show ticket form
      if (response.data.response.type === 'ticket_prompt') {
        setShowTicketForm(true);
      }
    } catch (error) {
      console.error('Chat error:', error.message);
      
      let errorMsg = 'Sorry, I encountered an error. Please try again or create a support ticket.';
      
      if (error.response?.status === 401) {
        errorMsg = 'Your session has expired. Please refresh the page and log in again.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Our team has been notified. Please try again later or create a support ticket.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Network error. Please check your internet connection and try again.';
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: errorMsg,
        suggestions: ['Create ticket', 'Try again'],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
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
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors font-medium"
                            >
                              {suggestion}
                            </button>
                          ))}
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
