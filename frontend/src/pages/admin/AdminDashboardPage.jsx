import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import Sidebar from '../../components/common/Sidebar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="admin" />
        <div className="flex-1 p-8">
          <Loader fullScreen message="Loading executive platform analytics..." />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Platform Executive Overview</h1>
            <p className="text-xs text-slate-500">
              Live marketplace activity, vendor onboarding pipeline, and gross revenue
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/vendors"
              className="px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Store size={15} /> Review Vendors ({stats.pendingVendors || 0} Pending)
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Executive Reports
            </Link>
          </div>
        </div>

        {/* 6 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Customers</p>
            <h3 className="text-xl font-black text-navy-950 mt-1">{stats.totalCustomers || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Vendors</p>
            <h3 className="text-xl font-black text-navy-950 mt-1">{stats.totalVendors || 0}</h3>
            {stats.pendingVendors > 0 && (
              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                {stats.pendingVendors} pending review
              </span>
            )}
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Active Products</p>
            <h3 className="text-xl font-black text-navy-950 mt-1">{stats.totalProducts || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</p>
            <h3 className="text-xl font-black text-navy-950 mt-1">{stats.totalOrders || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Merchandise (GMV)</p>
            <h3 className="text-xl font-black text-navy-950 mt-1">
              {formatCurrency(stats.grossSales)}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Platform Revenue</p>
            <h3 className="text-xl font-black text-brand-orange mt-1">
              {formatCurrency(stats.platformCommission)}
            </h3>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-orange" /> Monthly Gross Sales & Platform Revenue
              </h3>
              <p className="text-xs text-slate-400">Total transacted merchandise vs 10% average platform take rate</p>
            </div>
          </div>

          <div className="h-72">
            {data?.revenueChart && data.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient id="adminSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B1D3A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0B1D3A" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="adminComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#0B1D3A"
                    fillOpacity={1}
                    fill="url(#adminSales)"
                    name="Gross Sales (GMV)"
                  />
                  <Area
                    type="monotone"
                    dataKey="commission"
                    stroke="#FF6B00"
                    fillOpacity={1}
                    fill="url(#adminComm)"
                    name="Platform Commission"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Top Vendors & Recent Platform Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Vendors */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                <Store size={16} className="text-brand-orange" /> Top Performing Vendors
              </h3>
              <Link to="/admin/vendors" className="text-xs font-bold text-brand-orange hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {(data?.topVendors || []).map((v) => (
                <div key={v._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={v.storeLogo} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200" />
                    <div>
                      <p className="font-bold text-navy-950">{v.storeName}</p>
                      <p className="text-[11px] text-slate-400">{v.totalOrders || 0} completed orders</p>
                    </div>
                  </div>
                  <span className="font-black text-navy-950 text-sm">
                    {formatCurrency(v.totalSales || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                <ShoppingBag size={16} className="text-brand-orange" /> Recent Platform Orders
              </h3>
              <Link to="/admin/orders" className="text-xs font-bold text-brand-orange hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {(data?.recentOrders || []).map((o) => (
                <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-mono font-bold text-navy-950">{o.orderNumber}</p>
                    <p className="text-[11px] text-slate-400">
                      Customer: {o.customer?.name} • {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-black text-navy-950 block">{formatCurrency(o.totalAmount)}</span>
                    <StatusBadge status={o.orderStatus} type="order" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
