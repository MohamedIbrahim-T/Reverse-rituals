import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, Package, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { cartItems, removeFromCart, cartTotal, updateQuantity } = useCart();
  const navigate = useNavigate();


  const finalTotal = cartTotal;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] pt-32 pb-20 px-6 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-[#064e3b]/5 rounded-full flex items-center justify-center">
            <ShoppingCart size={64} className="text-[#064e3b]/20" />
          </div>
          <div className="absolute inset-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-2xl"></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[#064e3b] mb-4">Your Cart is Empty</h2>
        <p className="text-[#064e3b]/50 text-lg mb-8 max-w-md text-center">Start your hair transformation journey by adding our botanical rituas to your cart.</p>
        <Link to="/shop" className="px-8 py-4 bg-[#064e3b] text-white rounded-full font-bold hover:bg-[#c5a059] transition-all flex items-center gap-3">
          <ArrowLeft size={20} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-28 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[#064e3b]/50 hover:text-[#064e3b] mb-4 font-medium text-sm">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-[#064e3b]">Your <span className="text-[#c5a059]">Ritual</span> Cart</h1>
          <p className="text-[#064e3b]/50 mt-2">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your ritual</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-[#064e3b]/5 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                    {/* Image */}
                    <div className="w-full sm:w-28 md:w-32 h-28 md:h-32 rounded-xl md:rounded-2xl overflow-hidden bg-[#fdfbf7]">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-[#064e3b] text-lg mb-1">{item.name}</h3>
                        <p className="text-[#064e3b]/40 text-sm mb-3">₹{item.price} each</p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item._id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-8 h-8 rounded-full bg-[#fdfbf7] flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-[#064e3b] w-8 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.qty + 1)}
                            className="w-8 h-8 rounded-full bg-[#fdfbf7] flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-4">
                          <span className="font-black text-[#c5a059] text-lg">₹{item.price * item.qty}</span>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-[#064e3b]/5 sticky top-28">
              <h3 className="text-xl font-black text-[#064e3b] mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-[#064e3b]/60">
                  <span className="flex items-center gap-2"><Package size={16} /> Subtotal</span>
                  <span className="font-bold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center text-[#064e3b]/60">
                  <span>Shipping</span>
                  <span className="text-[#c5a059] font-medium text-sm">
                    Calculated at checkout
                  </span>
                </div>

                <div className="p-3 bg-[#fdfbf7] rounded-xl text-xs text-[#064e3b]/60 space-y-1">
                  <p className="font-bold text-[#064e3b]">Shipping Charges:</p>
                  <p>• Tamil Nadu: FREE</p>
                  <p>• Karnataka, AP, Telangana: ₹49</p>
                  <p>• Other States: ₹99</p>
                </div>

              </div>

              <div className="pt-4 border-t border-[#064e3b]/10 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#064e3b]">Total</span>
                  <span className="text-2xl font-black text-[#c5a059]">₹{finalTotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#064e3b] text-white rounded-2xl font-bold hover:bg-[#c5a059] transition-all flex items-center justify-center gap-3 group"
              >
                Proceed to Checkout
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Payment Method Logos */}
              <div className="mt-4 pt-4 border-t border-[#064e3b]/10">
                <p className="text-center text-[#064e3b]/40 text-xs mb-3">Accepting all UPI apps</p>
                <div className="flex items-center justify-center gap-4">
                  <img src="/GPAY.jpeg" alt="Google Pay" className="h-8 w-auto" />
                  <img src="/PAYTYM.jpeg" alt="Paytm" className="h-8 w-auto" />
                  <img src="/PHONEPE.png" alt="PhonePe" className="h-8 w-auto" />
                </div>
              </div>

              <p className="text-center text-[#064e3b]/30 text-xs mt-2">Secure checkout with Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;