import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PrivateRoute, AdminRoute } from './components/auth/PrivateRoute';
import { fetchCart } from './redux/slices/cartSlice';

// Pages
import HomePage          from './pages/HomePage';
import ProductsPage      from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import OrderDetailPage   from './pages/OrderDetailPage';
import MyOrdersPage      from './pages/MyOrdersPage';
import ProfilePage       from './pages/ProfilePage';
import MathPage          from './pages/MathPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

// Admin Pages
import AdminDashboardPage   from './pages/admin/AdminDashboardPage';
import AdminProductsPage    from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage      from './pages/admin/AdminOrdersPage';
import AdminUsersPage       from './pages/admin/AdminUsersPage';

const App = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);

  // Fetch cart on login
  useEffect(() => {
    if (userInfo) dispatch(fetchCart());
  }, [userInfo, dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/"         element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/math"     element={<MathPage />} />

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/cart"     element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders"   element={<MyOrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile"  element={<ProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"                         element={<AdminDashboardPage />} />
              <Route path="/admin/products"                element={<AdminProductsPage />} />
              <Route path="/admin/products/new"            element={<AdminProductFormPage />} />
              <Route path="/admin/products/:id/edit"       element={<AdminProductFormPage />} />
              <Route path="/admin/orders"                  element={<AdminOrdersPage />} />
              <Route path="/admin/users"                   element={<AdminUsersPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center py-24">
                <div className="text-8xl mb-4">404</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary inline-block">Go Home</a>
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-xl shadow-lg text-sm"
      />
    </Router>
  );
};

export default App;
