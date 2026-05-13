import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingCart from './FloatingCart';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Layout = () => {
  const { pathname } = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { cartItems } = useCart();

  const isCartActiveOnMobile = cartItems.length > 0 && !['/cart', '/checkout'].includes(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen text-[#1a1a1a] overflow-x-hidden">
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
      <FloatingCart />
      <Footer />

      {/* Scroll to Top Button */}
      {/* {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-28 right-6 z-50 w-12 h-12 bg-[#c5a059] rounded-full flex items-center justify-center shadow-lg hover:bg-[#064e3b] transition-all hover:scale-110 animate-fade-in"
        >
          <ChevronUp size={24} className="text-white" />
        </button>
      )} */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        enableProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="custom-toast-container"
        style={{ zIndex: 99999 }}
      />
    </div>
  );
};

export default Layout;
