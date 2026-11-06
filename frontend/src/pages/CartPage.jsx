import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { Trash2, ShoppingBag, ArrowRight, Store, ShieldCheck } from 'lucide-react';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading && !cart.items.length) {
    return <Loader fullScreen message="Loading your shopping cart..." />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our curated multi-vendor catalog to discover great deals!"
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  // Group items by vendor for visual clarity
  const vendorGroups = {};
  for (const item of cart.items) {
    if (!item.product) continue;
    const vendorId = item.vendor?._id || item.product.vendor?._id || 'unknown';
    const vendorName = item.vendor?.storeName || item.product.vendor?.storeName || 'Merchant Partner';

    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        name: vendorName,
        items: [],
      };
    }
    vendorGroups[vendorId].items.push(item);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Shopping Cart</h1>
          <p className="text-xs text-slate-500">
            {cart.itemsCount} item{cart.itemsCount > 1 ? 's' : ''} from {Object.keys(vendorGroups).length} independent vendor{Object.keys(vendorGroups).length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Area */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(vendorGroups).map(([vId, group]) => (
            <div
              key={vId}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Vendor Group Header */}
              <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-brand-orange" />
                  <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wide">
                    Fulfilled by {group.name}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {group.items.length} item{group.items.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Items in Vendor Group */}
              <div className="divide-y divide-slate-100 p-6 space-y-4">
                {group.items.map((item) => {
                  const product = item.product;
                  const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

                  return (
                    <div
                      key={product._id}
                      className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/products/${product._id}`}
                          className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200"
                        >
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="space-y-1">
                          <Link
                            to={`/products/${product._id}`}
                            className="text-sm font-bold text-navy-950 hover:text-brand-orange transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs font-black text-navy-950">
                            {formatCurrency(itemPrice)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {product.stock < 5 ? (
                              <span className="text-amber-600 font-bold">Only {product.stock} left</span>
                            ) : (
                              'In Stock'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-navy-950 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-[5rem]">
                          <p className="text-sm font-black text-navy-950">
                            {formatCurrency(itemPrice * item.quantity)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(product._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-5">
            <h2 className="text-base font-black text-navy-950 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {cart.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(cart.shippingFee)
                  )}
                </span>
              </div>
              {cart.shippingFee > 0 && (
                <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Add items worth {formatCurrency(1000 - cart.subtotal)} more to unlock FREE shipping!
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <p className="text-sm font-black text-navy-950">Grand Total</p>
                <p className="text-[10px] text-slate-400">Inclusive of all applicable taxes</p>
              </div>
              <span className="text-2xl font-black text-brand-orange">
                {formatCurrency(cart.grandTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              Proceed to Multi-Vendor Checkout
              <ArrowRight size={18} />
            </button>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Safe & Secure Multi-Vendor Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
