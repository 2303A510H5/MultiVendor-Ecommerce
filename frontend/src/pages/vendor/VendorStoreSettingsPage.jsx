import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { Store, Save, Building, CreditCard, MapPin } from 'lucide-react';

const VendorStoreSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeLogo: '',
    storeBanner: '',
    businessEmail: '',
    businessPhone: '',
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

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const res = await api.get('/vendors/me/profile');
        if (res.success && res.vendor) {
          const v = res.vendor;
          setFormData({
            storeName: v.storeName || '',
            storeDescription: v.storeDescription || '',
            storeLogo: v.storeLogo || '',
            storeBanner: v.storeBanner || '',
            businessEmail: v.businessEmail || '',
            businessPhone: v.businessPhone || '',
            street: v.address?.street || '',
            city: v.address?.city || '',
            state: v.address?.state || '',
            postalCode: v.address?.postalCode || '',
            country: v.address?.country || 'India',
            bankAccountHolder: v.bankDetails?.accountHolderName || '',
            bankAccountNumber: v.bankDetails?.accountNumber || '',
            bankIfsc: v.bankDetails?.ifscOrRouting || '',
            bankName: v.bankDetails?.bankName || '',
          });
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/vendors/me/profile', formData);
      if (res.success) {
        toast.success('Storefront details updated successfully');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading storefront settings..." />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="vendor" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-4xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Storefront & Payout Settings</h1>
          <p className="text-xs text-slate-500">
            Customize your public store page branding, dispatch address, and payout bank account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Store size={14} /> Storefront Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Bio & Description</label>
                <textarea
                  rows={3}
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Logo URL</label>
                <input
                  type="url"
                  name="storeLogo"
                  value={formData.storeLogo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Banner URL</label>
                <input
                  type="url"
                  name="storeBanner"
                  value={formData.storeBanner}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Email</label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Phone</label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} /> Direct Deposit Banking Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleChange}
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IFSC / Routing Code</label>
                <input
                  type="text"
                  name="bankIfsc"
                  value={formData.bankIfsc}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default VendorStoreSettingsPage;
