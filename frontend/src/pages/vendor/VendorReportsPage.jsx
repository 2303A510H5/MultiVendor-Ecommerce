import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, exportToPDF, printReport } from '../../utils/exportUtils';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
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
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
} from 'lucide-react';

const VendorReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = '/reports/sales';
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res.success) {
        setReport(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCSV = () => {
    if (!report?.productSales?.length) return;
    const csvData = report.productSales.map((p) => ({
      'Product Name': p.name,
      'Price (INR)': p.price,
      'Units Sold': p.unitsSold,
      'Available Stock': p.stock,
      'Total Revenue (INR)': p.price * p.unitsSold,
    }));
    exportToCSV(csvData, 'vendor_sales_report');
  };

  const handleExportPDF = () => {
    if (!report?.productSales?.length) return;
    const columns = ['Product Name', 'Price', 'Units Sold', 'Stock', 'Revenue'];
    const rows = report.productSales.map((p) => [
      p.name,
      `INR ${p.price}`,
      p.unitsSold,
      p.stock,
      `INR ${p.price * p.unitsSold}`,
    ]);

    exportToPDF({
      title: 'Vendor Product Sales & Revenue Report',
      subtitle: `Total Gross Sales: ${formatCurrency(report.summary.totalSales)} | Net Earnings: ${formatCurrency(report.summary.vendorEarnings)}`,
      columns,
      rows,
      fileName: 'vendor_sales_report',
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="vendor" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Store Sales & Revenue Report</h1>
            <p className="text-xs text-slate-500">
              Analyze product performance, net payout earnings, and export statements
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

        {/* Date Filter Bar */}
        <form
          onSubmit={handleApplyFilter}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-brand-orange" />
            <span className="text-slate-600">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg text-xs font-bold transition-colors"
          >
            Apply Filters
          </button>
        </form>

        {loading ? (
          <Loader message="Generating sales report..." />
        ) : !report ? (
          <p className="text-xs text-slate-500">Failed to load sales report.</p>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Gross Sales</p>
                <h3 className="text-2xl font-black text-navy-950 mt-1">
                  {formatCurrency(report.summary.totalSales)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Orders Count</p>
                <h3 className="text-2xl font-black text-navy-950 mt-1">
                  {report.summary.totalOrders}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Commission Paid</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">
                  {formatCurrency(report.summary.platformCommission)}
                </h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Net Earnings</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {formatCurrency(report.summary.vendorEarnings)}
                </h3>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-navy-950">Earnings & Sales Growth Trajectory</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.monthlySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="sales" stroke="#0B1D3A" fill="#0B1D3A" fillOpacity={0.1} name="Sales" />
                    <Area type="monotone" dataKey="earnings" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.2} name="Earnings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-black text-navy-950">Top Selling Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Unit Price</th>
                      <th className="p-4">Units Sold</th>
                      <th className="p-4">Remaining Stock</th>
                      <th className="p-4 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {report.productSales.map((p) => (
                      <tr key={p._id}>
                        <td className="p-4 font-bold text-navy-950">{p.name}</td>
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
      </main>
    </div>
  );
};

export default VendorReportsPage;
