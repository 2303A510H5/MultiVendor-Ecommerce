import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import {
  Filter,
  SlidersHorizontal,
  Search,
  X,
  Heart,
  ShoppingBag,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters from URL
  const currentKeyword = searchParams.get('keyword') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentVendor = searchParams.get('vendor') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentMinRating = searchParams.get('minRating') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Load categories and vendors for filters
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, vendRes] = await Promise.all([
          api.get('/categories'),
          api.get('/vendors'),
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (vendRes.success) setVendors(vendRes.vendors);
      } catch (err) {
        console.error('Metadata error:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products matching filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        const res = await api.get(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.products);
          setTotalPages(res.pages);
          setTotalProducts(res.total);
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Filter update helper
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== '' && value !== null && value !== undefined) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Marketplace Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} of {totalProducts} verified products
            {currentKeyword && ` for "${currentKeyword}"`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm"
          >
            <Filter size={16} /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold hidden sm:inline">Sort By:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-brand-orange" /> Filter Products
            </h3>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-slate-400 hover:text-brand-orange transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Category</h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !currentCategory ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => updateFilter('category', cat.slug || cat._id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentCategory === cat.slug || currentCategory === cat._id
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Vendor Store</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              <button
                type="button"
                onClick={() => updateFilter('vendor', '')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !currentVendor ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Vendors
              </button>
              {vendors.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => updateFilter('vendor', v._id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentVendor === v._id ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {v.storeName}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Price Range (₹)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={currentMinPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Max"
                value={currentMaxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Customer Rating</h4>
            <div className="space-y-1 text-xs">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => updateFilter('minRating', currentMinRating === String(stars) ? '' : stars)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    currentMinRating === String(stars) ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={stars} size={13} />
                    <span>& up</span>
                  </div>
                  {currentMinRating === String(stars) && <span className="text-brand-orange">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {loading ? (
            <Loader message="Loading catalog items..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products match your criteria"
              description="Try adjusting your keyword, categories, or price filter to find what you're looking for."
              actionText="Reset Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
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

                      <div className="p-4 flex-1 flex flex-col">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-navy-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
