import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ShoppingCart, ArrowRight, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const FloatingCart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Don't show floating elements on cart or checkout pages
  const isHidePage = location.pathname === '/cart' || location.pathname === '/checkout';

  if (isHidePage) return null;

  return (
    <>
      {/* 1. COMPACT FLOATING CART BAR (Mobile Style, Premium) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed left-4 right-24 md:right-[100px] md:left-auto bottom-6 z-50"
          >
            <div className="bg-[#064e3b]/95 backdrop-blur-lg text-white p-2 pl-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-white/10 ring-1 ring-white/5">
              <div className="flex flex-col">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-black leading-none mb-1">Ritual</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                  <span className="text-white/10">|</span>
                  <span className="font-black text-xs text-[#c5a059]">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#c5a059] text-white h-9 px-4 rounded-lg font-black text-[10px] flex items-center gap-1.5 hover:bg-[#b38f4d] transition-all active:scale-95 shadow-lg shadow-[#c5a059]/20 group uppercase tracking-wider"
              >
                View 
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP SIDEBAR DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden md:block"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white z-[110] shadow-2xl flex flex-col border-l border-[#064e3b]/5"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#064e3b]/5 flex items-center justify-between bg-[#fdfbf7]">
                <div>
                  <h2 className="text-xl font-black text-[#064e3b] flex items-center gap-2">
                    <ShoppingCart className="text-[#c5a059]" /> My Cart
                  </h2>
                  <p className="text-xs text-[#064e3b]/40 font-bold uppercase tracking-widest mt-1">
                    {totalItems} Items in selection
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-[#064e3b]/5 rounded-full transition-colors text-[#064e3b]"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-[#fdfbf7] rounded-full flex items-center justify-center">
                      <ShoppingBag size={40} className="text-[#064e3b]/10" />
                    </div>
                    <div>
                      <p className="font-bold text-[#064e3b]">Your cart is empty</p>
                      <p className="text-sm text-[#064e3b]/40">Add some rituals to your routine</p>
                    </div>
                    <button
                      onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                      className="px-6 py-2 bg-[#064e3b] text-white rounded-full text-sm font-bold hover:bg-[#c5a059] transition-all"
                    >
                      Shop Now
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 p-4 bg-[#fdfbf7] rounded-2xl border border-[#064e3b]/5 group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#064e3b]/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[#064e3b] text-sm truncate">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <p className="text-[#c5a059] font-black text-sm mb-3">₹{item.price.toLocaleString()}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-white border border-[#064e3b]/10 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, item.qty - 1)}
                              className="p-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={12} className="text-[#064e3b]" />
                            </button>
                            <span className="px-3 text-xs font-bold text-[#064e3b]">{item.qty}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.qty + 1)}
                              className="p-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={12} className="text-[#064e3b]" />
                            </button>
                          </div>

                          <span className="font-black text-[#064e3b] text-sm">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-[#fdfbf7] border-t border-[#064e3b]/5 space-y-4">
                  <div className="flex justify-between items-center text-[#064e3b]">
                    <span className="text-sm font-bold opacity-60">Subtotal</span>
                    <span className="text-2xl font-black">₹{cartTotal.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setIsCartOpen(false); navigate('/cart'); }}
                      className="w-full py-4 bg-white border border-[#064e3b]/10 text-[#064e3b] font-bold rounded-2xl hover:bg-white transition-all text-sm"
                    >
                      View Full Cart
                    </button>
                    <button
                      onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                      className="w-full py-4 bg-[#064e3b] text-white font-bold rounded-2xl hover:bg-[#c5a059] transition-all text-sm shadow-xl shadow-[#064e3b]/10"
                    >
                      Checkout Now
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-[#064e3b]/40 font-bold uppercase tracking-widest">
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCart;
