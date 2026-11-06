import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Store, Check, X, ShieldAlert, Search, Filter } from 'lucide-react';

const AdminVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Approve Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [vendorToApprove, setVendorToApprove] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);
  const [approving, setApproving] = useState(false);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [vendorToReject, setVendorToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      let url = '/vendors';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (searchTerm) params.push(`search=${searchTerm}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res.success) {
        setVendors(res.vendors || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setApproving(true);
    try {
      const res = await api.put(`/vendors/${vendorToApprove._id}/approve`, {
        commissionRate: Number(commissionRate),
      });
      if (res.success) {
        toast.success(`Vendor '${vendorToApprove.storeName}' approved!`);
        setApproveModalOpen(false);
        fetchVendors();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setRejecting(true);
    try {
      const res = await api.put(`/vendors/${vendorToReject._id}/reject`, {
        reason: rejectionReason,
      });
      if (res.success) {
        toast.success(`Vendor '${vendorToReject.storeName}' rejected`);
        setRejectModalOpen(false);
        fetchVendors();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRejecting(false);
    }
  };

  const handleToggleStatus = async (vendor) => {
    try {
      const res = await api.put(`/vendors/${vendor._id}/toggle-status`);
      if (res.success) {
        toast.success(res.message);
        fetchVendors();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Vendor Accounts & Store Approvals</h1>
          <p className="text-xs text-slate-500">
            Review onboarding submissions, configure platform commissions, and manage active merchants
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search store name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">All Vendors</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved & Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading vendor accounts..." />
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No Vendors Found"
            description="No vendor accounts match your specified criteria."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4">Storefront</th>
                    <th className="p-4">Owner Contact</th>
                    <th className="p-4">Commission %</th>
                    <th className="p-4">Gross Sales</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vendors.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.storeLogo}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-navy-950 text-sm">{v.storeName}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{v.storeDescription}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{v.user?.name}</p>
                        <p className="text-slate-400">{v.businessEmail}</p>
                        <p className="text-slate-400">{v.businessPhone}</p>
                      </td>
                      <td className="p-4 font-black text-navy-950 text-sm">
                        {v.commissionRate}%
                      </td>
                      <td className="p-4">
                        <span className="font-black text-navy-950">{formatCurrency(v.totalSales || 0)}</span>
                        <span className="block text-[10px] text-slate-400">{v.totalOrders || 0} orders</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={v.status} type="vendor" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {v.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setVendorToApprove(v);
                                  setCommissionRate(v.commissionRate || 10);
                                  setApproveModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVendorToReject(v);
                                  setRejectionReason('');
                                  setRejectModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <X size={13} /> Reject
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(v)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                                v.status === 'approved'
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {v.status === 'approved' ? 'Suspend Store' : 'Reactivate Store'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title={`Approve Vendor: ${vendorToApprove?.storeName}`}
        >
          <form onSubmit={handleApprove} className="space-y-4">
            <p className="text-xs text-slate-600">
              Approving this merchant will unlock their product upload, order notifications, and storefront catalog visibility immediately.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Commission Rate (%) *
              </label>
              <input
                type="number"
                min={0}
                max={50}
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Standard platform commission is typically 10%.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md"
              >
                {approving ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Rejection Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Vendor Application: ${vendorToReject?.storeName}`}
        >
          <form onSubmit={handleReject} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain why the vendor application does not meet guidelines..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejecting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminVendorsPage;
