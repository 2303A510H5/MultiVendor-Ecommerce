import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { RotateCcw, Check, X, ShieldAlert } from 'lucide-react';

const AdminReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolution Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Refunded');
  const [adminComments, setAdminComments] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/returns/admin/all');
      if (res.success) {
        setReturns(res.returns || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenResolution = (ret) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status === 'Pending' ? 'Refunded' : ret.status);
    setAdminComments(ret.adminComments || '');
    setModalOpen(true);
  };

  const handleResolveReturn = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await api.put(`/returns/${selectedReturn._id}/status`, {
        status: newStatus,
        comments: adminComments,
      });

      if (res.success) {
        toast.success(`Dispute updated to ${newStatus}`);
        setModalOpen(false);
        fetchReturns();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Returns, Refunds & Dispute Escalation</h1>
          <p className="text-xs text-slate-500">
            Platform oversight of customer return claims, vendor resolution, and refund disbursement
          </p>
        </div>

        {loading ? (
          <Loader message="Loading returns & refund records..." />
        ) : returns.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="No Returns or Disputes"
            description="There are currently no return requests or refund claims logged on the platform."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4">Product & Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Refund Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {returns.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={r.product?.images?.[0]}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-navy-950 line-clamp-1">{r.product?.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{r.order?.orderNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{r.customer?.name}</p>
                        <p className="text-[10px] text-slate-400">{r.customer?.email}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {r.vendor?.storeName}
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="font-bold block text-navy-950">{r.reason}</span>
                        {r.detailedExplanation && (
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {r.detailedExplanation}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-black text-navy-950 text-sm">
                        {formatCurrency(r.refundAmount)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={r.status} type="order" />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenResolution(r)}
                          className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dispute Resolution Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Resolve Return / Refund Request"
        >
          <form onSubmit={handleResolveReturn} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>Product: <strong>{selectedReturn?.product?.name}</strong></p>
              <p>Refund Amount: <strong className="text-navy-950">{formatCurrency(selectedReturn?.refundAmount)}</strong></p>
              <p>Vendor: <strong>{selectedReturn?.vendor?.storeName}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Set Resolution *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              >
                <option value="Refunded">Refunded (Issue Sandbox Refund)</option>
                <option value="Refund Processing">Refund Processing</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Resolution Comments</label>
              <textarea
                rows={3}
                placeholder="Dispute resolution findings and justification..."
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
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
                disabled={processing}
                className="px-5 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold shadow-md"
              >
                {processing ? 'Processing...' : 'Execute Resolution'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminReturnsPage;
