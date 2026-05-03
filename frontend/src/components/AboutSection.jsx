import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Heart, Sparkles, Leaf, Award, Shield, Quote, Check
} from "lucide-react";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  const values = [
    { icon: <Shield size={16} />, title: "Honesty" },
    { icon: <Sparkles size={16} />, title: "Transparency" },
    { icon: <Leaf size={16} />, title: "Quality" },
    { icon: <Heart size={16} />, title: "Results" },
  ];

  return (
    <section ref={sectionRef} className="py-12 md:py-16 px-4 overflow-hidden relative">

      {/* Background */}
      <div className="absolute inset-0 bg-[#fdfbf7]" />

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <motion.div
           variants={fadeUp}
           initial="hidden"
           whileInView="show"
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-8 md:mb-12"
        >
          <span className="text-[#c5a059] font-bold uppercase tracking-[0.2em] text-xs md:text-sm mb-3 md:mb-4 block">
            Behind the Brand
          </span>

          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-[#064e3b] leading-tight">
            The Story of <span className="italic text-[#c5a059]">Reverse Rituals</span>
          </h2>
        </motion.div>

        {/* Main Content - Stack on mobile, grid on desktop */}
        {/* <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:mb-12">
          
          {/* Mobile: First - Philosophy Card (Desktop: Right side) */}
          {/* <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-5 md:order-2 space-y-4 md:space-y-6"
          >
            <div className="bg-[#064e3b] p-5 md:p-6 rounded-xl md:rounded-2xl text-white">
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Our Philosophy</h3>
              <p className="text-white/70 text-sm md:text-base">
                Every product is crafted carefully using natural ingredients and tested personally to ensure visible results.
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                <div className="w-10 h-10 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div>
                  <p className="font-bold text-sm">R. Sadiq Basha</p>
                  <p className="text-white/50 text-xs">Founder</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
              <h3 className="text-[#064e3b] font-bold mb-3 md:mb-4 text-sm md:text-base">Core Values</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {values.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-green-500 shrink-0" />
                    <span className="text-[#064e3b] text-xs md:text-sm">{val.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mobile: Second - Quote (Desktop: Center) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 md:order-3 hidden md:flex items-center justify-center"
          >
            <div className="relative">
              <div className="w-20 md:w-24 h-20 md:h-24 bg-[#c5a059]/10 rounded-full flex items-center justify-center">
                <Quote className="text-[#c5a059]" size={24} md:size={30} />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 md:-inset-4 border border-dashed border-[#c5a059]/30 rounded-full"
              />
            </div>
          </motion.div>

          {/* Mobile: Third - Story Cards (Desktop: Left side) */}
          {/* <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-5 md:order-1 space-y-4 md:space-y-6"
          >
            <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#c5a059]/10 rounded-lg flex items-center justify-center">
                  <Heart size={14} className="text-[#c5a059]" />
                </div>
                <span className="text-[#c5a059] font-semibold text-xs uppercase tracking-wider">Our Beginning</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#064e3b] mb-2 md:mb-3">
                Born from Personal Experience
              </h3>
              <p className="text-[#064e3b]/60 text-sm md:text-base">
                Our brand was born from personal experience and a deep belief in the power of natural hair care.
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#064e3b]/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={14} className="text-[#064e3b]" />
                </div>
                <span className="text-[#064e3b] font-semibold text-xs uppercase tracking-wider">The Transformation</span>
              </div>
              <p className="text-[#064e3b]/60 text-sm md:text-base">
                After struggling with common hair concerns, we experimented with traditional herbs and saw real results — stronger roots, reduced hair fall, and healthier growth.
              </p>
            </div>
          </motion.div> */}
        {/* </div>  */}

        {/* Brand Philosophy Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-xl text-center"
        >
          <span className="text-[#c5a059] font-semibold uppercase tracking-[0.2em] text-xs">
            Brand Philosophy
          </span>

          <h3 className="text-lg md:text-2xl lg:text-3xl font-semibold text-[#064e3b] mt-2 md:mt-4 mb-3 md:mb-6 leading-tight">
            The Meaning of <span className="italic font-serif text-[#c5a059]">Reverse Rituals</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="p-4 md:p-6 rounded-xl bg-[#fdfbf7] border border-[#064e3b]/5">
              <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center text-white text-lg font-bold mb-3 mx-auto ">
                R
              </div>
              <h4 className="text-lg md:text-xl font-semibold text-[#064e3b] mb-2">Reverse</h4>
              <p className="text-[#064e3b]/60 text-sm md:text-base">
                To repair, restore and bring back your natural strength.
              </p>
            </div>

            <div className="p-4 md:p-6 rounded-xl bg-[#fdfbf7] border border-[#064e3b]/5">
              <div className="w-10 h-10 bg-[#c5a059] rounded-xl flex items-center justify-center text-white text-lg font-bold mb-3 mx-auto">
                R
              </div>
              <h4 className="text-lg md:text-xl font-semibold text-[#064e3b] mb-2">Rituals</h4>
              <p className="text-[#064e3b]/60 text-sm md:text-base">
                Daily self-care practices that create lasting transformation.
              </p>
            </div>
          </div>

          <p className="text-[#064e3b]/80 text-sm md:text-lg italic leading-relaxed mt-6 md:mt-8 max-w-2xl mx-auto">
            "Reverse Rituals is not just a product — it's a journey of restoring what was lost and building a daily ritual that brings your hair back to life."
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;