import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Store, Building, Mail, Phone, MapPin, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

const VendorRegisterPage = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    storeName: '',
    storeDescription: '',
    businessEmail: user?.email || '',
    businessPhone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankName: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // If user not signed in, register user first
      if (!isAuthenticated) {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const regRes = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'vendor',
          phone: formData.businessPhone,
        });
        localStorage.setItem('shopverse_token', regRes.token);
      }

      // Submit Vendor profile
      const vendorRes = await api.post('/vendors/register', formData);
      if (vendorRes.success) {
        await refreshUser();
        setSuccess(true);
        toast.success('Vendor application submitted successfully!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black text-navy-950 mb-2">Application Submitted!</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your vendor application for <span className="font-bold text-navy-900">{formData.storeName}</span> has been received and is currently under review by the platform administrator.
        </p>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 text-left mb-6 space-y-1">
          <p className="font-bold">What happens next?</p>
          <p>1. The Administrator inspects your business details in the Admin Console.</p>
          <p>2. Once approved, product upload and order fulfillment capabilities will unlock automatically.</p>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-sm"
          >
            Go to Vendor Portal
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-brand-orangeLight text-brand-orange rounded-xl">
              <Store size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-navy-950">Become a ShopVerse Vendor</h1>
              <p className="text-xs text-slate-500">
                Launch your digital storefront, reach verified customers, and expand your business
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Store Information */}
          <div>
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Store size={16} className="text-brand-orange" /> 1. Storefront Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  name="storeName"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Tech Retailers"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Description & Specialty</label>
                <textarea
                  name="storeDescription"
                  rows={3}
                  value={formData.storeDescription}
                  onChange={handleChange}
                  placeholder="Tell customers about the products you specialize in..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Support Email *</label>
                <input
                  type="email"
                  name="businessEmail"
                  required
                  value={formData.businessEmail}
                  onChange={handleChange}
                  placeholder="support@yourstore.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Phone Number *</label>
                <input
                  type="tel"
                  name="businessPhone"
                  required
                  value={formData.businessPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* User credentials if not signed in */}
          {!isAuthenticated && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building size={16} className="text-brand-orange" /> 2. Vendor Account Login
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Business Address */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-brand-orange" /> {isAuthenticated ? '2' : '3'}. Dispatch & Business Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Plot / Street / Building"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payout Banking Details */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-brand-orange" /> {isAuthenticated ? '3' : '4'}. Earnings Payout Account
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Account Name</label>
                <input
                  type="text"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleChange}
                  placeholder="Account Holder Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Bank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Bank Account Number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IFSC / Routing Code</label>
                <input
                  type="text"
                  name="bankIfsc"
                  value={formData.bankIfsc}
                  onChange={handleChange}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Submit Vendor Application for Review'}
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
