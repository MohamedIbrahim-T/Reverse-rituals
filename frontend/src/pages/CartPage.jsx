import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, Package, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { cartItems, removeFromCart, cartTotal, updateQuantity } = useCart();
  const navigate = useNavigate();

  const finalTotal = cartTotal;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] pt-32 pb-20 px-6 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 bg-[#064e3b]/5 rounded-full flex items-center justify-center">
            <ShoppingCart size={64} className="text-[#064e3b]/20" />
          </div>
          <div className="absolute inset-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-2xl animate-pulse"></div>
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-black text-[#064e3b] mb-4">Your Cart is Empty</h2>
        <p className="text-[#064e3b]/50 text-lg mb-8 max-w-md text-center font-medium">Start your hair transformation journey by adding our botanical rituals to your selection.</p>
        <Link to="/shop" className="px-8 py-4 bg-[#064e3b] text-white rounded-full font-bold hover:bg-[#c5a059] transition-all flex items-center gap-3 shadow-xl shadow-[#064e3b]/10">
          <ArrowLeft size={20} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-28 pb-32 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[#064e3b]/50 hover:text-[#064e3b] mb-6 font-bold text-xs uppercase tracking-[0.2em] transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-[#064e3b] leading-tight">My Ritual <span className="text-[#c5a059]">Bag</span></h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="bg-[#064e3b] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
                <span className="text-[#064e3b]/30 text-sm font-medium">Ready for checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-[#064e3b]/5 hover:shadow-2xl hover:border-[#c5a059]/20 transition-all duration-500"
                  >
                    <div className="flex gap-5 md:gap-8">
                      {/* Image */}
                      <div className="w-24 md:w-36 aspect-square rounded-2xl overflow-hidden bg-[#fdfbf7] shrink-0 border border-[#064e3b]/5 group-hover:scale-[1.02] transition-transform duration-500">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-black text-[#064e3b] text-lg md:text-xl leading-tight group-hover:text-[#c5a059] transition-colors">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="p-2 -mt-2 -mr-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                              title="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <p className="text-[#064e3b]/40 text-sm font-bold mt-1">₹{item.price.toLocaleString()} per unit</p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center bg-[#fdfbf7] rounded-xl p-1 border border-[#064e3b]/5">
                            <button
                              onClick={() => updateQuantity(item._id, item.qty - 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#064e3b] hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                              disabled={item.qty <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-black text-[#064e3b] w-10 text-center text-sm">{item.qty}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.qty + 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#064e3b] hover:bg-white hover:shadow-sm transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-[#064e3b]/30 tracking-widest mb-1">Subtotal</p>
                            <span className="font-black text-[#c5a059] text-xl md:text-2xl tracking-tight">₹{(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-[#064e3b]/5">
               {[
                 { icon: <ShieldCheck size={20} />, title: "Secure Pay", desc: "Encrypted" },
                 { icon: <Truck size={20} />, title: "Trackable", desc: "Live status" },
                 { icon: <Package size={20} />, title: "Authentic", desc: "100% Pure" },
                 { icon: <Plus size={20} />, title: "Support", desc: "24/7 Help" }
               ].map((badge, i) => (
                 <div key={i} className="text-center">
                    <div className="text-[#c5a059] mb-2 flex justify-center">{badge.icon}</div>
                    <p className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest mb-0.5">{badge.title}</p>
                    <p className="text-[9px] text-[#064e3b]/40 font-medium">{badge.desc}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl border border-[#064e3b]/5 sticky top-28 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-[5rem]"></div>
              
              <h3 className="text-2xl font-black text-[#064e3b] mb-8 relative">Summary</h3>

              <div className="space-y-5 mb-8 relative">
                <div className="flex justify-between items-center text-[#064e3b]/60">
                  <span className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Package size={16} className="text-[#c5a059]" /> Selection Total</span>
                  <span className="font-black text-lg text-[#064e3b]">₹{cartTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-start text-[#064e3b]/60">
                  <span className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Truck size={16} className="text-[#c5a059]" /> Shipping Estimate</span>
                  <div className="text-right">
                    <span className="text-[#c5a059] font-black text-sm uppercase tracking-widest">Calculated at next step</span>
                    <p className="text-[10px] font-medium text-[#064e3b]/30 mt-1 max-w-[180px]">Free shipping available for Tamil Nadu & Puducherry</p>
                  </div>
                </div>

                <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#064e3b]/5 space-y-2">
                  <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] mb-2">Shipping Zones</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> TN / PY: FREE
                    </div>
                    <div className="flex items-center gap-2 text-[#064e3b]/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></div> South: ₹49
                    </div>
                    <div className="flex items-center gap-2 text-[#064e3b]/60 col-span-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#064e3b]/20"></div> Other States: ₹99
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#064e3b]/10 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.3em] block mb-1">Total Amount</span>
                    <span className="text-sm font-medium text-[#064e3b]/40">Exclusive of shipping</span>
                  </div>
                  <span className="text-4xl font-black text-[#c5a059] tracking-tighter">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-6 bg-[#064e3b] text-white rounded-2xl font-black text-lg hover:bg-[#c5a059] transition-all flex items-center justify-center gap-4 group shadow-xl shadow-[#064e3b]/20 relative overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                Proceed to Checkout
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </button>

              {/* Payment Method Logos */}
              <div className="mt-8 pt-8 border-t border-[#064e3b]/5 text-center">
                <p className="text-[#064e3b]/20 text-[10px] font-black uppercase tracking-[0.3em] mb-5">Accepted Payment Methods</p>
                <div className="flex items-center justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                  <img src={new URL('../assets/GPAY.jpeg', import.meta.url).href} alt="GPay" className="h-6 grayscale hover:grayscale-0 transition-all" />
                  <img src={new URL('../assets/PAYTYM.jpeg', import.meta.url).href} alt="Paytm" className="h-6 grayscale hover:grayscale-0 transition-all" />
                  <img src={new URL('../assets/PHONEPE.png', import.meta.url).href} alt="PhonePe" className="h-6 grayscale hover:grayscale-0 transition-all" />
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">
                  <Lock size={10} /> Secure checkout with Razorpay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;