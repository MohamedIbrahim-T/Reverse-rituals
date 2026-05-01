import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Preloader from './components/Preloader';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import OrdersPage from './pages/OrdersPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';


import VisitTracker from './components/VisitTracker';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Preloader />
        <BrowserRouter>
          <VisitTracker />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="product/:id" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="admin" element={<AdminPage />} />


            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
