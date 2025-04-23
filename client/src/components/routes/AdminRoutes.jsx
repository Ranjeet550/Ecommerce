import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../layout/AdminLayout';

// Admin Pages
import DashboardPage from '../../pages/admin/DashboardPage';
import AdminProductsPage from '../../pages/admin/ProductsPage';
import ProductFormPage from '../../pages/admin/ProductFormPage';
import CategoriesPage from '../../pages/admin/CategoriesPage';
import AdminOrdersPage from '../../pages/admin/OrdersPage';
import AdminOrderDetailsPage from '../../pages/admin/OrderDetailsPage';
import UsersPage from '../../pages/admin/UsersPage';
import SettingsPage from '../../pages/admin/SettingsPage';

const AdminRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<AdminProductsPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/edit/:id" element={<ProductFormPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="/orders/:id" element={<AdminOrderDetailsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
