import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shippingFee: 0,
    grandTotal: 0,
    itemsCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever customer logs in
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, shippingFee: 0, grandTotal: 0, itemsCount: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success) {
        setCart(res.cart);
      }
    } catch (err) {
      console.warn('Cart fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.success) {
        setCart(res.cart);
        toast.success(res.message || 'Added to cart!');
        return true;
      }
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.success) {
        setCart(res.cart);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.success) {
        setCart(res.cart);
        toast.success('Item removed from cart');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.success) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount: cart.itemsCount || 0,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
