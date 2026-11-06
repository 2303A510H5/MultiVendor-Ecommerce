import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { Store, Mail, Phone, MapPin, ShoppingBag, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';

const StorefrontPage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vendors/${id}`);
        if (res.success) {
          setVendor(res.vendor);
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error('Storefront error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) return <Loader fullScreen message="Loading storefront..." />;
  if (!vendor) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Store Not Found</h2>
        <Link to="/" className="text-brand-orange text-sm font-semibold mt-2 inline-block">
          Return to Marketplace Home
        </Link>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Storefront Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Banner */}
        <div className="h-48 sm:h-64 bg-slate-200 overflow-hidden relative">
          <img
            src={vendor.storeBanner}
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        {/* Store Metadata Header */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={vendor.storeLogo}
              alt={vendor.storeName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-navy-950 sm:text-white drop-shadow-sm">
                  {vendor.storeName}
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={11} /> Verified Merchant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={vendor.rating || 5} size={14} />
                <span className="text-xs font-bold text-slate-700 sm:text-slate-200">
                  {vendor.rating || 5} Rating ({vendor.totalOrders || 0} orders completed)
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1 sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
            {vendor.businessEmail && (
              <p className="flex items-center sm:justify-end gap-1.5">
                <Mail size={13} className="text-brand-orange" /> {vendor.businessEmail}
              </p>
            )}
            {vendor.businessPhone && (
              <p className="flex items-center sm:justify-end gap-1.5">
                <Phone size={13} className="text-brand-orange" /> {vendor.businessPhone}
              </p>
            )}
            {vendor.address?.city && (
              <p className="flex items-center sm:justify-end gap-1.5">
                <MapPin size={13} className="text-brand-orange" /> {vendor.address.city}, {vendor.address.state}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {vendor.storeDescription && (
          <div className="px-6 sm:px-8 pb-6 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <p className="leading-relaxed max-w-3xl">{vendor.storeDescription}</p>
          </div>
        )}
      </div>

      {/* Store Products */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-black text-navy-950">Store Products</h2>
            <p className="text-xs text-slate-500">Showing {filteredProducts.length} items from {vendor.storeName}</p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search in this store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No products in this storefront"
            description="The vendor currently does not have any items matching your search."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
              const effectivePrice = hasDiscount ? product.discountPrice : product.price;
              const inWishlist = isInWishlist(product._id);

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md shadow-sm transition-all ${
                      inWishlist
                        ? 'bg-rose-50 text-rose-500'
                        : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
                    }`}
                  >
                    <Heart size={16} className={inWishlist ? 'fill-rose-500' : ''} />
                  </button>

                  <Link to={`/products/${product._id}`} className="block relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {hasDiscount && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md">
                        SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-brand-orange transition-colors line-clamp-2 mb-2"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-center gap-1.5 mb-3">
                      <StarRating rating={product.rating || 5} size={13} />
                      <span className="text-[11px] text-slate-500 font-semibold">
                        ({product.numReviews || 0})
                      </span>
                    </div>

                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                      <div>
                        <span className="text-base font-black text-navy-950">
                          {formatCurrency(effectivePrice)}
                        </span>
                        {hasDiscount && (
                          <span className="ml-1.5 text-xs text-slate-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={() => addToCart(product._id, 1)}
                        className="p-2 bg-navy-900 hover:bg-brand-orange text-white rounded-xl shadow-sm transition-colors disabled:opacity-40"
                        title="Add to cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontPage;
