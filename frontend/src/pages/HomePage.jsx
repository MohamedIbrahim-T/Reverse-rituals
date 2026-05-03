import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import VoiceReviewsSection from '../components/VoiceReviewsSection';
import AboutSection from '../components/AboutSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import { ShoppingBag, Star, Zap, Leaf, Shield, Heart, Award, CheckCircle2, Play, BookOpen, FlaskConical, Globe, HelpCircle, ChevronDown, ArrowRight, MessageCircle } from 'lucide-react';
import HairProductSection from '../components/HairProductSection';
import IngredientsSection from '../components/IngredientSection';
import ProductsSection from './ProductsSection';


const HomePage = () => {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [hasScrolled, setHasScrolled] = useState(false);
   const [activeFaq, setActiveFaq] = useState(null);
   const [sliderPos, setSliderPos] = useState(50);
   const sliderPosRef = useRef(50);
   const [isDragging, setIsDragging] = useState(false);
   const sliderRef = useRef(null);
   const sliderLineRef = useRef(null);
   const beforeImageRef = useRef(null);
   const [selectedWeek, setSelectedWeek] = useState("Week 1");
   const [beforeImg, setBeforeImg] = useState("/WEEK1.PNG");

   const updateSliderPosition = (pos) => {
      sliderPosRef.current = pos;
      if (sliderLineRef.current) {
         sliderLineRef.current.style.left = `${pos}%`;
      }
      if (beforeImageRef.current) {
         beforeImageRef.current.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      }
   };
   useEffect(() => {
      updateSliderPosition(50); // center on load
   }, []);
   const handleMouseDown = (e) => {
      setIsDragging(true);
      // Optional: Prevent text selection while dragging
      e.preventDefault();
   };

   const handleMouseUp = () => {
      setIsDragging(false);
      setSliderPos(sliderPosRef.current);
   };

   useEffect(() => {
      const handleScroll = () => {
         setHasScrolled(window.scrollY > 100);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   useEffect(() => {
      let rafId;
      const onMove = (e) => {
         if (!isDragging || !sliderRef.current) return;

         const rect = sliderRef.current.getBoundingClientRect();
         const clientX = e.touches ? e.touches[0].clientX : e.clientX;
         const pos = ((clientX - rect.left) / rect.width) * 100;
         const clampedPos = Math.max(0, Math.min(100, pos));

         if (rafId) cancelAnimationFrame(rafId);
         rafId = requestAnimationFrame(() => {
            updateSliderPosition(clampedPos);
         });
      };

      if (isDragging) {
         window.addEventListener('mousemove', onMove);
         window.addEventListener('mouseup', handleMouseUp);
         window.addEventListener('touchmove', onMove);
         window.addEventListener('touchend', handleMouseUp);
      }

      return () => {
         window.removeEventListener('mousemove', onMove);
         window.removeEventListener('mouseup', handleMouseUp);
         window.removeEventListener('touchmove', onMove);
         window.removeEventListener('touchend', handleMouseUp);
      };
   }, [isDragging]);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const cached = localStorage.getItem('home_products');
            const cachedTime = localStorage.getItem('home_products_time');

            if (cached && cachedTime && Date.now() - parseInt(cachedTime) < 1000 * 60 * 5) {
               setProducts(JSON.parse(cached));
               setLoading(false);
               return;
            }

            const { data } = await axios.get(`${API_URL}/api/products`, {
               timeout: 10000,
               headers: { 'Cache-Control': 'no-cache' }
            });

            localStorage.setItem('home_products', JSON.stringify(data));
            localStorage.setItem('home_products_time', Date.now().toString());

            setProducts(data);
            setLoading(false);
         } catch (error) {
            console.error('Error fetching products:', error);
            const cached = localStorage.getItem('home_products');
            if (cached) setProducts(JSON.parse(cached));
            else setProducts([]);
            setLoading(false);
         }
      };
      fetchProducts();
   }, []);

   const productOrder = [
      'alchemy-combo',
      'alchemy-water',
      'neem-comb',
      'scalp-massager',
      'rosemary-comb-combo',
      'rosemary-massager-combo',
      'comb-massager-combo'
   ];

   const sortedProducts = [...(products || [])].sort((a, b) => {
      const indexA = productOrder.indexOf(a._id);
      const indexB = productOrder.indexOf(b._id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
   });

   const whyChoose = [
      { icon: <Shield size={32} />, title: "Clinical Efficacy", desc: "Scientifically proven results in 21 days." },
      { icon: <Heart size={32} />, title: "Pure Botanicals", desc: "Sulfate, Paraben, and Cruelty free." },
      { icon: <Award size={32} />, title: "Gold Standard", desc: "Winner of 2026 Botanical Excellence." },
      { icon: <Award size={32} />, title: "Hand Extracted", desc: "Small-batch clinical concentrates." },
   ];

   const ritualSteps = [
      { number: "01", title: "The Purify Ritual", desc: "Our Alchemical Water strips away environmental pollutants without disrupting the scalp's microbiome.", time: "2 Mins" },
      { number: "02", title: "The Nourish Phase", desc: "Massage our Signature Concentrate into the roots. The botanical oils penetrate cellular membranes.", time: "5 Mins" },
      { number: "03", title: "The Seal Ritual", desc: "Apply the finishing serum to lock in nutrients and provide a natural UV-protective barrier.", time: "1 Min" },
   ];

   const comparison = [
      { feature: "Ingredient Purity", others: "Standard Extracts", ours: "Clinical Alchemical Water" },
      { feature: "Potency", others: "Diluted Oils", ours: "100% Pure Botanical Concentrates" },
      { feature: "Efficacy", others: "Surface Level", ours: "Deep Cellular Penetration" },
      { feature: "Sustainability", others: "Standard Logistics", ours: "Closed-Loop Ethical Sourcing" },
   ];

const faqs = [
       { q: "How soon will I see results?", a: "Most customers notice reduced hair fall within 1 week and reduced dandruff in just 3 uses. For best results, we recommend using the product consistently for 2-3 months." },
       { q: "Is it safe for colored or treated hair?", a: "This rosemary water is completely natural and Ayurvedic, but we still recommend that you do a patch test first. If you have chemically treated or dyed hair, those chemicals can react with natural ingredients. So, please do a patch test before full use, or consult a trusted dermatologist for advice." },
       { q: "Is this product vegan and cruelty-free?", a: "Absolutely. We never test on animals and use 100% plant-based natural ingredients. All products are ethically sourced." },
       { q: "How often should I use it?", a: "For best results, you should use it consistently. In the initial stage, for the first two weeks, apply it two to three times a week. After applying, massage it in for about five minutes. Ensure your scalp is clean and not oily. Once applied, leave it for about 30 minutes before washing it off." },
       { q: "What makes this different from other?", a: "Our unique Ayurvedic blend combines traditional herbs with modern formulation, designed to penetrate deep into the scalp and strengthen roots." },
    ];

   return (
      <div className="overflow-hidden">
         <Hero />

         {/* Trust Badges Section */}
         {/* <section className="py-12 md:py-24 px-4 md:px-6 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto">
               {/* Trust Badges - Mobile Optimized Grid */}
         {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
                  {[
                     { icon: <Star className="fill-current" size={20} />, value: "4.9/5", label: "Rating", color: "#c5a059" },
                     { icon: <Heart className="fill-current" size={20} />, value: "50K+", label: "Happy Customers", color: "#064e3b" },
                     { icon: <Leaf className="fill-current" size={20} />, value: "100%", label: "Natural Ingredients", color: "#22c55e" },
                  ].map((item, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center sm:flex-col gap-4 sm:gap-4 p-5 md:p-10 rounded-2xl md:rounded-3xl bg-[#fdfbf7] border border-[#064e3b]/5 transition-all duration-500 translate-z-0"
                     >
                        <div
                           className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
                           style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                           {item.icon}
                        </div>
                        <div className="text-left sm:text-center">
                           <p className="text-xl md:text-4xl font-serif font-bold text-[#1a1a1a] leading-tight">{item.value}</p>
                           <p className="text-[10px] md:text-sm font-bold text-[#1a1a1a]/40 uppercase tracking-widest">{item.label}</p>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div> */}


         <ProductsSection products={sortedProducts} loading={loading} />

         <section className="py-10 md:py-10 bg-gradient-to-b from-[#fafafa] to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

               {/* Header */}
               <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center mb-16 md:mb-24"
               >
                  <span className="text-[#c5a059] text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-4 block">
                     My Hairline Journey
                  </span>

                  <h2 className="text-3xl md:text-5xl lg:text-5xl font-black text-[#064e3b] mt-4 leading-[1.1] tracking-tight">
                     Hair Transformation from <span className="font-serif italic text-[#c5a059]">Week 1 to Week 14</span>
                     <span className="block text-[14px] md:text-2xl font-medium text-[#064e3b]/40 mt-6 tracking-normal ">
                        Rapid hair fall reduction in 2 weeks, noticeable hair growth with consistent use.
                     </span>
                  </h2>
               </motion.div>

               {/* Before After Slider - Mobile Optimized */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-10 md:mb-32 max-w-5xl mx-auto will-change-transform"
               >
                  <div
                     ref={sliderRef}
                     onMouseDown={handleMouseDown}
                     onTouchStart={handleMouseDown}
                     className="relative cursor-ew-resize select-none overflow-hidden rounded-3xl md:rounded-[60px] aspect-square md:aspect-video shadow-xl md:shadow-2xl border-2 md:border-8 border-white translate-z-0 touch-none will-change-transform"
                  >

{/* Right Image - After (Week 14) */}
                      <img
                         src={new URL('../assets/Week/Week-14.JPG', import.meta.url).href}
                         className="absolute inset-0 w-full h-full object-cover"
                         alt="Week 14"
                         loading="lazy"
                      />

                      {/* Left Image - Before (Week 1) */}
                      <div
                         ref={beforeImageRef}
                         className="absolute inset-0 overflow-hidden will-change-[clip-path]"
                         style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                      >
                         <img
                            src={new URL('../assets/Week/Week-1.PNG', import.meta.url).href}
                           className="absolute inset-0 w-full h-full object-cover"
                           alt="Week 1"
                           loading="lazy"
                        />
                     </div>

                     {/* Comparison Handle */}
                     <div
                        ref={sliderLineRef}
                        className="absolute top-0 bottom-0 w-0.5 md:w-1 bg-white z-10 pointer-events-none will-change-[left]"
                        style={{ transform: 'translateX(-50%)', left: '50%' }}
                     >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-[#064e3b]/10">
                           <div className="flex items-center gap-0.5 md:gap-1">
                              <div className="w-0.5 md:w-1 h-2 md:h-8 bg-[#064e3b]/20 rounded-full"></div>
                              <div className="w-0.5 md:w-1.5 h-4 md:h-12 bg-[#c5a059] rounded-full"></div>
                              <div className="w-0.5 md:w-1 h-2 md:h-8 bg-[#064e3b]/20 rounded-full"></div>
                           </div>
                        </div>
                     </div>

                     {/* Labels - Simplified for performance */}
                     <div className="absolute inset-x-3 md:inset-x-6 top-3 md:top-6 flex justify-between gap-2 md:gap-4 pointer-events-none">
                        <div className="px-3 md:px-6 py-1.5 md:py-3 rounded-full bg-black/40 md:bg-white/10 text-white text-[8px] md:text-xs font-black border border-white/20 tracking-widest uppercase">
                           Week 1
                        </div>
                        <div className="px-3 md:px-6 py-1.5 md:py-3 rounded-full bg-[#c5a059] text-white text-[8px] md:text-xs font-black border border-white/20 tracking-widest uppercase">
                           Week 14
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Weekly Evolution Gallery - Static */}
               <div className="max-w-6xl mx-auto">
<div className="flex overflow-x-auto gap-6 pb-8 px-2 scrollbar-hide justify-start">
{[
                           { week: '1', title: 'Week 1', img: new URL('../assets/Week/Week-1.PNG', import.meta.url).href },
                           { week: '2', title: 'Week 2', img: new URL('../assets/Week/Week-2.PNG', import.meta.url).href },
                           { week: '4', title: 'Week 4', img: new URL('../assets/Week/Week-4.PNG', import.meta.url).href },
                           { week: '6', title: 'Week 6', img: new URL('../assets/Week/Week-6.PNG', import.meta.url).href },
                           { week: '8', title: 'Week 8', img: new URL('../assets/Week/Week-8.PNG', import.meta.url).href },
                           { week: '12', title: 'Week 12', img: new URL('../assets/Week/Week-12.PNG', import.meta.url).href },
                           { week: '14', title: 'Week 14', img: new URL('../assets/Week/Week-14.JPG', import.meta.url).href },
                        ].map((step, i) => (
                        <div
                           key={i}
                           className="relative min-w-[280px] md:min-w-[320px] shrink-0 group translate-z-0"
                        >
                           <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-[#c5a059]/20 bg-white">
                              <img src={step.img} className="w-full h-64 md:h-80 object-cover" alt="" loading="lazy" />
                              <div className="absolute top-4 left-4 bg-[#064e3b] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                                 Week {step.week}
                              </div>
                              <div className="absolute bottom-4 left-4 right-4">

                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </section>

         <IngredientsSection />
         <ReviewSection />
         <VoiceReviewsSection />

         {/* <HairProductSection /> */}








         {/* FAQs Section */}
         {/* FAQ Section */}
         <section className="py-10 md:py-10 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center mb-10"
               >
<h2 className="text-2xl md:text-3xl font-medium text-[#064e3b]">
                      Frequently Asked <span className="font-serif italic text-[#c5a059]">Questions</span>
                   </h2>
                   <p className="text-[#064e3b]/60 mt-2 text-sm">Got Questions? We've got answers.</p>
               </motion.div>

               <div className="space-y-3">
                  {faqs.map((faq, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#f8fdf9] rounded-xl overflow-hidden border border-[#c5a059]/10"
                     >
                        <button
                           onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                           className="w-full px-5 py-4 flex items-center justify-between text-left group"
                        >
                           <span className="font-medium text-[#064e3b] text-sm group-hover:text-[#c5a059] transition-colors">{faq.q}</span>
                           <ChevronDown className={`text-[#c5a059] transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} size={18} />
                        </button>
                        <AnimatePresence>
                           {activeFaq === i && (
                              <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: "auto", opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="px-5 pb-4"
                              >
                                 <p className="text-[#064e3b]/70 text-sm leading-relaxed pt-2 border-t border-[#c5a059]/10">{faq.a}</p>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </motion.div>
                  ))}
               </div>

{/* Contact CTA */}
                <motion.div
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   className="text-center mt-10"
                >
                   <p className="text-[#064e3b]/60 text-sm">Still have questions?</p>
                   <a 
                     href="https://wa.me/917358422064" 
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#064e3b] text-white rounded-full font-medium text-sm hover:bg-[#053d2f] transition"
                   >
                      <MessageCircle size={16} />
                      Contact now
                   </a>
                </motion.div>
            </div>
         </section>



         {/* 3D Review Carousel */}

         {/* Commitment Section */}

         {/* Founder's Journal Excerpt */}


      </div>
   );
}; export default HomePage;
