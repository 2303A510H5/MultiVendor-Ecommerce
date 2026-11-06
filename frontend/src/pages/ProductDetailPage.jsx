import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Heart,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowRight,
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [userRating, setUserRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, isCustomer } = useAuth();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.success) {
        setProduct(res.product);
        setReviews(res.reviews || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(product._id, quantity);
    return success;
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      navigate('/checkout');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please provide review comments');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: userRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.success) {
        toast.success('Thank you! Your review has been posted.');
        setReviewTitle('');
        setReviewComment('');
        fetchProduct(); // refresh ratings and review list
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading product details..." />;
  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="text-brand-orange text-sm font-semibold mt-2 inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const savings = hasDiscount ? product.price - product.discountPrice : 0;
  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-lg shadow-sm">
                SAVE {Math.round((savings / product.price) * 100)}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Meta & Actions */}
        <div className="flex flex-col space-y-5">
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Category: <strong className="text-slate-700">{product.category?.name || 'General'}</strong></span>
            <span>SKU: <strong className="font-mono text-slate-700">{product.sku}</strong></span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-navy-950 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              <StarRating rating={product.rating || 5} size={15} />
              <span className="text-xs font-bold text-amber-900">{product.rating || 5} / 5</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Based on {product.numReviews || reviews.length} verified reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-baseline gap-3">
            <span className="text-3xl font-black text-navy-950">
              {formatCurrency(effectivePrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  You save {formatCurrency(savings)}
                </span>
              </>
            )}
          </div>

          {/* Stock Alert Pill */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                <AlertTriangle size={14} /> Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 animate-pulse">
                <AlertTriangle size={14} /> Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                <CheckCircle2 size={14} /> In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>

          {/* Quantity & Actions */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-navy-950 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="flex-1 py-3 px-6 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                inWishlist
                  ? 'border-rose-300 bg-rose-50 text-rose-500'
                  : 'border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
              title="Save to Wishlist"
            >
              <Heart size={20} className={inWishlist ? 'fill-rose-500' : ''} />
            </button>
          </div>

          {/* Vendor Card */}
          {product.vendor && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={product.vendor.storeLogo}
                  alt={product.vendor.storeName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white"
                />
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Sold & Shipped By</p>
                  <Link
                    to={`/stores/${product.vendor._id}`}
                    className="text-sm font-extrabold text-navy-950 hover:text-brand-orange transition-colors flex items-center gap-1"
                  >
                    {product.vendor.storeName} <ArrowRight size={12} />
                  </Link>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={product.vendor.rating || 5} size={11} />
                    <span className="text-[10px] text-slate-500 font-bold">Store Rating</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/stores/${product.vendor._id}`}
                className="px-3 py-1.5 text-xs font-bold text-navy-900 border border-slate-300 hover:bg-white rounded-lg transition-colors"
              >
                View Store
              </Link>
            </div>
          )}

          {/* Delivery & Trust Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-slate-500">
            <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
              <Truck size={16} className="text-brand-orange" />
              <span>Express Delivery</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
              <RotateCcw size={16} className="text-brand-orange" />
              <span>7 Days Return</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
              <ShieldCheck size={16} className="text-brand-orange" />
              <span>Razorpay Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Form Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-black text-navy-950">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500">Real feedback from verified purchasers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-black text-navy-950">{product.rating || 5.0}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Average Rating</p>
            </div>
            <StarRating rating={product.rating || 5} size={20} />
          </div>
        </div>

        {/* Review Submission Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70">
          <h3 className="text-sm font-bold text-navy-900 mb-3">Write a Customer Review</h3>
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
                <StarRating
                  rating={userRating}
                  size={22}
                  interactive
                  onRatingChange={(r) => setUserRating(r)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional sound and comfortable fit!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Review *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details of your experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={14} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-slate-500 mb-2">Please sign in to share your product review</p>
              <Link to="/login" className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl inline-block">
                Sign In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rev.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(rev.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={rev.rating} size={13} />
                </div>
                {rev.title && <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
