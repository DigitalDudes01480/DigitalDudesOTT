import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Clock, CheckCircle, AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { ticketAPI } from '../utils/api';
import { formatDate, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await ticketAPI.getMyTickets(params);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold dark:text-white mb-2">Support Tickets</h1>
              <p className="text-gray-600 dark:text-gray-400">Get help from our support team</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex space-x-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No tickets found</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold dark:text-white">{ticket.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ticket #{ticket.ticketNumber} • {ticket.category}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {ticket.messages[0]?.message.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(ticket.createdAt)}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{ticket.messages.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTickets();
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}
    </div>
  );
};

const CreateTicketModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'other',
    priority: 'medium',
    message: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('message', formData.message);
      
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await ticketAPI.create(formDataToSend);
      toast.success('Ticket created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Create Support Ticket</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="subscription">Subscription</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field"
                rows="6"
                placeholder="Describe your issue in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Attach Images (Optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="ticket-images"
              />
              <label
                htmlFor="ticket-images"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload images (Max 5, 5MB each)
                  </p>
                </div>
              </label>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button type="submit" disabled={loading} className="flex-1 btn-primary">
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
              <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TicketDetailModal = ({ ticket, onClose, onUpdate }) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh ticket messages every 3 seconds
  useEffect(() => {
    const refreshTicket = async () => {
      if (isRefreshing) return;
      
      try {
        setIsRefreshing(true);
        const response = await ticketAPI.getById(ticket._id);
        setCurrentTicket(response.data.ticket);
      } catch (error) {
        console.error('Error refreshing ticket:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Initial load
    refreshTicket();

    // Set up polling interval
    const intervalId = setInterval(refreshTicket, 3000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [ticket._id, isRefreshing]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('message', message);
      
      images.forEach((image) => {
        formData.append('images', image);
      });

      await ticketAPI.addMessage(ticket._id, formData);
      toast.success('Message sent');
      setMessage('');
      setImages([]);
      
      // Refresh ticket immediately after sending
      const response = await ticketAPI.getById(ticket._id);
      setCurrentTicket(response.data.ticket);
      onUpdate();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold dark:text-white mb-2">{currentTicket.subject}</h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Ticket #{currentTicket.ticketNumber}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(currentTicket.status)}`}>
                  {currentTicket.status}
                </span>
                <span className="text-sm text-gray-500">{currentTicket.category}</span>
                <span className="text-xs text-green-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Live
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto" id="messages-container">
            {currentTicket.messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  msg.senderRole === 'admin'
                    ? 'bg-primary-50 dark:bg-primary-900/20 ml-8'
                    : 'bg-gray-50 dark:bg-gray-700 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold dark:text-white">
                    {msg.senderRole === 'admin' ? '🛡️ Support Team' : '👤 You'}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                </div>
                <p className="text-sm dark:text-gray-300">{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {msg.attachments.map((attachment, idx) => (
                      <img
                        key={idx}
                        src={`data:${attachment.contentType};base64,${attachment.data}`}
                        alt={attachment.filename}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                        onClick={() => window.open(`data:${attachment.contentType};base64,${attachment.data}`, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentTicket.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Type your message..."
                required
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="reply-images"
                />
                <label
                  htmlFor="reply-images"
                  className="flex items-center justify-center w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition"
                >
                  <ImageIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Attach Images</span>
                </label>
                {images.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
