import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  FileBarChart,
  Users,
  Layers,
  RotateCcw,
  Settings,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role = 'vendor' }) => {
  const { vendor } = useAuth();

  const vendorLinks = [
    { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vendor/products', icon: Package, label: 'My Products' },
    { to: '/vendor/orders', icon: ShoppingBag, label: 'Incoming Orders' },
    { to: '/vendor/returns', icon: RotateCcw, label: 'Returns & Refunds' },
    { to: '/vendor/reports', icon: FileBarChart, label: 'Sales Reports' },
    { to: '/vendor/settings', icon: Settings, label: 'Storefront Settings' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/vendors', icon: Store, label: 'Vendor Approvals' },
    { to: '/admin/products', icon: Package, label: 'All Products' },
    { to: '/admin/categories', icon: Layers, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
    { to: '/admin/returns', icon: RotateCcw, label: 'Returns & Refunds' },
    { to: '/admin/users', icon: Users, label: 'Users & Customers' },
    { to: '/admin/reports', icon: FileBarChart, label: 'Reports & Analytics' },
  ];

  const links = role === 'admin' ? adminLinks : vendorLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col min-h-[calc(100vh-4rem)] p-4 shadow-sm">
      {/* Sidebar Role Badge */}
      <div className="mb-6 px-3 py-3 bg-slate-50 border border-slate-200/70 rounded-xl">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role === 'admin' ? 'Platform Admin' : 'Vendor Portal'}
        </p>
        <p className="text-sm font-extrabold text-navy-900 truncate">
          {role === 'admin' ? 'ShopVerse Console' : (vendor?.storeName || 'My Store')}
        </p>
        {role === 'vendor' && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
            {vendor?.status === 'approved' ? 'Active Storefront' : vendor?.status || 'Pending'}
          </span>
        )}
      </div>

      {/* Nav List */}
      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/vendor/dashboard' || link.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 px-2 flex items-center justify-between">
        <span>ShopVerse v1.0</span>
        <ShieldCheck size={16} className="text-emerald-500" />
      </div>
    </aside>
  );
};

export default Sidebar;
