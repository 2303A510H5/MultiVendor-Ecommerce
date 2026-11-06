import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/vendor/my-products');
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

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/products/${productToDelete._id}`);
      if (res.success) {
        toast.success('Product deleted successfully');
        setDeleteModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const res = await api.put(`/products/${product._id}`, {
        isActive: !product.isActive,
      });
      if (res.success) {
        toast.success(`Product marked as ${!product.isActive ? 'Active' : 'Inactive'}`);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="vendor" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Store Product Catalog</h1>
            <p className="text-xs text-slate-500">
              Manage inventory, pricing, discounts, and product status
            </p>
          </div>

          <Link
            to="/vendor/products/new"
            className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} /> Add New Product
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Total: {products.length} product{products.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <Loader message="Loading store catalog..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="You haven't added any products to your catalog matching the search query."
            actionText="Add Product"
            actionLink="/vendor/products/new"
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price / Discount</th>
                    <th className="p-4">Available Stock</th>
                    <th className="p-4">Sold Units</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stock > 0 && p.stock <= (p.lowStockThreshold || 10);
                    const isOutOfStock = p.stock === 0;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0]}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-navy-950 line-clamp-1">{p.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-600">
                          {p.category?.name || 'Uncategorized'}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-navy-950">
                            {formatCurrency(p.discountPrice > 0 ? p.discountPrice : p.price)}
                          </span>
                          {p.discountPrice > 0 && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              {formatCurrency(p.price)}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[11px] ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {isOutOfStock ? (
                              'Out of Stock'
                            ) : (
                              <>
                                {isLowStock && <AlertTriangle size={11} />}
                                {p.stock} units
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-navy-950">
                          {p.unitsSold || 0}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/vendor/products/${p._id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                              title="Edit product"
                            >
                              <Edit size={15} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setProductToDelete(p);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Product Deletion"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="text-navy-950">{productToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default VendorProductsPage;
