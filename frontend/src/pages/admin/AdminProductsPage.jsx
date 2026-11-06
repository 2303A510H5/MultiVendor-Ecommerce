import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Package, Trash2, Search, Store } from 'lucide-react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?keyword=${searchTerm}&limit=50`);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await api.put(`/products/${p._id}`, { isActive: !p.isActive });
      toast.success(`Product ${!p.isActive ? 'Activated' : 'Deactivated'}`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Platform Products Catalog</h1>
          <p className="text-xs text-slate-500">
            Monitor all vendor listings, enforce compliance, and inspect stock distribution
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </form>
          <span className="text-xs text-slate-500 font-bold">Total: {products.length} products</span>
        </div>

        {loading ? (
          <Loader message="Loading products..." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4">Product</th>
                    <th className="p-4">Vendor Store</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Sold</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-navy-950 line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-navy-950">
                        {p.vendor?.storeName || 'Merchant'}
                      </td>
                      <td className="p-4">{p.category?.name || 'General'}</td>
                      <td className="p-4 font-bold">{formatCurrency(p.discountPrice || p.price)}</td>
                      <td className="p-4">{p.stock} units</td>
                      <td className="p-4 font-black">{p.unitsSold || 0}</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
