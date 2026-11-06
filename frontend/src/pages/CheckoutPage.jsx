import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import PaymentModal from '../components/common/PaymentModal';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Tag,
  Store,
  ArrowRight,
} from 'lucide-react';

const CheckoutPage = () => {
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'Home',
    isDefault: false,
  });

  // Payment & Coupon
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Sandbox Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const res = await api.get('/users/addresses');
        if (res.success && res.addresses) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        }
      } catch (err) {
        console.error('Addresses fetch error:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, navigate]);

  // Apply Coupon
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'WELCOME10') {
      const discount = Math.min(Math.round(cart.subtotal * 0.1), 500);
      setDiscountAmount(discount);
      setAppliedCoupon('WELCOME10');
      toast.success(`Coupon WELCOME10 applied! You save ${formatCurrency(discount)}`);
    } else {
      toast.error('Invalid coupon code. Try WELCOME10');
    }
  };

  // Add New Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', newAddress);
      if (res.success) {
        toast.success('Address saved');
        setAddresses([res.address, ...addresses]);
        setSelectedAddressId(res.address._id);
        setAddressModalOpen(false);
        setNewAddress({
          fullName: user?.name || '',
          phone: user?.phone || '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          addressType: 'Home',
          isDefault: false,
        });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const finalTotal = Math.max(0, cart.subtotal + cart.shippingFee - discountAmount);

  // Proceed with order
  const handleOrderInitiation = () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }

    if (paymentMethod === 'Razorpay') {
      setPaymentModalOpen(true);
    } else {
      // Cash on Delivery
      executeOrderCreation('Cash on Delivery');
    }
  };

  // Final Order Creation Handler
  const executeOrderCreation = async (method, paymentResultData = null) => {
    setPlacingOrder(true);
    try {
      const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
      if (!selectedAddr) throw new Error('Selected delivery address not found');

      const payload = {
        shippingAddress: {
          fullName: selectedAddr.fullName,
          phone: selectedAddr.phone,
          street: selectedAddr.street,
          city: selectedAddr.city,
          state: selectedAddr.state,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
        },
        paymentMethod: method,
        couponCode: appliedCoupon,
      };

      const res = await api.post('/orders', payload);
      if (res.success) {
        // If payment modal verification returned signature
        if (paymentResultData && res.order) {
          try {
            await api.post('/payments/verify', {
              ...paymentResultData,
              orderId: res.order._id,
            });
          } catch (e) {
            console.warn('Payment verify notice:', e.message);
          }
        }

        await refreshCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${res.order._id}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacingOrder(false);
      setPaymentModalOpen(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <Link to="/products" className="text-brand-orange text-sm font-semibold mt-2 inline-block">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-black text-navy-950">Multi-Vendor Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Addresses & Payment Methods */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                <MapPin size={18} className="text-brand-orange" /> 1. Select Delivery Address
              </h2>
              <button
                type="button"
                onClick={() => setAddressModalOpen(true)}
                className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add New Address
              </button>
            </div>

            {loadingAddresses ? (
              <Loader message="Loading addresses..." />
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500 mb-3">No delivery address saved yet</p>
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(true)}
                  className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
                >
                  Add Your Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedAddressId === addr._id
                        ? 'border-brand-orange bg-orange-50/40 ring-1 ring-brand-orange'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1 text-brand-orange focus:ring-brand-orange"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-navy-950">{addr.fullName}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {addr.addressType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Phone: {addr.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Options */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard size={18} className="text-brand-orange" /> 2. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Razorpay Sandbox Option */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'Razorpay'
                    ? 'border-brand-orange bg-orange-50/40 ring-1 ring-brand-orange'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="text-brand-orange focus:ring-brand-orange"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-950">Razorpay Test Mode / Sandbox</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        Interactive Simulation
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pay safely via Card, UPI, or Netbanking in sandbox mode.
                    </p>
                  </div>
                </div>
                <CreditCard size={22} className="text-navy-900" />
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-brand-orange bg-orange-50/40 ring-1 ring-brand-orange'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="text-brand-orange focus:ring-brand-orange"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy-950">Cash on Delivery (COD)</span>
                    <p className="text-xs text-slate-500 mt-0.5">Pay in cash when package arrives at your doorstep</p>
                  </div>
                </div>
                <Banknote size={22} className="text-emerald-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & Final CTA */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-5">
            <h2 className="text-base font-black text-navy-950 pb-3 border-b border-slate-100">
              Items to be Ordered ({cart.itemsCount})
            </h2>

            {/* Compact Item List */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
              {cart.items.map((item) => {
                const prod = item.product;
                const price = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                return (
                  <div key={prod._id} className="flex items-center gap-3 text-xs">
                    <img
                      src={prod.images?.[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-navy-950">
                      {formatCurrency(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Tag size={12} className="text-brand-orange" /> Promotional Coupon
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {cart.shippingFee === 0 ? 'FREE' : formatCurrency(cart.shippingFee)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-navy-950">Amount Payable</span>
              <span className="text-2xl font-black text-brand-orange">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <button
              type="button"
              disabled={placingOrder || !selectedAddressId}
              onClick={handleOrderInitiation}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {placingOrder ? 'Confirming Order...' : `Pay & Place Order (${formatCurrency(finalTotal)})`}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Sandbox Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amount={finalTotal}
        onPaymentSuccess={(data) => executeOrderCreation('Razorpay', data)}
        onPaymentFailure={(msg) => toast.error(msg)}
      />

      {/* Add New Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Delivery Address"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="House/Flat number, building, street"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code *</label>
              <input
                type="text"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-orange text-white rounded-lg text-xs font-bold shadow-md"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
