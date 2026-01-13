import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { productAPI, categoryAPI } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({});
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.ottType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your OTT subscription products</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">OTT Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={
                          product.imageData?.data 
                            ? `data:${product.imageData.contentType};base64,${product.imageData.data}`
                            : product.image?.startsWith('/uploads') 
                              ? `http://localhost:5001${product.image}` 
                              : (product.image || 'https://via.placeholder.com/50')
                        }
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.profileTypes?.length || 0} Profile Type(s)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{product.ottType}</td>
                  <td className="px-6 py-4 dark:text-gray-300">
                    {product.profileTypes?.map((pt, i) => (
                      <div key={i} className="text-sm">
                        {pt.name}: {pt.pricingOptions?.length || 0} option(s)
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium dark:text-white">
                    {formatCurrency(product.minPrice || 0)}
                    <span className="text-xs text-gray-500 block">Starting from</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    ottType: '',
    description: '',
    features: [],
    image: '',
    status: 'active',
    stockQuantity: 0,
    category: '',
    profileTypes: [{
      name: 'Shared',
      description: '',
      screenCount: 1,
      quality: 'HD',
      accountType: 'shared',
      requiresOwnAccount: false,
      pricingOptions: [{
        duration: { value: 1, unit: 'month' },
        price: ''
      }]
    }]
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll({ isActive: 'true' });
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      console.log('Loading product for edit:', product);
      console.log('Product profile types:', product.profileTypes);
      
      // Ensure all profile types have accountType and requiresOwnAccount fields
      const profileTypesWithDefaults = product.profileTypes?.map(profile => ({
        ...profile,
        accountType: profile.accountType || 'own',
        requiresOwnAccount: profile.requiresOwnAccount ?? false
      })) || [];

      console.log('Profile types with defaults:', profileTypesWithDefaults);

      const newFormData = {
        ...product,
        category: product.category?._id || product.category || '',
        profileTypes: profileTypesWithDefaults
      };
      
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
    }
  }, [product]);

  const handleOttPlatformChange = (value) => {
    setFormData({
      ...formData,
      ottType: value,
      name: value
    });
  };

  const addProfileType = () => {
    setFormData({
      ...formData,
      profileTypes: [
        ...formData.profileTypes,
        {
          name: '',
          description: '',
          screenCount: 1,
          quality: 'HD',
          accountType: 'own',
          requiresOwnAccount: false,
          pricingOptions: [{
            duration: { value: 1, unit: 'month' },
            price: '',
            originalPrice: ''
          }]
        }
      ]
    });
  };

  const removeProfileType = (index) => {
    setFormData(prevFormData => {
      const newProfileTypes = prevFormData.profileTypes.filter((_, i) => i !== index);
      return { ...prevFormData, profileTypes: newProfileTypes };
    });
  };

  const updateProfileType = (index, field, value) => {
    console.log('Updating profile type:', { index, field, value });
    setFormData(prevFormData => {
      const newProfileTypes = [...prevFormData.profileTypes];
      newProfileTypes[index] = {
        ...newProfileTypes[index],
        [field]: value
      };
      console.log('Updated profile:', newProfileTypes[index]);
      return { ...prevFormData, profileTypes: newProfileTypes };
    });
  };

  const addPricingOption = (profileIndex) => {
    setFormData(prevFormData => {
      const newProfileTypes = [...prevFormData.profileTypes];
      newProfileTypes[profileIndex].pricingOptions.push({
        duration: { value: 1, unit: 'month' },
        price: ''
      });
      return { ...prevFormData, profileTypes: newProfileTypes };
    });
  };

  const removePricingOption = (profileIndex, optionIndex) => {
    setFormData(prevFormData => {
      const newProfileTypes = [...prevFormData.profileTypes];
      newProfileTypes[profileIndex].pricingOptions = newProfileTypes[profileIndex].pricingOptions.filter((_, i) => i !== optionIndex);
      return { ...prevFormData, profileTypes: newProfileTypes };
    });
  };

  const updatePricingOption = (profileIndex, optionIndex, field, value) => {
    setFormData(prevFormData => {
      const newProfileTypes = [...prevFormData.profileTypes];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newProfileTypes[profileIndex].pricingOptions[optionIndex][parent][child] = value;
      } else {
        newProfileTypes[profileIndex].pricingOptions[optionIndex][field] = value;
      }
      return { ...prevFormData, profileTypes: newProfileTypes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('name', formData.name);
      submitData.append('ottType', formData.ottType);
      submitData.append('description', formData.description);
      submitData.append('status', formData.status);
      submitData.append('stockQuantity', formData.stockQuantity);
      
      // Add category if selected
      if (formData.category) {
        submitData.append('category', formData.category);
      }
      
      submitData.append('profileTypes', JSON.stringify(formData.profileTypes));
      
      // Add image URL if provided
      if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      } else if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      } else if (formData.image && typeof formData.image === 'string' && !formData.image.startsWith('blob:')) {
        // Keep existing image URL for updates
        submitData.append('existingImage', formData.image);
      }

      if (product) {
        await productAPI.update(product._id, submitData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(submitData);
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">OTT Platform</label>
              <select
                value={formData.ottType}
                onChange={(e) => handleOttPlatformChange(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select OTT Platform</option>
                <option value="Netflix">Netflix</option>
                <option value="Prime Video">Prime Video</option>
                <option value="Disney+">Disney+</option>
                <option value="Spotify">Spotify</option>
                <option value="YouTube Premium">YouTube Premium</option>
                <option value="HBO Max">HBO Max</option>
                <option value="Apple TV+">Apple TV+</option>
                <option value="Hulu">Hulu</option>
                <option value="Paramount+">Paramount+</option>
                <option value="Apple Music">Apple Music</option>
                <option value="Zee5">Zee5</option>
                <option value="SonyLIV">SonyLIV</option>
                <option value="Voot">Voot</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Image size should be less than 5MB');
                      return;
                    }
                    setFormData({ 
                      ...formData, 
                      imageFile: file,
                      image: URL.createObjectURL(file)
                    });
                  }
                }}
                className="input-field"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload an image file (Max 5MB, JPG/PNG)
              </p>
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250?text=Invalid+Image';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold dark:text-white">Profile Types</h3>
                <button
                  type="button"
                  onClick={addProfileType}
                  className="btn-primary text-sm py-1 px-3"
                >
                  + Add Profile Type
                </button>
              </div>

              {formData.profileTypes.map((profile, profileIndex) => (
                <div key={profileIndex} className="mb-6 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold dark:text-white">Profile Type #{profileIndex + 1}</h4>
                    {formData.profileTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProfileType(profileIndex)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">Profile Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => updateProfileType(profileIndex, 'name', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Shared, Private"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">Screen Count</label>
                      <input
                        type="number"
                        value={profile.screenCount}
                        onChange={(e) => updateProfileType(profileIndex, 'screenCount', parseInt(e.target.value))}
                        className="input-field"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">Quality</label>
                      <select
                        value={profile.quality}
                        onChange={(e) => updateProfileType(profileIndex, 'quality', e.target.value)}
                        className="input-field"
                      >
                        <option value="SD">SD</option>
                        <option value="HD">HD</option>
                        <option value="FHD">FHD</option>
                        <option value="4K">4K</option>
                        <option value="UHD">UHD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description (Optional)</label>
                      <input
                        type="text"
                        value={profile.description}
                        onChange={(e) => updateProfileType(profileIndex, 'description', e.target.value)}
                        className="input-field"
                        placeholder="Profile description"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`account-type-${profileIndex}`}
                          checked={profile.accountType === 'own'}
                          onChange={() => updateProfileType(profileIndex, 'accountType', 'own')}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium dark:text-gray-300">
                          Own Account
                          {profile.accountType === 'own' && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">✓ Selected</span>
                          )}
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`account-type-${profileIndex}`}
                          checked={profile.accountType === 'private'}
                          onChange={() => updateProfileType(profileIndex, 'accountType', 'private')}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium dark:text-gray-300">
                          Private Profile
                          {profile.accountType === 'private' && (
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">✓ Selected</span>
                          )}
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`account-type-${profileIndex}`}
                          checked={profile.accountType === 'shared'}
                          onChange={() => updateProfileType(profileIndex, 'accountType', 'shared')}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium dark:text-gray-300">
                          Shared Profile
                          {profile.accountType === 'shared' && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">✓ Selected</span>
                          )}
                        </span>
                      </label>
                    </div>
                    {profile.accountType === 'private' && (
                      <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-xs text-purple-700 dark:text-purple-300">
                        <strong>Private Profile:</strong> Customers will receive direct password access for this profile type.
                      </div>
                    )}
                    {profile.accountType === 'shared' && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                        <strong>Shared Profile:</strong> Customers will receive access codes instead of passwords for this profile type.
                      </div>
                    )}
                  </div>

                  <div className="border-t dark:border-gray-600 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium dark:text-gray-300">Pricing Options</label>
                      <button
                        type="button"
                        onClick={() => addPricingOption(profileIndex)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        + Add Duration
                      </button>
                    </div>

                    {profile.pricingOptions.map((option, optionIndex) => (
                      <div key={optionIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-white dark:bg-gray-800 rounded">
                        <div>
                          <label className="block text-xs mb-1 dark:text-gray-400">Duration</label>
                          <input
                            type="number"
                            value={option.duration.value}
                            onChange={(e) => updatePricingOption(profileIndex, optionIndex, 'duration.value', parseFloat(e.target.value))}
                            className="input-field text-sm"
                            min="0.5"
                            step="0.5"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1 dark:text-gray-400">Unit</label>
                          <select
                            value={option.duration.unit}
                            onChange={(e) => updatePricingOption(profileIndex, optionIndex, 'duration.unit', e.target.value)}
                            className="input-field text-sm"
                          >
                            <option value="days">Days</option>
                            <option value="month">Month</option>
                            <option value="months">Months</option>
                            <option value="year">Year</option>
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs mb-1 dark:text-gray-400">Price (₹)</label>
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) => updatePricingOption(profileIndex, optionIndex, 'price', parseFloat(e.target.value))}
                              className="input-field text-sm"
                              step="1"
                              required
                            />
                          </div>
                          {profile.pricingOptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePricingOption(profileIndex, optionIndex)}
                              className="p-2 text-red-600 hover:text-red-700"
                              title="Remove"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
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

export default ProductManagement;
