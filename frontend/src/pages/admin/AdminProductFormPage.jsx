import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct, fetchProductById } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other'];

const initialForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Electronics', brand: '', stock: '',
  images: [''], isFeatured: false, isActive: true, tags: ''
};

const AdminProductFormPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit   = Boolean(id && id !== 'new');

  const [form, setForm]     = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      dispatch(fetchProductById(id)).unwrap()
        .then(product => {
          setForm({
            name:          product.name || '',
            description:   product.description || '',
            price:         product.price || '',
            originalPrice: product.originalPrice || '',
            category:      product.category || 'Electronics',
            brand:         product.brand || '',
            stock:         product.stock || '',
            images:        product.images?.length ? product.images : [''],
            isFeatured:    product.isFeatured || false,
            isActive:      product.isActive !== undefined ? product.isActive : true,
            tags:          product.tags?.join(', ') || ''
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (i, val) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm(prev => ({ ...prev, images: imgs }));
  };

  const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImageField = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.stock || !form.brand) {
      return toast.warn('Please fill all required fields');
    }
    setLoading(true);
    const payload = {
      ...form,
      price:         parseFloat(form.price),
      originalPrice: parseFloat(form.originalPrice) || parseFloat(form.price),
      stock:         parseInt(form.stock),
      images:        form.images.filter(Boolean),
      tags:          form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    try {
      if (isEdit) {
        await dispatch(updateProduct({ id, ...payload })).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="shimmer h-8 w-48 rounded" />
      <div className="shimmer h-96 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="input-field" placeholder="e.g. Apple iPhone 15 Pro" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} className="input-field resize-none" placeholder="Detailed product description..." required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand *</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                className="input-field" placeholder="e.g. Apple" required />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Selling Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange}
                className="input-field" placeholder="0" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price (₹)</label>
              <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange}
                className="input-field" placeholder="0" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange}
                className="input-field" placeholder="0" min="0" required />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Product Images</h2>
          <p className="text-xs text-gray-500">Enter image URLs (use Unsplash, Imgur, etc.)</p>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input value={img} onChange={e => handleImageChange(i, e.target.value)}
                className="input-field flex-1" placeholder="https://example.com/image.jpg" />
              {img && (
                <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
              {form.images.length > 1 && (
                <button type="button" onClick={() => removeImageField(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageField} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Another Image
          </button>
        </div>

        {/* Tags & Settings */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Tags & Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange}
              className="input-field" placeholder="smartphone, apple, 5g" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="accent-blue-600 w-4 h-4" />
              <span className="text-sm text-gray-700">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-green-600 w-4 h-4" />
              <span className="text-sm text-gray-700">Active (visible in store)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
