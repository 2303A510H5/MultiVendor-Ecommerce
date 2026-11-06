import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShoppingBag, ArrowRight, Shield, Store, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res?.user?.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // One-click Demo Account Quickfill
  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-orange to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShoppingBag className="text-white" size={26} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-navy-950 tracking-tight">
            Sign In to Shop<span className="text-brand-orange">Verse</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access your Customer account, Vendor storefront, or Admin console
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
            🚀 Quick Demo Login Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@shopverse.com', 'adminpassword123')}
              className="px-2 py-1.5 bg-white hover:bg-navy-900 hover:text-white border border-slate-200 text-navy-900 rounded-xl text-xs font-bold transition-all shadow-sm flex flex-col items-center gap-0.5"
            >
              <Shield size={14} className="text-amber-500" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('vendor1@techpulse.com', 'vendorpassword123')}
              className="px-2 py-1.5 bg-white hover:bg-navy-900 hover:text-white border border-slate-200 text-navy-900 rounded-xl text-xs font-bold transition-all shadow-sm flex flex-col items-center gap-0.5"
            >
              <Store size={14} className="text-brand-orange" />
              <span>Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer1@gmail.com', 'customerpassword123')}
              className="px-2 py-1.5 bg-white hover:bg-navy-900 hover:text-white border border-slate-200 text-navy-900 rounded-xl text-xs font-bold transition-all shadow-sm flex flex-col items-center gap-0.5"
            >
              <UserCheck size={14} className="text-emerald-500" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-400">Min 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-orange hover:underline">
              Create Customer Account
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Want to sell products?{' '}
            <Link to="/vendor/register" className="font-bold text-navy-900 hover:underline">
              Register as a Vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
