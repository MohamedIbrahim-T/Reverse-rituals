import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, Check, ArrowLeft, Minus, Plus, Truck, Shield, Leaf, RotateCcw, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('benefits');
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const isOutOfStock = product?.stockStatus === 'out_of_stock' || product?.countInStock === 0;
  const isLowStock = !isOutOfStock && product?.countInStock <= 10;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    clearCart();
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fdfbf7] pt-32 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#fdfbf7] pt-32 text-center">
      <p className="text-[#064e3b]/50">Product not found</p>
      <Link to="/shop" className="text-[#c5a059] underline mt-4 block">Back to Shop</Link>
    </div>
  );

  const tabs = [
    { id: 'benefits', label: 'Benefits' },
    ...(product.ingredients && product.ingredients.length > 0 ? [{ id: 'ingredients', label: 'Ingredients' }] : []),
    { id: 'how-to-use', label: 'How to Use' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-10 md:pt-28 pb-16 md:pb-20">
      <div className="max-w-6xl mx-auto px-5 md:px-6">

        {/* Breadcrumb */}
        {/* <div className="mb-6 md:mb-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[#064e3b]/50 hover:text-[#c5a059] transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Shop
          </Link>
        </div> */}

        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">

          {/* Image */}
          <div className="relative order-1">
            <div className={`aspect-[4/5] md:aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-lg ${isOutOfStock ? 'opacity-75' : ''}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.tag && (
              <span className="absolute top-3 md:top-4 left-3 md:left-4 px-3 md:px-4 py-1.5 bg-[#c5a059] text-white text-xs font-medium uppercase tracking-wider rounded-full">
                {product.tag}
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-3 md:top-4 right-3 md:right-4 px-3 md:px-4 py-1.5 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Out of Stock
              </span>
            )}
            {isLowStock && (
              <span className="absolute top-3 md:top-4 right-3 md:right-4 px-3 md:px-4 py-1.5 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Only {product.countInStock} left
              </span>
            )}
            {/* {product.originalPrice && (
              <span className="absolute top-3 md:top-4 right-3 md:left-4 px-3 md:px-4 py-1.5 bg-red-500 text-white text-xs font-medium uppercase tracking-wider rounded-full">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )} */}
          </div>

          {/* Product Info */}
          <div className="md:py-2 order-2">
            <p className="text-[#c5a059] font-medium uppercase tracking-wider text-xs md:text-sm mb-2 md:mb-3">
              {product.category || 'Botanical Concentrate'}
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-[#064e3b] mb-4 md:mb-6">
              {product.name}
            </h1>

            {/* Rating */}
            {/* <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} md:size={18} 
                    className={star <= (product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                  />
                ))}
              </div>
              <span className="text-[#064e3b]/50 text-sm">
                {product.rating || 4}.0 ({product.numReviews || 0} reviews)
              </span>
            </div> */}

            <p className="text-[#064e3b]/70 text-base md:text-lg leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 md:gap-4 flex-wrap">
                <span className="text-3xl md:text-4xl font-serif text-[#064e3b]">₹{product.price}</span>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <>
                    <span className="text-lg md:text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                    <span className="text-sm bg-[#c5a059] text-white px-2 py-0.5 rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
              <div className={`flex items-center border border-[#064e3b]/20 rounded-full overflow-hidden w-fit ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 md:w-12 h-10 md:h-12 flex items-center justify-center hover:bg-[#064e3b]/5 transition-colors"
                >
                  <Minus size={16} md:size={18} className="text-[#064e3b]" />
                </button>
                <span className="w-10 md:w-14 text-center font-medium text-[#064e3b]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 md:w-12 h-10 md:h-12 flex items-center justify-center hover:bg-[#064e3b]/5 transition-colors"
                >
                  <Plus size={16} md:size={18} className="text-[#064e3b]" />
                </button>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full font-medium transition-colors ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#064e3b]/5 text-[#064e3b] hover:bg-[#064e3b] hover:text-white'
                  }`}
                >
                  <ShoppingCart size={18} md:size={20} />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full font-medium transition-colors shadow-lg ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-[#c5a059] text-white hover:bg-[#b38f4d] shadow-[#c5a059]/20'
                  }`}
                >
                  {isOutOfStock ? 'Unavailable' : 'Buy Now'}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {[
                { icon: <Truck size={18} />, text: 'Free Shipping' },
                { icon: <Shield size={18} />, text: 'Quality Guaranteed' },
                { icon: <Leaf size={18} />, text: '100% Natural' },

              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[#064e3b]/60 text-xs md:text-sm">
                  <span className="text-[#c5a059]">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-[#064e3b]/10">
          {/* Tab Buttons - Scrollable on mobile */}
          <div className="flex gap-2 md:gap-6 mb-4 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 md:py-4 px-4 md:px-6 border-b-2 transition-colors whitespace-nowrap rounded-lg ${activeTab === tab.id
                    ? 'border-[#c5a059] bg-[#c5a059]/10 text-[#064e3b] font-medium'
                    : 'border-transparent text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-[#064e3b]/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pb-12">
            <AnimatePresence mode="wait">

              {/* Benefits Tab */}
              {activeTab === 'benefits' && (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 md:space-y-6"
                >
                  {product.benefits && product.benefits.length > 0 ? (
                    product.benefits.map((benefit, i) => (
                      <div key={i} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#064e3b]/10 shadow-sm">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-[#c5a059]/10 rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles size={20} md:size={24} className="text-[#c5a059]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-medium text-[#064e3b] mb-1 md:mb-2">
                              {benefit.title}
                            </h3>
                            <p className="text-[#064e3b]/60 text-sm md:text-base mb-3 md:mb-4">
                              {benefit.description}
                            </p>
                            {benefit.points && benefit.points.length > 0 && (
                              <ul className="space-y-2">
                                {benefit.points.map((point, j) => (
                                  <li key={j} className="text-sm md:text-base text-[#064e3b]/70 flex items-start gap-2">
                                    <Check size={14} md:size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#064e3b]/50 p-4">No benefits information available.</p>
                  )}
                </motion.div>
              )}

              {/* Ingredients Tab */}
              {activeTab === 'ingredients' && (
                <motion.div
                  key="ingredients"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 md:space-y-6"
                >
                  {product.ingredients && product.ingredients.length > 0 ? (
                    product.ingredients.map((ing, i) => (
                      <div key={i} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#064e3b]/10 shadow-sm">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                            <Leaf size={20} md:size={24} className="text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-medium text-[#064e3b] mb-1">
                              {ing.name}
                            </h3>
                            <p className="text-[#064e3b]/50 text-sm md:text-base mb-3 md:mb-4">
                              {ing.description}
                            </p>
                            {ing.points && ing.points.length > 0 && (
                              <ul className="space-y-2">
                                {ing.points.map((point, j) => (
                                  <li key={j} className="text-sm md:text-base text-[#064e3b]/70 flex items-start gap-2">
                                    <Check size={14} md:size={16} className="text-green-500 shrink-0 mt-0.5" />
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#064e3b]/50 p-4">No ingredients information available.</p>
                  )}
                </motion.div>
              )}

              {/* How to Use Tab */}
              {activeTab === 'how-to-use' && (
                <motion.div
                  key="how-to-use"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-3xl"
                >
                  <div className="bg-[#064e3b] rounded-xl md:rounded-2xl p-4 md:p-6 text-white mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-medium mb-2">Important Tips</h3>
                    <ul className="space-y-2 text-sm md:text-base text-white/80">
                      <li>• Use 2-3 times per week initially (not daily)</li>
                      <li>• Store in refrigerator (max 5-6 days freshness)</li>
                      <li>• Always strain properly to avoid residue</li>
                      <li>• Do a patch test before regular use</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {product.usageTips ? product.usageTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl border border-[#064e3b]/10">
                        <span className="w-6 md:w-8 h-6 md:h-8 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center font-medium text-xs md:text-sm shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm md:text-base text-[#064e3b]/70">{tip}</span>
                      </div>
                    )) : (
                      <>
                        <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl border border-[#064e3b]/10">
                          <span className="w-6 md:w-8 h-6 md:h-8 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center font-medium text-xs md:text-sm shrink-0">1</span>
                          <span className="text-sm md:text-base text-[#064e3b]/70">Apply to clean, damp hair and scalp.</span>
                        </div>
                        <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl border border-[#064e3b]/10">
                          <span className="w-6 md:w-8 h-6 md:h-8 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center font-medium text-xs md:text-sm shrink-0">2</span>
                          <span className="text-sm md:text-base text-[#064e3b]/70">Massage gently for 2-3 minutes.</span>
                        </div>
                        <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl border border-[#064e3b]/10">
                          <span className="w-6 md:w-8 h-6 md:h-8 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center font-medium text-xs md:text-sm shrink-0">3</span>
                          <span className="text-sm md:text-base text-[#064e3b]/70">Leave in for best results.</span>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;