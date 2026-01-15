import { useState, useEffect } from 'react';
import { MessageCircle, Search, Eye, X } from 'lucide-react';
import { ticketAPI } from '../../utils/api';
import { formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchTickets = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await ticketAPI.getAll(params);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + pageSize);

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
        <h1 className="text-3xl font-bold dark:text-white">Ticket Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage customer support tickets</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
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
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono dark:text-gray-300">
                    {ticket.ticketNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium dark:text-white">{ticket.user?.name}</p>
                      <p className="text-sm text-gray-500">{ticket.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 dark:text-gray-300">
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">{ticket.category}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                    {ticket.messages.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View & Reply"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

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

const TicketDetailModal = ({ ticket, onClose, onUpdate }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
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
        // Update status and priority if changed
        setStatus(response.data.ticket.status);
        setPriority(response.data.ticket.priority);
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await ticketAPI.addMessage(ticket._id, { message });
      toast.success('Message sent');
      setMessage('');
      
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

  const handleUpdateStatus = async () => {
    try {
      await ticketAPI.updateStatus(ticket._id, { status, priority });
      toast.success('Ticket updated');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update ticket');
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
                <span className="text-sm text-gray-500">{currentTicket.user?.name}</span>
                <span className="text-xs text-green-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Live
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <button onClick={handleUpdateStatus} className="btn-secondary mb-6 w-full">
            Update Status & Priority
          </button>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto" id="admin-messages-container">
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
                    {msg.senderRole === 'admin' ? '🛡️ Support Team' : `👤 ${currentTicket.user?.name}`}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                </div>
                <p className="text-sm dark:text-gray-300">{msg.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field"
              rows="3"
              placeholder="Type your reply..."
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reply'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;
