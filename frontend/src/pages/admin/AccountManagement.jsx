import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, RefreshCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { accountAPI, productAPI } from '../../utils/api';
import { formatDate, getDaysRemaining } from '../../utils/formatters';

const AccountModal = ({ title, initialValues, ottOptions, onClose, onSubmit, submitting }) => {
  const [formData, setFormData] = useState({
    platform: initialValues.platform || '',
    email: initialValues.email || '',
    password: initialValues.password || '',
    startDate: initialValues.startDate || '',
    expiryDate: initialValues.expiryDate || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">OTT Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select platform</option>
                {(ottOptions || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Starting From</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Saving...' : 'Save'}
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

const RenewModal = ({ account, onClose, onSubmit, submitting }) => {
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      startDate: today,
      expiryDate: today
    };
  });

  useEffect(() => {
    if (!account) return;
    const start = account.startDate ? new Date(account.startDate).toISOString().slice(0, 10) : '';
    const expiry = account.expiryDate ? new Date(account.expiryDate).toISOString().slice(0, 10) : '';
    setFormData({
      startDate: start || new Date().toISOString().slice(0, 10),
      expiryDate: expiry || new Date().toISOString().slice(0, 10)
    });
  }, [account]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Renew Account</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{account?.platform}</span> - {account?.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Starting From</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Renewing...' : 'Renew'}
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

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [ottOptions, setOttOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [renewingAccount, setRenewingAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pageSize = 10;

  const fetchAccounts = async () => {
    try {
      const params = platformFilter ? { platform: platformFilter } : {};
      const response = await accountAPI.getAll(params);
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchOttOptions = async () => {
    try {
      const res = await productAPI.getOTTTypes();
      const list = res.data?.ottTypes || [];
      const normalized = Array.isArray(list) ? list.filter(Boolean) : [];
      setOttOptions(normalized);
    } catch (error) {
      setOttOptions([]);
    }
  };

  useEffect(() => {
    fetchOttOptions();
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [platformFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, platformFilter]);

  const filteredAccounts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return accounts;
    return (accounts || []).filter((a) => {
      return (
        (a.platform || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q)
      );
    });
  }, [accounts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + pageSize);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await accountAPI.create(data);
      toast.success('Account created successfully');
      setShowAddModal(false);
      await fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingAccount) return;
    setSubmitting(true);
    try {
      await accountAPI.update(editingAccount._id, data);
      toast.success('Account updated successfully');
      setEditingAccount(null);
      await fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error(error.response?.data?.message || 'Failed to update account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenew = async (data) => {
    if (!renewingAccount) return;
    setSubmitting(true);
    try {
      await accountAPI.renew(renewingAccount._id, data);
      toast.success('Account renewed successfully');
      setRenewingAccount(null);
      await fetchAccounts();
    } catch (error) {
      console.error('Error renewing account:', error);
      toast.error(error.response?.data?.message || 'Failed to renew account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (accountId) => {
    const confirmed = window.confirm('Are you sure you want to delete this account? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await accountAPI.delete(accountId);
      toast.success('Account deleted successfully');
      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400">Add and manage OTT accounts</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchAccounts();
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by platform or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Platforms</option>
            {(ottOptions || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="ml-2 font-semibold dark:text-white">{filteredAccounts.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedAccounts.map((account) => {
                const daysLeft = getDaysRemaining(account.expiryDate);
                const isExpiringSoon = daysLeft <= 3;
                return (
                  <tr key={account._id}>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">{account.platform}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm dark:text-gray-300">{account.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono dark:text-gray-300">{account.password}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {formatDate(account.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {formatDate(account.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${isExpiringSoon ? 'text-red-600' : 'text-green-600'}`}>
                        {daysLeft} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setRenewingAccount(account)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Renew"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingAccount(account)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {showAddModal && (
        <AccountModal
          title="Add Account"
          initialValues={{}}
          ottOptions={ottOptions}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}

      {editingAccount && (
        <AccountModal
          title="Edit Account"
          initialValues={{
            platform: editingAccount.platform,
            email: editingAccount.email,
            password: editingAccount.password,
            startDate: new Date(editingAccount.startDate).toISOString().slice(0, 10),
            expiryDate: new Date(editingAccount.expiryDate).toISOString().slice(0, 10)
          }}
          ottOptions={ottOptions}
          onClose={() => setEditingAccount(null)}
          onSubmit={handleUpdate}
          submitting={submitting}
        />
      )}

      {renewingAccount && (
        <RenewModal
          account={renewingAccount}
          onClose={() => setRenewingAccount(null)}
          onSubmit={handleRenew}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default AccountManagement;
