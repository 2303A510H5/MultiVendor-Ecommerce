import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ShoppingBag, Search, Eye } from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/admin/all?status=${statusFilter}&search=${searchTerm}`);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Platform Orders Monitoring</h1>
          <p className="text-xs text-slate-500">
            Monitor customer orders, vendor suborder splits, and delivery statuses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Return Requested">Return Requested</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No Orders Found"
            description="No orders currently match your filter criteria."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Vendors Involved</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((o) => {
                    const vendorNames = (o.subOrders || [])
                      .map((so) => so.vendor?.storeName)
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-navy-950">
                          {o.orderNumber}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{o.customer?.name}</p>
                          <p className="text-[10px] text-slate-400">{o.customer?.email}</p>
                        </td>
                        <td className="p-4 text-slate-600">{formatDate(o.createdAt)}</td>
                        <td className="p-4 font-medium text-slate-800 line-clamp-1">
                          {vendorNames || 'Multiple Stores'}
                        </td>
                        <td className="p-4 font-black text-navy-950 text-sm">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={o.paymentStatus} type="payment" />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={o.orderStatus} type="order" />
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/orders/${o._id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 inline-block transition-colors"
                            title="Inspect order details"
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrdersPage;
