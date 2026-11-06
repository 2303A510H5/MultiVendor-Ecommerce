import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/users/wishlist');
      if (res.success) {
        setWishlist(res.products || []);
      }
    } catch (err) {
      console.warn('Wishlist fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to save items to your wishlist');
      return;
    }
    const productId = typeof product === 'object' ? product._id : product;

    try {
      const res = await api.post('/users/wishlist/toggle', { productId });
      if (res.success) {
        if (res.isInWishlist) {
          toast.success('Added to wishlist ❤️');
          if (typeof product === 'object') {
            setWishlist((prev) => [product, ...prev]);
          } else {
            fetchWishlist();
          }
        } else {
          toast.success('Removed from wishlist');
          setWishlist((prev) => prev.filter((p) => p._id !== productId));
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => (p._id || p) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
