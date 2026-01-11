import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Save, Video } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { tutorialAPI } from '../../utils/api';

const TutorialManagement = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    description: '',
    order: 0,
    isActive: true
  });

  const sortedTutorials = useMemo(() => {
    return [...tutorials].sort((a, b) => {
      const ao = Number(a.order || 0);
      const bo = Number(b.order || 0);
      if (ao !== bo) return ao - bo;
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
  }, [tutorials]);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const response = await tutorialAPI.getAll({ includeInactive: true });
      setTutorials(response.data.tutorials || []);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      toast.error('Failed to fetch tutorials');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTutorial(null);
    setFormData({ title: '', youtubeUrl: '', description: '', order: 0, isActive: true });
    setShowModal(true);
  };

  const openEdit = (tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title || '',
      youtubeUrl: tutorial.youtubeUrl || '',
      description: tutorial.description || '',
      order: Number.isFinite(Number(tutorial.order)) ? Number(tutorial.order) : 0,
      isActive: typeof tutorial.isActive === 'boolean' ? tutorial.isActive : true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTutorial(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
        toast.error('Title and YouTube Link are required');
        return;
      }

      if (editingTutorial) {
        await tutorialAPI.update(editingTutorial._id, formData);
        toast.success('Tutorial updated');
      } else {
        await tutorialAPI.create(formData);
        toast.success('Tutorial created');
      }

      closeModal();
      setLoading(true);
      await fetchTutorials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tutorial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tutorialId) => {
    const ok = window.confirm('Delete this tutorial?');
    if (!ok) return;

    try {
      await tutorialAPI.delete(tutorialId);
      toast.success('Tutorial deleted');
      setTutorials((prev) => prev.filter((t) => t._id !== tutorialId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tutorial');
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Tutorial Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Add and edit tutorials shown on the website</p>
        </div>

        <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Tutorial
        </button>
      </div>

      <div className="card">
        {sortedTutorials.length === 0 ? (
          <div className="py-10 text-center text-gray-600 dark:text-gray-400">No tutorials yet.</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTutorials.map((tutorial) => (
              <div key={tutorial._id} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold dark:text-white break-words">{tutorial.title}</h3>
                    {!tutorial.isActive && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">{tutorial.youtubeUrl}</p>
                  {tutorial.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">{tutorial.description}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Order: {Number.isFinite(Number(tutorial.order)) ? Number(tutorial.order) : 0}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(tutorial)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tutorial._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">{editingTutorial ? 'Edit Tutorial' : 'Add Tutorial'}</h2>
              <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="Enter tutorial title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">YouTube Link</label>
                <input
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, youtubeUrl: e.target.value }))}
                  className="input-field"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="input-field min-h-[120px]"
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((p) => ({ ...p, order: Number(e.target.value) }))}
                    className="input-field"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 pt-6">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={Boolean(formData.isActive)}
                    onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium dark:text-white">
                    Visible on website
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary inline-flex items-center">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button type="submit" className="btn-primary inline-flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialManagement;
