import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  User,
  MapPin,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Package,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'addresses', 'returns'
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
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

  // Returns
  const [returns, setReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

  // Load addresses
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await api.get('/users/addresses');
      if (res.success) setAddresses(res.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load customer returns
  const fetchReturns = async () => {
    try {
      setLoadingReturns(true);
      const res = await api.get('/returns/my-returns');
      if (res.success) setReturns(res.returns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReturns(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'returns') fetchReturns();
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', newAddress);
      if (res.success) {
        toast.success('Address added');
        setAddressModalOpen(false);
        fetchAddresses();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      if (res.success) {
        toast.success('Address deleted');
        fetchAddresses();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-orange shadow-md"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-navy-950">{user?.name}</h1>
            <span className="px-2.5 py-0.5 bg-navy-100 text-navy-900 text-xs font-bold rounded-full capitalize">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold text-slate-500">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'text-brand-orange border-b-2 border-brand-orange'
              : 'hover:text-slate-900'
          }`}
        >
          <User size={16} /> Personal Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 transition-all ${
            activeTab === 'addresses'
              ? 'text-brand-orange border-b-2 border-brand-orange'
              : 'hover:text-slate-900'
          }`}
        >
          <MapPin size={16} /> Delivery Addresses
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`pb-3 flex items-center gap-2 transition-all ${
            activeTab === 'returns'
              ? 'text-brand-orange border-b-2 border-brand-orange'
              : 'hover:text-slate-900'
          }`}
        >
          <RotateCcw size={16} /> Returns & Refunds
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-2xl">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save size={15} /> {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-navy-950">Saved Delivery Addresses</h2>
            <button
              type="button"
              onClick={() => setAddressModalOpen(true)}
              className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-navy-800 transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Address
            </button>
          </div>

          {loadingAddresses ? (
            <Loader message="Loading addresses..." />
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-xs text-slate-500">No addresses saved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-950">{addr.fullName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                        {addr.addressType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-[11px] text-slate-400">Phone: {addr.phone}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    {addr.isDefault ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Default Address
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Returns */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-950">Return & Refund Requests</h2>

          {loadingReturns ? (
            <Loader message="Loading returns..." />
          ) : returns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-xs text-slate-500">No return requests submitted.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((ret) => (
                <div
                  key={ret._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={ret.product?.images?.[0]}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-navy-950">{ret.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Reason: <strong>{ret.reason}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Submitted: {formatDate(ret.createdAt)} • Store: {ret.vendor?.storeName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-navy-950 block">
                        Refund: {formatCurrency(ret.refundAmount)}
                      </span>
                      {ret.refundTransactionId && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {ret.refundTransactionId}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={ret.status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Address"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
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

export default ProfilePage;
