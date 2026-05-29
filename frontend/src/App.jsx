import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import OrderBookingPage from './pages/OrderBookingPage';
import PosterGeneratorPage from './pages/PosterGeneratorPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import AdminContactsPage from './pages/AdminContactsPage';
import AboutManagementPage from './pages/AboutManagementPage';
import TestimonialsManagementPage from './pages/TestimonialsManagementPage';
import FooterManagementPage from './pages/FooterManagementPage';
import Layout from './components/Layout';

const App = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('shopsweet_user');
    return stored ? JSON.parse(stored) : null;
  });

  const requireAuth = (element) => {
    return user ? element : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/login" element={<LoginPage onLogin={(user) => { setUser(user); localStorage.setItem('shopsweet_user', JSON.stringify(user)); }} />} />
      <Route path="/order" element={<OrderBookingPage />} />
      <Route path="/poster-generator" element={<PosterGeneratorPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/products" element={<ProductsPage user={user} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={requireAuth(<Layout user={user} onLogout={() => { setUser(null); localStorage.removeItem('shopsweet_user'); }} />)}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage user={user} dashboardMode />} />
        <Route path="products/:sku" element={<ProductDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="about" element={<AboutManagementPage user={user} />} />
        <Route path="testimonials" element={<TestimonialsManagementPage />} />
        <Route path="footer" element={<FooterManagementPage />} />
        <Route path="contacts" element={<AdminContactsPage />} />
        <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="settings"
          element={
            <SettingsPage
              user={user}
              onUserUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('shopsweet_user', JSON.stringify(updatedUser));
              }}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
