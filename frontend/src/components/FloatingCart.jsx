import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ShoppingCart, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
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
      {/* 1. MOBILE BOTTOM BAR (Zomato style) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-[60] md:hidden"
          >
            <div className="bg-[#064e3b] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-lg bg-[#064e3b]/95">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Your Ritual</p>
                  <p className="font-black text-sm">{totalItems} {totalItems === 1 ? 'Item' : 'Items'} <span className="mx-1 text-white/30">|</span> ₹{cartTotal.toLocaleString()}</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/cart')}
                className="bg-[#c5a059] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#b38f4d] transition-all active:scale-95 shadow-lg shadow-black/20"
              >
                View Cart <ArrowRight size={16} />
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
              className="fixed top-0 right-0 h-full w-[400px] bg-white z-[110] shadow-2xl flex flex-col hidden md:flex border-l border-[#064e3b]/5"
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
