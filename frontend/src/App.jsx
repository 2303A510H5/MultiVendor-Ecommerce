import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Customer & Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StorefrontPage from './pages/StorefrontPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Vendor Pages
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorProductFormPage from './pages/vendor/VendorProductFormPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorReturnsPage from './pages/vendor/VendorReturnsPage';
import VendorReportsPage from './pages/vendor/VendorReportsPage';
import VendorStoreSettingsPage from './pages/vendor/VendorStoreSettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVendorsPage from './pages/admin/AdminVendorsPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminReturnsPage from './pages/admin/AdminReturnsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0B1D3A',
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
          },
        }}
      />
      <Navbar />

      <div className="flex-1">
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/stores/:id" element={<StorefrontPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vendor/register" element={<VendorRegisterPage />} />

          {/* Authenticated Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Vendor Portal Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products/new"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/returns"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorReturnsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/reports"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/settings"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorStoreSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVendorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/returns"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReturnsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
