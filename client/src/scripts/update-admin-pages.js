/**
 * This script updates all admin pages to remove the AdminLayout wrapper
 * since it's now being applied in the AdminRoutes component.
 * 
 * Admin pages to update:
 * - UsersPage.jsx
 * - ProductsPage.jsx
 * - OrdersPage.jsx
 * - ProductFormPage.jsx
 * - CategoriesPage.jsx
 * - AdminOrderDetailsPage.jsx
 * - SettingsPage.jsx
 * 
 * For each page:
 * 1. Remove the import for AdminLayout
 * 2. Remove the AdminLayout wrapper from the JSX
 * 3. Replace the AdminLayout wrapper with a React Fragment (<> </>) if needed
 */

// Example of how to update a page:
/*
// Before:
import AdminLayout from '../../components/layout/AdminLayout';

return (
  <AdminLayout>
    <div>Content</div>
  </AdminLayout>
);

// After:
return (
  <>
    <div>Content</div>
  </>
);
*/
