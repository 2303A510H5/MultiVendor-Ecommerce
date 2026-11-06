import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  BarChart,
  Bar,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Store,
  Layers,
  Clock,
} from 'lucide-react';

const VendorDashboardPage = () => {
  const { vendor, refreshUser } = useAuth();
  const [salesReport, setSalesReport] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const [salesRes, ordersRes, invRes] = await Promise.all([
          api.get('/reports/sales'),
          api.get('/orders/vendor/all?limit=5'),
          api.get('/reports/inventory?stockStatus=low_stock'),
        ]);

        if (salesRes.success) setSalesReport(salesRes);
        if (ordersRes.success) setRecentOrders(ordersRes.orders || []);
        if (invRes.success) setInventoryAlerts(invRes.inventory || []);
      } catch (err) {
        console.error('Vendor dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="vendor" />
        <div className="flex-1 p-8">
          <Loader fullScreen message="Loading vendor statistics..." />
        </div>
      </div>
    );
  }

  // Check approval status
  const isApproved = vendor?.status === 'approved';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="vendor" />

      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl">
        {/* Top Vendor Greeting & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-navy-950">
                {vendor?.storeName || 'Vendor Dashboard'}
              </h1>
              <StatusBadge status={vendor?.status || 'pending'} type="vendor" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Storefront performance, real-time orders, and inventory monitoring
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/vendor/products/new"
              disabled={!isApproved}
              className={`px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                !isApproved ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Package size={15} /> Add New Product
            </Link>
            <Link
              to={`/stores/${vendor?._id}`}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Store size={15} /> View Public Store
            </Link>
          </div>
        </div>

        {/* Approval Notification Banner if Pending */}
        {!isApproved && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-600" /> Account Status: {vendor?.status?.toUpperCase()}
            </p>
            <p>
              Your store application is awaiting administrator verification. Product publishing and order fulfillment will activate once approved.
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gross Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</p>
              <h3 className="text-2xl font-black text-navy-950 mt-1">
                {formatCurrency(salesReport?.summary?.totalSales || vendor?.totalSales || 0)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total customer order volume</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>

          {/* Card 2: Net Earnings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor Earnings</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {formatCurrency(salesReport?.summary?.vendorEarnings || vendor?.totalEarnings || 0)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">After {vendor?.commissionRate || 10}% platform commission</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Suborders</p>
              <h3 className="text-2xl font-black text-navy-950 mt-1">
                {salesReport?.summary?.totalOrders || vendor?.totalOrders || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Assigned to your store</p>
            </div>
            <div className="p-3 bg-orange-50 text-brand-orange rounded-2xl">
              <ShoppingBag size={24} />
            </div>
          </div>

          {/* Card 4: Inventory Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {inventoryAlerts.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Requires inventory replenishment</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        {/* Charts & Graphs (Recharts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-orange" /> Monthly Sales & Earnings Performance
            </h3>
            <div className="h-64">
              {salesReport?.monthlySales && salesReport.monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesReport.monthlySales}>
                    <defs>
                      <linearGradient id="vendorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B1D3A" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0B1D3A" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="vendorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#0B1D3A"
                      fillOpacity={1}
                      fill="url(#vendorSales)"
                      name="Gross Sales"
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#FF6B00"
                      fillOpacity={1}
                      fill="url(#vendorEarnings)"
                      name="Net Earnings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No monthly chart points recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Daily Trends Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
              <ShoppingBag size={16} className="text-brand-orange" /> Recent Daily Sales Activity
            </h3>
            <div className="h-64">
              {salesReport?.dailyTrends && salesReport.dailyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesReport.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="sales" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Daily Sales (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No daily sales points recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Warning Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Inventory Alerts
              </h3>
              <Link to="/vendor/products" className="text-xs font-bold text-brand-orange hover:underline">
                Manage All
              </Link>
            </div>

            {inventoryAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                All catalog products are healthy and adequately stocked!
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {inventoryAlerts.slice(0, 5).map((item) => (
                  <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-navy-950">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        item.availableStock === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.availableStock === 0 ? 'Out of Stock' : `${item.availableStock} in stock`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-navy-950 flex items-center gap-2">
                <ShoppingBag size={16} className="text-brand-orange" /> Recent Incoming Orders
              </h3>
              <Link to="/vendor/orders" className="text-xs font-bold text-brand-orange hover:underline">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No orders received yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.slice(0, 5).map((ord) => (
                  <div key={ord._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-mono font-bold text-navy-950">{ord.subOrderNumber}</p>
                      <p className="text-[11px] text-slate-500">
                        {ord.items?.length || 0} items • Customer: {ord.customer?.name || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-navy-950">{formatCurrency(ord.subtotal)}</p>
                      <StatusBadge status={ord.status} type="order" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboardPage;
