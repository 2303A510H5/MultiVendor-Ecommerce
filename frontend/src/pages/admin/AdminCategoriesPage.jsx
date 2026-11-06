import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        description: cat.description || '',
        image: cat.image || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Marketplace Categories</h1>
            <p className="text-xs text-slate-500">
              Create, organize, and manage global product taxonomy and banners
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        {loading ? (
          <Loader message="Loading categories..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 bg-slate-100 overflow-hidden relative">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="text-sm font-extrabold text-navy-950">{cat.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{cat.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Slug: {cat.slug}</p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(cat)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Create Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold shadow-md"
              >
                {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminCategoriesPage;
