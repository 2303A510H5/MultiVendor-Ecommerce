import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  LayoutDashboard,
  Package,
  Store,
  LogOut,
  Menu,
  X,
  FileBarChart,
  ShieldAlert,
} from 'lucide-react';

const Navbar = () => {
  const { user, vendor, isAuthenticated, isAdmin, isVendor, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-lg border-b border-navy-800">
      {/* Top Banner */}
      <div className="bg-navy-950 py-1 px-4 text-xs text-slate-300 border-b border-navy-800/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>✨ Welcome to ShopVerse Multi-Vendor Marketplace</span>
            <span className="hidden md:inline">| Free shipping on orders over ₹1,000</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            {!isAuthenticated ? (
              <Link to="/vendor/register" className="text-orange-400 hover:text-orange-300 transition-colors">
                Sell on ShopVerse (Become a Vendor)
              </Link>
            ) : isVendor ? (
              <span className="text-emerald-400">
                Store: {vendor?.storeName || 'Vendor Portal'}
              </span>
            ) : isAdmin ? (
              <span className="text-amber-400 font-bold">Admin Console</span>
            ) : (
              <Link to="/vendor/register" className="text-orange-400 hover:text-orange-300 transition-colors">
                Open a Vendor Store
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center shadow-md">
              <ShoppingBag className="text-white" size={22} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">Shop<span className="text-brand-orange">Verse</span></span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">Multi-Vendor</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-navy-800/90 text-white placeholder-slate-400 text-sm pl-4 pr-11 py-2 rounded-xl border border-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
              />
              <button
                type="submit"
                aria-label="Search products"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-orange hover:bg-brand-orangeHover text-white p-1.5 rounded-lg transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Catalog link */}
            <Link
              to="/products"
              className="hidden lg:flex items-center text-sm font-semibold text-slate-200 hover:text-brand-orange transition-colors"
            >
              Browse All
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
              title="Wishlist"
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-orange text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-slate-300">Cart</span>
            </Link>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-navy-800 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-600"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white line-clamp-1">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      </div>

                      {/* Admin Links */}
                      {isAdmin && (
                        <div className="py-1 border-b border-slate-100">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                          >
                            <LayoutDashboard size={16} /> Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/reports"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                          >
                            <FileBarChart size={16} /> Platform Reports
                          </Link>
                        </div>
                      )}

                      {/* Vendor Links */}
                      {isVendor && (
                        <div className="py-1 border-b border-slate-100">
                          <Link
                            to="/vendor/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                          >
                            <LayoutDashboard size={16} /> Vendor Dashboard
                          </Link>
                          <Link
                            to="/vendor/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                          >
                            <Package size={16} /> My Products
                          </Link>
                          <Link
                            to="/vendor/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                          >
                            <ShoppingBag size={16} /> Vendor Orders
                          </Link>
                          <Link
                            to="/vendor/reports"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                          >
                            <FileBarChart size={16} /> Vendor Reports
                          </Link>
                        </div>
                      )}

                      {/* Customer / Common Links */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                        >
                          <User size={16} /> Profile & Addresses
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                        >
                          <Package size={16} /> Order History
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-brand-orange hover:bg-brand-orangeHover text-white rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 px-4 pt-3 pb-5 space-y-3 border-t border-navy-800">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-navy-800 text-white placeholder-slate-400 text-sm px-4 py-2 rounded-lg border border-navy-700"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-orange text-white p-1 rounded-md"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium pt-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-brand-orange"
            >
              Browse Catalog
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-brand-orange"
            >
              Wishlist ({wishlistCount})
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-200 hover:text-brand-orange"
            >
              Shopping Cart ({cartCount})
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-amber-400 font-bold"
              >
                Admin Dashboard
              </Link>
            )}
            {isVendor && (
              <Link
                to="/vendor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-emerald-400 font-bold"
              >
                Vendor Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/vendor/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-orange-400 font-semibold"
              >
                Become a Vendor
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
