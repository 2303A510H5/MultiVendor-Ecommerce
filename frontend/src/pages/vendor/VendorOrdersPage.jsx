import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Update Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedSubOrder, setSelectedSubOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('Express Logistics');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/vendor/all?status=${statusFilter}&search=${searchTerm}`);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenStatusModal = (ord) => {
    setSelectedSubOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
    setShippingCarrier(ord.shippingCarrier || 'BlueDart Air');
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/orders/vendor/${selectedSubOrder._id}/status`, {
        status: newStatus,
        trackingNumber,
        shippingCarrier,
        note: statusNote,
      });

      if (res.success) {
        toast.success(`Suborder status updated to ${newStatus}`);
        setStatusModalOpen(false);
        fetchOrders();
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Incoming Vendor Orders</h1>
            <p className="text-xs text-slate-500">
              Manage order fulfillment, tracking numbers, and delivery dispatch
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by suborder number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Return Requested">Return Requested</option>
              <option value="Returned">Returned</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading vendor orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No Orders Found"
            description="You currently do not have any customer orders matching this status filter."
          />
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Suborder ID</span>
                      <span className="font-mono font-bold text-navy-950">{ord.subOrderNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Placed At</span>
                      <span className="font-bold text-slate-800">{formatDate(ord.createdAt, true)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                      <span className="font-bold text-slate-800">{ord.customer?.name} ({ord.customer?.phone || 'No phone'})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={ord.status} type="order" />
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(ord)}
                      className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Edit3 size={13} /> Update Status
                    </button>
                  </div>
                </div>

                {/* Items & Financials */}
                <div className="p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  <div className="space-y-3 flex-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-navy-950">{item.name}</p>
                          <p className="text-slate-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1.5 min-w-[16rem]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(ord.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Platform Commission ({ord.commissionRate}%):</span>
                      <span className="text-rose-600 font-bold">-{formatCurrency(ord.commissionAmount)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-sm">
                      <span className="text-navy-950">Your Net Earnings:</span>
                      <span className="text-emerald-600">{formatCurrency(ord.vendorEarnings)}</span>
                    </div>
                    {ord.trackingNumber && (
                      <p className="text-[10px] text-slate-400 pt-1 font-mono">
                        Carrier: {ord.shippingCarrier || 'Express'} • Ref: {ord.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Status Modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Status: ${selectedSubOrder?.subOrderNumber}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fulfillment Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing (Packed)</option>
                <option value="Shipped">Shipped (In Transit)</option>
                <option value="Delivered">Delivered (Handed to Customer)</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Carrier</label>
              <input
                type="text"
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                placeholder="e.g. BlueDart Air, Delhivery, FedEx"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tracking Number / AWB</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-8812938192"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Update Note</label>
              <textarea
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional customer notification note..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold shadow-md"
              >
                {updating ? 'Saving...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default VendorOrdersPage;
