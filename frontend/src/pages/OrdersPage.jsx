import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { Package, ArrowRight, Store, ShoppingBag } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('Orders error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader fullScreen message="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Package}
          title="No Orders Placed Yet"
          description="You haven't made any purchases on ShopVerse yet. Browse products from independent vendors to place your first order!"
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">My Order History</h1>
        <p className="text-xs text-slate-500">Track and manage your multi-vendor purchases</p>
      </div>

      <div className="space-y-5">
        {orders.map((order) => {
          const vendorsCount = order.subOrders?.length || 1;

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Card Header */}
              <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Order Number</span>
                    <span className="font-mono font-bold text-navy-950">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Order Date</span>
                    <span className="font-bold text-slate-800">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Total Amount</span>
                    <span className="font-bold text-navy-950">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={order.orderStatus} type="order" />
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
              </div>

              {/* Items Preview */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span>
                    Fulfilled by <strong className="text-slate-800">{vendorsCount} independent store{vendorsCount > 1 ? 's' : ''}</strong>
                  </span>
                  <span>Payment: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.items.length > 4 && (
                  <p className="text-xs text-slate-400 italic">
                    + {order.items.length - 4} more item(s)
                  </p>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Ship to: <strong className="text-slate-800">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city})
                  </p>
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    View Details & Track <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
