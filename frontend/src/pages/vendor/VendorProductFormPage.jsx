import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import {
  Package,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Image,
} from 'lucide-react';

const VendorProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    lowStockThreshold: '10',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
    tags: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/categories');
        if (catRes.success) {
          setCategories(catRes.categories || []);
          if (!isEditing && catRes.categories?.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.categories[0]._id }));
          }
        }

        if (isEditing) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.success && prodRes.product) {
            const p = prodRes.product;
            setFormData({
              name: p.name,
              description: p.description,
              category: p.category?._id || p.category,
              price: p.price.toString(),
              discountPrice: p.discountPrice ? p.discountPrice.toString() : '',
              stock: p.stock.toString(),
              lowStockThreshold: p.lowStockThreshold ? p.lowStockThreshold.toString() : '10',
              images: p.images?.length > 0 ? p.images : [''],
              tags: p.tags?.join(', ') || '',
              isFeatured: Boolean(p.isFeatured),
              isActive: Boolean(p.isActive),
            });
          }
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length === 1) {
      toast.error('At least one product image is required');
      return;
    }
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || formData.stock === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    const validImages = formData.images.filter((url) => url.trim().length > 0);
    if (validImages.length === 0) {
      toast.error('Please provide at least one valid image URL');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
        images: validImages,
      };

      if (isEditing) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading product form..." />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="vendor" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              to="/vendor/products"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-navy-950">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Update specifications, pricing and inventory levels' : 'Publish a new item to your storefront'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: General Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">General Information</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe features, material specifications, box contents..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="wireless, audio, bluetooth"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Regular Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  min={0}
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="2999"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  min={0}
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="2499 (optional)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min={0}
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  min={1}
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Image URLs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Image size={14} /> Product Images (URLs)
              </h3>
              <button
                type="button"
                onClick={handleAddImage}
                className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Another Image
              </button>
            </div>

            <div className="space-y-3">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                    {imgUrl ? (
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">#</div>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imgUrl}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Switches */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange w-4 h-4"
              />
              <span>Publish Product Immediately (Active)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange w-4 h-4"
              />
              <span>Feature on Marketplace Home</span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to="/vendor/products"
              className="px-6 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default VendorProductFormPage;
