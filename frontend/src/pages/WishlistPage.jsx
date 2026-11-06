import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import EmptyState from '../components/common/EmptyState';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our marketplace and click the heart icon on items you love to save them for later."
          actionText="Browse Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-950">My Saved Wishlist</h1>
          <p className="text-xs text-slate-500">
            {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const effectivePrice =
            product.discountPrice > 0 ? product.discountPrice : product.price;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col group relative"
            >
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-rose-500 hover:bg-white"
                title="Remove from Wishlist"
              >
                <Trash2 size={16} />
              </button>

              <Link
                to={`/products/${product._id}`}
                className="block aspect-square bg-slate-100 overflow-hidden"
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="p-4 flex-1 flex flex-col">
                <Link
                  to={`/products/${product._id}`}
                  className="text-sm font-bold text-navy-950 hover:text-brand-orange transition-colors line-clamp-1 mb-1"
                >
                  {product.name}
                </Link>

                <div className="flex items-center gap-1.5 mb-3">
                  <StarRating rating={product.rating || 5} size={12} />
                  <span className="text-[11px] text-slate-400">({product.numReviews || 0})</span>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-base font-black text-navy-950">
                    {formatCurrency(effectivePrice)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product._id, 1);
                    }}
                    className="p-2 bg-navy-900 hover:bg-brand-orange text-white rounded-xl shadow-sm transition-colors"
                    title="Move to cart"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
