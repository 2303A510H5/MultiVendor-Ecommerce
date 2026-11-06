import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, exportToPDF, printReport } from '../../utils/exportUtils';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  ShoppingBag,
  Store,
  Package,
  CreditCard,
  AlertTriangle,
  Search,
} from 'lucide-react';

const AdminReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'vendor-sales', 'orders', 'inventory', 'payments'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Report Data States
  const [salesData, setSalesData] = useState(null);
  const [vendorSalesData, setVendorSalesData] = useState([]);
  const [orderReportData, setOrderReportData] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch active report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);
      if (searchTerm) queryParams.push(`search=${searchTerm}`);
      const qs = queryParams.length ? `?${queryParams.join('&')}` : '';

      if (activeTab === 'sales') {
        const res = await api.get(`/reports/sales${qs}`);
        if (res.success) setSalesData(res);
      } else if (activeTab === 'vendor-sales') {
        const res = await api.get(`/reports/vendor-sales${qs}`);
        if (res.success) setVendorSalesData(res.vendors || []);
      } else if (activeTab === 'orders') {
        const res = await api.get(`/reports/orders${qs}`);
        if (res.success) setOrderReportData(res.orders || []);
      } else if (activeTab === 'inventory') {
        const res = await api.get(`/reports/inventory${qs}`);
        if (res.success) setInventoryData(res);
      } else if (activeTab === 'payments') {
        const res = await api.get(`/reports/payments${qs}`);
        if (res.success) setPaymentData(res);
      }
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  // ================= EXPORT HANDLERS =================
  const handleExportCSV = () => {
    if (activeTab === 'sales') {
      const rows = salesData?.productSales?.map((p) => ({
        'Product Name': p.name,
        'Vendor': p.vendor?.storeName || 'Direct',
        'Price (INR)': p.price,
        'Units Sold': p.unitsSold,
        'Available Stock': p.stock,
        'Gross Revenue (INR)': p.price * p.unitsSold,
      })) || [];
      exportToCSV(rows, 'Platform_Sales_Report');
    } else if (activeTab === 'vendor-sales') {
      const rows = vendorSalesData.map((v) => ({
        'Store Name': v.storeName,
        'Vendor Name': v.vendorName,
        'Total Orders': v.totalOrders,
        'Products Sold': v.productsSold,
        'Gross Sales (INR)': v.grossSales,
        'Platform Commission (INR)': v.platformCommission,
        'Vendor Earnings (INR)': v.vendorEarnings,
      }));
      exportToCSV(rows, 'Vendor_Wise_Sales_Report');
    } else if (activeTab === 'orders') {
      const rows = orderReportData.map((o) => ({
        'Order ID': o.orderId,
        'Customer Name': o.customerName,
        'Order Date': formatDate(o.orderDate),
        'Products': o.productNames,
        'Vendor Name': o.vendorName,
        'Order Amount (INR)': o.orderAmount,
        'Payment Method': o.paymentMethod,
        'Payment Status': o.paymentStatus,
        'Order Status': o.orderStatus,
        'Delivery Status': o.deliveryStatus,
      }));
      exportToCSV(rows, 'Orders_Detailed_Report');
    } else if (activeTab === 'inventory') {
      const rows = (inventoryData?.inventory || []).map((i) => ({
        'Product Name': i.productName,
        'SKU': i.sku,
        'Vendor': i.vendorName,
        'Category': i.categoryName,
        'Price (INR)': i.price,
        'Available Stock': i.availableStock,
        'Units Sold': i.unitsSold,
        'Inventory Valuation (INR)': i.inventoryValuation,
        'Status Alert': i.stockStatus,
      }));
      exportToCSV(rows, 'Inventory_Valuation_Report');
    } else if (activeTab === 'payments') {
      const rows = (paymentData?.payments || []).map((p) => ({
        'Transaction ID': p.transactionId,
        'Order ID': p.orderId,
        'Customer Name': p.customerName,
        'Payment Method': p.paymentMethod,
        'Amount (INR)': p.transactionAmount,
        'Payment Date': formatDate(p.paymentDate, true),
        'Payment Status': p.paymentStatus,
        'Refund Status': p.refundStatus,
      }));
      exportToCSV(rows, 'Payment_Transactions_Report');
    }
  };

  const handleExportPDF = () => {
    if (activeTab === 'sales') {
      const columns = ['Product Name', 'Vendor', 'Price', 'Sold', 'Stock', 'Revenue'];
      const rows = (salesData?.productSales || []).map((p) => [
        p.name,
        p.vendor?.storeName || 'Direct',
        `INR ${p.price}`,
        p.unitsSold,
        p.stock,
        `INR ${p.price * p.unitsSold}`,
      ]);
      exportToPDF({
        title: 'Report 1: Executive Sales & Revenue Report',
        subtitle: `Total Sales: ${formatCurrency(salesData?.summary?.totalSales)} | Platform Revenue: ${formatCurrency(salesData?.summary?.totalRevenue)}`,
        columns,
        rows,
        fileName: 'Platform_Sales_Report',
      });
    } else if (activeTab === 'vendor-sales') {
      const columns = ['Store Name', 'Total Orders', 'Items Sold', 'Gross Sales', 'Commission', 'Vendor Earnings'];
      const rows = vendorSalesData.map((v) => [
        v.storeName,
        v.totalOrders,
        v.productsSold,
        `INR ${v.grossSales}`,
        `INR ${v.platformCommission}`,
        `INR ${v.vendorEarnings}`,
      ]);
      exportToPDF({
        title: 'Report 2: Vendor-Wise Sales & Commission Report',
        subtitle: `Aggregated vendor performance across ${vendorSalesData.length} merchants`,
        columns,
        rows,
        fileName: 'Vendor_Sales_Report',
      });
    } else if (activeTab === 'orders') {
      const columns = ['Order ID', 'Customer', 'Date', 'Amount', 'Payment', 'Order Status', 'Delivery'];
      const rows = orderReportData.map((o) => [
        o.orderId,
        o.customerName,
        formatDate(o.orderDate),
        `INR ${o.orderAmount}`,
        o.paymentMethod,
        o.orderStatus,
        o.deliveryStatus,
      ]);
      exportToPDF({
        title: 'Report 3: Comprehensive Orders & Dispatch Report',
        subtitle: `Total orders logged: ${orderReportData.length}`,
        columns,
        rows,
        fileName: 'Orders_Report',
      });
    } else if (activeTab === 'inventory') {
      const columns = ['Product Name', 'Vendor', 'Stock', 'Sold', 'Valuation', 'Stock Alert'];
      const rows = (inventoryData?.inventory || []).map((i) => [
        i.productName,
        i.vendorName,
        i.availableStock,
        i.unitsSold,
        `INR ${i.inventoryValuation}`,
        i.stockStatus,
      ]);
      exportToPDF({
        title: 'Report 4: Platform Inventory Valuation & Stock Alerts',
        subtitle: `Total Products: ${inventoryData?.summary?.totalProducts} | Valuation: ${formatCurrency(inventoryData?.summary?.totalValuation)}`,
        columns,
        rows,
        fileName: 'Inventory_Report',
      });
    } else if (activeTab === 'payments') {
      const columns = ['Transaction ID', 'Order ID', 'Customer', 'Method', 'Amount', 'Payment Status', 'Refunds'];
      const rows = (paymentData?.payments || []).map((p) => [
        p.transactionId,
        p.orderId,
        p.customerName,
        p.paymentMethod,
        `INR ${p.transactionAmount}`,
        p.paymentStatus,
        p.refundStatus,
      ]);
      exportToPDF({
        title: 'Report 5: Payment & Refund Audit Report',
        subtitle: `Total Processed Amount: ${formatCurrency(paymentData?.summary?.totalAmount)}`,
        columns,
        rows,
        fileName: 'Payment_Transactions_Report',
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Executive Reports & Business Analytics</h1>
            <p className="text-xs text-slate-500">
              Live MongoDB aggregations, Recharts visualizations, and multi-format exports (CSV, PDF, Print)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} /> Export PDF
            </button>
            <button
              type="button"
              onClick={printReport}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* 5 Mandatory Reports Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 sm:gap-6 text-xs sm:text-sm font-bold text-slate-500 pb-px">
          {[
            { id: 'sales', label: '1. Sales Report', icon: DollarSign },
            { id: 'vendor-sales', label: '2. Vendor-Wise Sales', icon: Store },
            { id: 'orders', label: '3. Order Report', icon: ShoppingBag },
            { id: 'inventory', label: '4. Inventory Valuation', icon: Package },
            { id: 'payments', label: '5. Payment & Refunds', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-brand-orange border-b-2 border-brand-orange'
                    : 'hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Universal Date & Search Filter */}
        <form
          onSubmit={handleFilterSubmit}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-brand-orange" />
            <span className="text-slate-600">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="relative flex-1 min-w-[12rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search keyword in report..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold transition-colors"
          >
            Filter Records
          </button>
        </form>

        {loading ? (
          <Loader message={`Generating ${activeTab} report from MongoDB...`} />
        ) : (
          <div className="space-y-6">
            {/* ========================================================= */}
            {/* REPORT 1: SALES REPORT */}
            {/* ========================================================= */}
            {activeTab === 'sales' && salesData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Merchandise Value (GMV)</p>
                    <h3 className="text-2xl font-black text-navy-950 mt-1">
                      {formatCurrency(salesData.summary.totalSales)}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</p>
                    <h3 className="text-2xl font-black text-navy-950 mt-1">
                      {salesData.summary.totalOrders}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Platform Take-Rate Revenue</p>
                    <h3 className="text-2xl font-black text-brand-orange mt-1">
                      {formatCurrency(salesData.summary.totalRevenue)}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Vendor Payouts (Earnings)</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">
                      {formatCurrency(salesData.summary.vendorEarnings)}
                    </h3>
                  </div>
                </div>

                {/* Sales Trends Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-navy-950">Monthly Platform Sales Trends (Recharts)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData.monthlySales || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Area type="monotone" dataKey="sales" stroke="#0B1D3A" fill="#0B1D3A" fillOpacity={0.2} name="Total Sales" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Product-Wise Sales Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="text-sm font-black text-navy-950">Product-Wise Sales & Inventory Balance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Vendor</th>
                          <th className="p-4">Unit Price</th>
                          <th className="p-4">Units Sold</th>
                          <th className="p-4">Available Stock</th>
                          <th className="p-4 text-right">Gross Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(salesData.productSales || []).map((p) => (
                          <tr key={p._id}>
                            <td className="p-4 font-bold text-navy-950">{p.name}</td>
                            <td className="p-4">{p.vendor?.storeName || 'Merchant'}</td>
                            <td className="p-4">{formatCurrency(p.price)}</td>
                            <td className="p-4 font-black">{p.unitsSold}</td>
                            <td className="p-4">{p.stock}</td>
                            <td className="p-4 text-right font-black text-navy-950">
                              {formatCurrency(p.price * p.unitsSold)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* REPORT 2: VENDOR-WISE SALES REPORT */}
            {/* ========================================================= */}
            {activeTab === 'vendor-sales' && (
              <div className="space-y-6">
                {/* Vendor Comparison Bar Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-navy-950">Vendor Sales & Commission Comparison (Recharts)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vendorSalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="storeName" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Bar dataKey="grossSales" fill="#0B1D3A" name="Gross Sales" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="platformCommission" fill="#FF6B00" name="Platform Commission" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="vendorEarnings" fill="#10B981" name="Vendor Earnings" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Vendor Breakdown Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-4">Store Name</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Commission %</th>
                          <th className="p-4">Total Orders</th>
                          <th className="p-4">Products Sold</th>
                          <th className="p-4">Gross Sales</th>
                          <th className="p-4">Platform Commission</th>
                          <th className="p-4 text-right">Vendor Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {vendorSalesData.map((v) => (
                          <tr key={v.vendorId} className="hover:bg-slate-50/80">
                            <td className="p-4 font-bold text-navy-950">{v.storeName}</td>
                            <td className="p-4 text-slate-400">{v.businessEmail}</td>
                            <td className="p-4 font-black">{v.commissionRate}%</td>
                            <td className="p-4">{v.totalOrders}</td>
                            <td className="p-4 font-black">{v.productsSold}</td>
                            <td className="p-4 font-bold text-navy-950">{formatCurrency(v.grossSales)}</td>
                            <td className="p-4 text-rose-600 font-bold">{formatCurrency(v.platformCommission)}</td>
                            <td className="p-4 text-right font-black text-emerald-600">
                              {formatCurrency(v.vendorEarnings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* REPORT 3: ORDER REPORT */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Order Date</th>
                        <th className="p-4">Product Details</th>
                        <th className="p-4">Vendor(s)</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Order Status</th>
                        <th className="p-4">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {orderReportData.map((o) => (
                        <tr key={o.orderId} className="hover:bg-slate-50/80">
                          <td className="p-4 font-mono font-bold text-navy-950">{o.orderId}</td>
                          <td className="p-4">
                            <p className="font-bold text-navy-950">{o.customerName}</p>
                            <p className="text-[10px] text-slate-400">{o.destinationCity}</p>
                          </td>
                          <td className="p-4">{formatDate(o.orderDate)}</td>
                          <td className="p-4 max-w-xs truncate" title={o.productNames}>
                            {o.productNames}
                          </td>
                          <td className="p-4 font-semibold text-slate-800">{o.vendorName}</td>
                          <td className="p-4 font-black text-navy-950">{formatCurrency(o.orderAmount)}</td>
                          <td className="p-4">
                            <StatusBadge status={o.paymentStatus} type="payment" />
                          </td>
                          <td className="p-4">
                            <StatusBadge status={o.orderStatus} type="order" />
                          </td>
                          <td className="p-4">
                            <StatusBadge status={o.deliveryStatus} type="order" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* REPORT 4: INVENTORY REPORT */}
            {/* ========================================================= */}
            {activeTab === 'inventory' && inventoryData && (
              <div className="space-y-6">
                {/* Inventory Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Catalog Items</p>
                    <h3 className="text-2xl font-black text-navy-950 mt-1">
                      {inventoryData.summary.totalProducts}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Inventory Valuation</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">
                      {formatCurrency(inventoryData.summary.totalValuation)}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Low-Stock Alerts</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">
                      {inventoryData.summary.lowStockCount}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Out of Stock</p>
                    <h3 className="text-2xl font-black text-rose-600 mt-1">
                      {inventoryData.summary.outOfStockCount}
                    </h3>
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Vendor</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Unit Price</th>
                          <th className="p-4">Available Stock</th>
                          <th className="p-4">Units Sold</th>
                          <th className="p-4">Valuation</th>
                          <th className="p-4 text-right">Inventory Alert</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {inventoryData.inventory.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-50/80">
                            <td className="p-4">
                              <p className="font-bold text-navy-950">{item.productName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                            </td>
                            <td className="p-4">{item.vendorName}</td>
                            <td className="p-4">{item.categoryName}</td>
                            <td className="p-4">{formatCurrency(item.price)}</td>
                            <td className="p-4 font-black">{item.availableStock}</td>
                            <td className="p-4 font-black">{item.unitsSold}</td>
                            <td className="p-4 font-bold text-navy-950">
                              {formatCurrency(item.inventoryValuation)}
                            </td>
                            <td className="p-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.stockStatus === 'Out of Stock'
                                    ? 'bg-rose-100 text-rose-800'
                                    : item.stockStatus === 'Low Stock Alert'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {item.stockStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* REPORT 5: PAYMENT REPORT */}
            {/* ========================================================= */}
            {activeTab === 'payments' && paymentData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Transactions</p>
                    <h3 className="text-2xl font-black text-navy-950 mt-1">
                      {paymentData.summary.totalTransactions}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Amount Processed</p>
                    <h3 className="text-2xl font-black text-navy-950 mt-1">
                      {formatCurrency(paymentData.summary.totalAmount)}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Successful Settlements</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">
                      {formatCurrency(paymentData.summary.successfulAmount)}
                    </h3>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Refunds Processed</p>
                    <h3 className="text-2xl font-black text-teal-600 mt-1">
                      {formatCurrency(paymentData.summary.refundedAmount)}
                    </h3>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4">Transaction Amount</th>
                          <th className="p-4">Payment Date</th>
                          <th className="p-4">Payment Status</th>
                          <th className="p-4 text-right">Refund Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {paymentData.payments.map((p) => (
                          <tr key={p.transactionId} className="hover:bg-slate-50/80">
                            <td className="p-4 font-mono font-bold text-navy-950">{p.transactionId}</td>
                            <td className="p-4 font-mono">{p.orderId}</td>
                            <td className="p-4">
                              <p className="font-bold text-navy-950">{p.customerName}</p>
                              <p className="text-[10px] text-slate-400">{p.customerEmail}</p>
                            </td>
                            <td className="p-4 font-bold text-slate-700">{p.paymentMethod}</td>
                            <td className="p-4 font-black text-navy-950 text-sm">
                              {formatCurrency(p.transactionAmount)}
                            </td>
                            <td className="p-4">{formatDate(p.paymentDate, true)}</td>
                            <td className="p-4">
                              <StatusBadge status={p.paymentStatus} type="payment" />
                            </td>
                            <td className="p-4 text-right font-medium">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.refundStatus.includes('Refunded')
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {p.refundStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReportsPage;
