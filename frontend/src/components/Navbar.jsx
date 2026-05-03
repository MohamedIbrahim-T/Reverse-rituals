import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

const WHATSAPP_NUMBER = "917358422064";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
    window.location.reload();
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Our Story', path: '/about' },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!user) {
      setLastOrder(null);
      return;
    }

    if (!user.token) return;

    const latestOrderStr = localStorage.getItem('latestOrder');
    if (latestOrderStr) {
      try {
        const latestOrder = JSON.parse(latestOrderStr);
        setLastOrder(latestOrder);
        localStorage.removeItem('latestOrder');
      } catch (e) { console.log(e); }
    }

    const fetchLastOrder = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (data.length > 0 && data[0].isPaid && (!lastOrder || lastOrder._id !== data[0]._id)) {
          setLastOrder(data[0]);
        }
      } catch (err) {
        console.log('No orders found');
      }
    };
    fetchLastOrder();
  }, [user]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md z-50 border-b border-[#064e3b]/10">

        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between relative">

          {/* LEFT - MENU */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-[#064e3b]/5 transition z-10"
          >
            {isMenuOpen ? (
              <X size={24} className="text-[#064e3b]" />
            ) : (
              <Menu size={24} className="text-[#064e3b]" />
            )}
          </button>

          {/* CENTER LOGO (MOBILE PERFECT CENTER) */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 md:hidden"
          >
            <img
              src="/rr-logo.png"
              alt="Reverse Rituals"
              className="h-10 object-contain"
            />
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center justify-between w-full">

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="w-14 lg:w-16 transition-transform group-hover:scale-110">
                <img src="/rr-logo.png" alt="Reverse Rituals" className="w-full object-contain" />
              </div>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-10 text-[13px] uppercase tracking-[0.2em] font-semibold text-[#064e3b]">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="relative group">
                  <motion.span whileHover={{ scale: 1.05 }}>
                    {link.name}
                  </motion.span>
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#c5a059] transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">

              {/* Track Order */}
              <Link
                to="/track-order"
                className="px-3 py-2 text-[#064e3b] text-sm font-medium hover:text-[#c5a059] transition"
              >
                Track Order
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-[#064e3b]/5 transition">
                <ShoppingCart size={20} className="text-[#064e3b]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c5a059] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile / Logout - Only show if logged in */}
              {user && (
                <div className="flex items-center gap-2">
                  <Link
                    to={user.isAdmin ? "/admin" : "/orders"}
                    className="p-2 rounded-full hover:bg-[#064e3b]/5 transition"
                  >
                    <User size={20} className="text-[#064e3b]" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-red-500 text-sm font-medium hover:bg-red-50 rounded-full transition"
                  >
                    Logout
                  </button>
                </div>
              )}

            </div>
          </div>

{/* RIGHT - MOBILE */}
          <div className="md:hidden flex items-center gap-1">

            {/* Track Order - Mobile */}
            <Link
              to="/track-order"
              className="px-2 py-1 text-[#064e3b] text-xs font-medium hover:text-[#c5a059] transition"
            >
              Track
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-[#064e3b]/5 transition">
              <ShoppingCart size={20} className="text-[#064e3b]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c5a059] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile - Only show if logged in */}
            {user && (
              <Link
                to={user.isAdmin ? "/admin" : "/orders"}
                className="p-2 rounded-full hover:bg-[#064e3b]/5 transition"
              >
                <User size={20} className="text-[#064e3b]" />
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-[300px] bg-white z-[110] shadow-xl flex flex-col"
            >

              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img src="/rr-logo.png" alt="logo" className="h-10" />
                </Link>

                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 p-5 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg hover:bg-gray-100"
                  >
                    {link.name}
                  </Link>
                ))}

                <hr />

                {user && (
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 py-3 px-4"
                  >
                    <Package size={18} /> My Orders
                  </Link>
                )}

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  className="flex items-center gap-2 py-3 px-4 text-green-600"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>

                <Link
                  to="/track-order"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-3 px-4 text-[#064e3b]"
                >
                  <Package size={18} /> Track Order
                </Link>

                {/* Logout - Mobile Sidebar */}
                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 py-3 px-4 text-red-600 w-full text-left"
                  >
                    <User size={18} /> Logout
                  </button>
                )}
              </div>

              {/* Bottom */}
              <div className="p-5 border-t">
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-[#064e3b] text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> View Cart
                </Link>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
};

export default Navbar;