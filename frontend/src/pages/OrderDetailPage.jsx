import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Store,
  MapPin,
  CreditCard,
  Send,
  XCircle,
} from 'lucide-react';

// Visual 5-step primary flow
const PRIMARY_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price elsewhere');
  const [cancelling, setCancelling] = useState(false);

  // Return Modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedSubOrder, setSelectedSubOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnReason, setReturnReason] = useState('Defective or Damaged Product');
  const [returnExplanation, setReturnExplanation] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle Cancellation
  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${order._id}/cancel`, { reason: cancelReason });
      if (res.success) {
        toast.success('Order cancelled successfully');
        setCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Open Return Modal
  const handleOpenReturnModal = (subOrder, item) => {
    setSelectedSubOrder(subOrder);
    setSelectedItem(item);
    setReturnModalOpen(true);
  };

  // Submit Return
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      const res = await api.post('/returns', {
        orderId: order._id,
        vendorOrderId: selectedSubOrder._id,
        productId: selectedItem.product,
        quantity: selectedItem.quantity,
        reason: returnReason,
        detailedExplanation: returnExplanation,
      });

      if (res.success) {
        toast.success('Return request submitted to vendor');
        setReturnModalOpen(false);
        setReturnExplanation('');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading order details..." />;
  if (!order) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="text-brand-orange text-sm font-semibold mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancellable = ['Pending', 'Confirmed'].includes(order.orderStatus);
  const currentStepIndex = PRIMARY_STEPS.indexOf(order.orderStatus);
  const isSpecialStatus = ['Cancelled', 'Return Requested', 'Returned', 'Refund Processing', 'Refunded'].includes(order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-navy-950 font-mono">{order.orderNumber}</h1>
            <StatusBadge status={order.orderStatus} type="order" size="lg" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {formatDate(order.createdAt, true)} • Payment: <strong className="text-slate-800">{order.paymentMethod}</strong>
          </p>
        </div>

        {isCancellable && (
          <button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <XCircle size={15} /> Cancel Order
          </button>
        )}
      </div>

      {/* Visual Tracking Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider flex items-center gap-2">
          <Truck size={16} className="text-brand-orange" /> Real-Time Order Tracking
        </h2>

        {!isSpecialStatus ? (
          <div className="relative">
            <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-slate-100">
              <div
                style={{
                  width: `${((currentStepIndex >= 0 ? currentStepIndex : 0) / (PRIMARY_STEPS.length - 1)) * 100}%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-orange transition-all duration-500"
              />
            </div>
            <div className="grid grid-cols-5 text-center text-xs">
              {PRIMARY_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                        isCurrent
                          ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20 shadow-md'
                          : isPassed
                          ? 'bg-navy-900 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        isCurrent ? 'text-brand-orange' : isPassed ? 'text-navy-900' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
            <RotateCcw size={22} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-950">Special Workflow State: {order.orderStatus}</p>
              <p className="text-[11px] text-amber-800">
                {order.orderStatus === 'Cancelled'
                  ? `Order was cancelled. Reason: ${order.cancellationReason || 'Customer requested'}`
                  : `A return or refund request is in progress for this order.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Vendor Suborders Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-navy-950">
          Vendor Suborders & Dispatch Status ({order.subOrders?.length || 1})
        </h2>

        <div className="space-y-4">
          {(order.subOrders || []).map((subOrder) => (
            <div
              key={subOrder._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Suborder Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Store size={18} className="text-brand-orange" />
                  <div>
                    <span className="font-mono text-slate-400 block text-[10px]">SUBORDER ID</span>
                    <span className="font-bold text-navy-950">{subOrder.subOrderNumber}</span>
                  </div>
                  <div className="pl-3 border-l border-slate-200">
                    <span className="text-slate-400 block text-[10px]">FULFILLED BY</span>
                    <strong className="text-navy-950">{subOrder.vendor?.storeName || 'Merchant'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {subOrder.trackingNumber && (
                    <span className="text-[11px] text-slate-600 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      Tracking: {subOrder.trackingNumber}
                    </span>
                  )}
                  <StatusBadge status={subOrder.status} type="order" />
                </div>
              </div>

              {/* Suborder Items */}
              <div className="p-6 divide-y divide-slate-100 space-y-4">
                {subOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-navy-950 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-sm font-black text-navy-950">
                        {formatCurrency(item.subtotal)}
                      </span>

                      {/* Return button if order delivered and item not returned */}
                      {subOrder.status === 'Delivered' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReturnModal(subOrder, item)}
                          className="px-3 py-1.5 border border-slate-300 hover:border-brand-orange hover:text-brand-orange text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RotateCcw size={13} /> Request Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Financial Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
            <MapPin size={16} className="text-brand-orange" /> Delivery Address
          </h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            </p>
            <p className="text-slate-400">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
            <CreditCard size={16} className="text-brand-orange" /> Payment Summary
          </h3>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-bold text-slate-800">{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-800">
                {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Applied</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm text-navy-950">
              <span>Total Paid</span>
              <span className="text-brand-orange">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Dialog Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Order Cancellation"
      >
        <form onSubmit={handleCancelOrder} className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel order <strong className="font-mono">{order.orderNumber}</strong>?
            Any online payment will be refunded to your source payment method automatically.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for cancellation *</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            >
              <option value="Found a better price elsewhere">Found a better price elsewhere</option>
              <option value="Changed delivery address">Need to change delivery address</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Delivery delayed">Delivery date is too late</option>
              <option value="Other">Other reasons</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Request Product Return"
      >
        <form onSubmit={handleSubmitReturn} className="space-y-4">
          {selectedItem && (
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
              <img src={selectedItem.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="text-xs">
                <p className="font-bold text-navy-950">{selectedItem.name}</p>
                <p className="text-slate-500">Refund Amount: {formatCurrency(selectedItem.price * selectedItem.quantity)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Return Reason *</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            >
              <option value="Defective or Damaged Product">Defective or Damaged Product</option>
              <option value="Wrong Item Delivered">Wrong Item Delivered</option>
              <option value="Item Does Not Match Description">Item Does Not Match Description</option>
              <option value="Quality Not As Expected">Quality Not As Expected</option>
              <option value="Size or Fit Issue">Size or Fit Issue</option>
              <option value="Late Delivery">Late Delivery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Explanation</label>
            <textarea
              rows={3}
              placeholder="Describe the issue with the delivered item..."
              value={returnExplanation}
              onChange={(e) => setReturnExplanation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReturn}
              className="px-5 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold shadow-md"
            >
              {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
