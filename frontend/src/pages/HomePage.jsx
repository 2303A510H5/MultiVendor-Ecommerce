import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Store,
  Heart,
  TrendingUp,
  Tag,
  CheckCircle,
} from 'lucide-react';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes, vendRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/vendors'),
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (prodRes.success) setFeaturedProducts(prodRes.products);
        if (vendRes.success) setVendors(vendRes.vendors);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader fullScreen message="Loading ShopVerse marketplace..." />;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Sparkles size={14} /> Multi-Vendor Marketplace • Over 1,000+ Curated Products
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Discover Exceptional Brands. Direct from the Makers.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Explore authentic audio gear, modern designer apparel, and lifestyle staples from verified independent merchants across the country.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="px-6 py-3 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              Shop Featured Collections
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/vendor/register"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Store size={18} /> Open Vendor Store
            </Link>
          </div>
        </div>
      </section>

      {/* Coupon Promotion Pill */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-brand-orange/10 to-amber-500/10 border border-brand-orange/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange text-white rounded-lg">
              <Tag size={20} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-navy-950">
                Special Launch Offer: Get 10% OFF on your first purchase!
              </p>
              <p className="text-xs text-slate-500">Apply coupon code at checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-brand-orange/30 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Coupon Code:</span>
            <code className="text-sm font-black text-brand-orange tracking-widest font-mono">WELCOME10</code>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-navy-950">Shop by Category</h2>
            <p className="text-xs text-slate-500">Explore curated collections tailored to your lifestyle</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1">
            All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug || cat._id}`}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 mb-3 rounded-full overflow-hidden bg-slate-100 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-orange transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-brand-orange/10 text-brand-orange rounded-md">
                <TrendingUp size={16} />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-navy-950">Featured Products</h2>
            </div>
            <p className="text-xs text-slate-500">Hand-picked by our marketplace editors</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1">
            View All ({featuredProducts.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
            const effectivePrice = hasDiscount ? product.discountPrice : product.price;
            const inWishlist = isInWishlist(product._id);

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
              >
                {/* Wishlist Button */}
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

                {/* Product Image */}
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
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Vendor link */}
                  {product.vendor && (
                    <Link
                      to={`/stores/${product.vendor._id}`}
                      className="text-[11px] font-semibold text-slate-400 hover:text-brand-orange line-clamp-1 mb-1 flex items-center gap-1"
                    >
                      <Store size={12} /> {product.vendor.storeName}
                    </Link>
                  )}

                  <Link
                    to={`/products/${product._id}`}
                    className="text-sm font-bold text-slate-900 hover:text-brand-orange transition-colors line-clamp-2 mb-2"
                  >
                    {product.name}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <StarRating rating={product.rating || 5} size={13} />
                    <span className="text-[11px] text-slate-500 font-semibold">
                      ({product.numReviews || 0})
                    </span>
                  </div>

                  {/* Price & Action */}
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
      </section>

      {/* Featured Vendors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                <Store size={16} />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-navy-950">Featured Stores & Brands</h2>
            </div>
            <p className="text-xs text-slate-500">Verified independent vendors delivering top-tier quality</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all"
            >
              {/* Banner */}
              <div className="h-28 bg-slate-200 overflow-hidden relative">
                <img
                  src={vendor.storeBanner}
                  alt={vendor.storeName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle size={10} /> Verified Merchant
                </span>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center -mt-8">
                <img
                  src={vendor.storeLogo}
                  alt={vendor.storeName}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-navy-950">{vendor.storeName}</h3>
                    <StarRating rating={vendor.rating} size={12} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{vendor.storeDescription}</p>
                </div>
                <Link
                  to={`/stores/${vendor._id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-navy-900 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 flex-shrink-0"
                >
                  Visit Store <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
