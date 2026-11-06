import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-12 pb-8 border-t border-navy-800">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-navy-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-800 rounded-xl text-brand-orange">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400">Express multi-vendor shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-800 rounded-xl text-brand-orange">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Secure Sandbox Payments</h4>
              <p className="text-xs text-slate-400">Razorpay test mode & COD</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-800 rounded-xl text-brand-orange">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy Returns & Refunds</h4>
              <p className="text-xs text-slate-400">Hassle-free 7-day policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-800 rounded-xl text-brand-orange">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Platform Support</h4>
              <p className="text-xs text-slate-400">Dedicated assistance for all</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="text-lg font-black text-white">Shop<span className="text-brand-orange">Verse</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Next-generation Multi-Vendor E-Commerce platform connecting verified independent brands, artisans, and retailers with customers worldwide.
            </p>
            <div className="inline-block px-3 py-1 bg-navy-800 rounded-md text-[11px] font-semibold text-emerald-400 border border-navy-700">
              ● Sandbox & Demonstration Environment
            </div>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white mb-3 tracking-wider uppercase">Marketplace</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics-audio" className="hover:text-white transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/products?category=fashion-apparel" className="hover:text-white transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white mb-3 tracking-wider uppercase">For Vendors</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/vendor/register" className="text-brand-orange font-semibold hover:underline">Apply to Sell</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">Vendor Portal</Link></li>
              <li><Link to="/vendor/products" className="hover:text-white transition-colors">Inventory Management</Link></li>
              <li><Link to="/vendor/reports" className="hover:text-white transition-colors">Vendor Sales Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white mb-3 tracking-wider uppercase">Platform & Admin</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/admin/reports" className="hover:text-white transition-colors">Executive Reports (5/5)</Link></li>
              <li><span className="text-slate-500">Node.js • Express • MongoDB • React</span></li>
              <li><span className="text-slate-500">Docker & Kubernetes Ready</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-navy-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ShopVerse Multi-Vendor Platform. Built for excellence.</p>
        <div className="flex gap-4">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Refund Policy</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
