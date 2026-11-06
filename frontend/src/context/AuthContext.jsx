import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('shopverse_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on startup
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.user);
          setVendor(res.vendor || null);
        }
      } catch (err) {
        console.warn('Session expired or token invalid:', err.message);
        localStorage.removeItem('shopverse_token');
        setToken(null);
        setUser(null);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('shopverse_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setVendor(res.vendor || null);
      toast.success(`Welcome back, ${res.user.name}!`);
      return res;
    }
  };

  // Register Customer or Vendor user
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success) {
      localStorage.setItem('shopverse_token', res.token);
      setToken(res.token);
      setUser(res.user);
      toast.success('Registration successful! Welcome to ShopVerse.');
      return res;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('shopverse_token');
    setToken(null);
    setUser(null);
    setVendor(null);
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.user }));
      toast.success('Profile updated');
      return res.user;
    }
  };

  // Refresh user data (e.g. after vendor application)
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.user);
        setVendor(res.vendor || null);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isVendor: user?.role === 'vendor',
        isCustomer: user?.role === 'customer',
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
