import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const VendorReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Approved');
  const [comments, setComments] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/returns/vendor/all');
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

  const handleOpenReview = (ret) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status === 'Pending' ? 'Approved' : ret.status);
    setComments(ret.vendorComments || '');
    setModalOpen(true);
  };

  const handleUpdateReturn = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/returns/${selectedReturn._id}/status`, {
        status: newStatus,
        comments,
      });

      if (res.success) {
        toast.success(`Return request updated to ${newStatus}`);
        setModalOpen(false);
        fetchReturns();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="vendor" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Store Returns & Dispute Management</h1>
          <p className="text-xs text-slate-500">
            Review customer return requests, inspect delivery discrepancies, and process refunds
          </p>
        </div>

        {loading ? (
          <Loader message="Loading return requests..." />
        ) : returns.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="No Return Requests"
            description="There are currently no active return requests submitted for your products."
          />
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => (
              <div
                key={ret._id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={ret.product?.images?.[0]}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-navy-950">{ret.product?.name}</p>
                    <p className="text-xs text-slate-600">
                      Reason: <strong className="text-navy-900">{ret.reason}</strong>
                    </p>
                    {ret.detailedExplanation && (
                      <p className="text-xs text-slate-500 italic">"{ret.detailedExplanation}"</p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Customer: {ret.customer?.name} ({ret.customer?.email}) • Suborder: #{ret.vendorOrder?.subOrderNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
                  <div className="text-right">
                    <span className="text-sm font-black text-navy-950 block">
                      {formatCurrency(ret.refundAmount)}
                    </span>
                    <StatusBadge status={ret.status} type="order" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReview(ret)}
                    className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Review Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Return Review Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Review Customer Return Request"
        >
          <form onSubmit={handleUpdateReturn} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>Product: <strong>{selectedReturn?.product?.name}</strong></p>
              <p>Refund Amount: <strong>{formatCurrency(selectedReturn?.refundAmount)}</strong></p>
              <p>Reason: <strong className="text-rose-600">{selectedReturn?.reason}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Set Resolution Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              >
                <option value="Approved">Approved (Awaiting Item Return)</option>
                <option value="Item Received">Item Received & Inspected</option>
                <option value="Refund Processing">Refund Processing</option>
                <option value="Refunded">Refunded (Issue Full Credit)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Resolution Comments</label>
              <textarea
                rows={3}
                placeholder="Notes for customer on return procedure or rejection reason..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
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
                disabled={updating}
                className="px-5 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold shadow-md"
              >
                {updating ? 'Saving...' : 'Submit Decision'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default VendorReturnsPage;
