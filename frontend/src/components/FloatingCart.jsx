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
      {/* 1. UNIFIED FLOATING BOTTOM BAR (Mobile Only) */}
      <div className="fixed bottom-4 left-3 right-3 z-50 md:hidden flex items-stretch gap-1.5 pointer-events-none">
        {/* Cart Section - Expands to fill width */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex-1 pointer-events-auto bg-[#064e3b]/95 backdrop-blur-xl text-white p-1 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4 xs:gap-8 border border-white/10 overflow-hidden"
            >
              {/* Left Side: Summary */}
              <div className="flex items-center gap-2.5 pl-2 py-1.5 shrink-0">
                <div className="bg-[#c5a059]/20 p-2 rounded-xl shrink-0 border border-[#c5a059]/30">
                  <ShoppingCart size={16} className="text-[#c5a059]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black tracking-tight leading-tight whitespace-nowrap">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                  <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold leading-tight">Your Ritual</span>
                </div>
              </div>

              {/* Right Side: Price + Cart (Merged for Space) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-[#c5a059] text-white h-11 px-3 xs:px-4 rounded-[16px] flex items-center gap-2.5 hover:bg-[#b38f4d] transition-all active:scale-95 shadow-lg shadow-[#c5a059]/20 group shrink-0"
              >
                <div className="flex flex-col items-end pr-2 border-r border-white/20">
                  <span className="text-[12px] font-black leading-none">₹{cartTotal.toLocaleString()}</span>
                  <span className="text-[9px] uppercase font-bold text-white/60 mt-0.5 leading-none">Total</span>
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest flex items-center gap-3">
                  Cart
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Button - Fixed size, always present */}
        <a
          href="https://wa.me/917358422064"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto shrink-0 w-14 h-14 bg-[#064e3b] text-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 hover:bg-[#053d2f] transition-all hover:scale-105 ml-auto"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>

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
