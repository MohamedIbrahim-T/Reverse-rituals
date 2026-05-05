import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import ProductCard from "../components/ProductCard";

const ProductsSection = ({ products, loading }) => {
    return (
        <section
            id="products"
            className="py-10 md:px-6 bg-[#fdfbf7] overflow-hidden"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div className="max-w-2xl text-center md:text-left">
                        <span className="text-[#064e3b] font-bold uppercase tracking-[0.2em] text-[10px] mb-3 block">
                            Our Iconic Concentrates
                        </span>

                        <h2 className="text-3xl md:text-5xl font-bold text-[#c5a059] mb-4">
                            The <span className="italic text-[#064e3b]">Reverse</span>{" "}
                            Collection
                        </h2>

                        <p className="text-[#064e3b]/60 text-base md:text-lg">
                            Each formulation is a precisely engineered ritual designed to
                            restore vitality.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border shadow-md hover:shadow-xl transition text-[#064e3b]">
                        <ShoppingBag size={18} className="text-[#c5a059]" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Our Masterpieces
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Loading */}
            {loading ? (
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                            key={n}
                            className="bg-white rounded-2xl h-[300px] animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <>
                    {/* 🔥 Mobile + Tablet Swiper */}
                    <div className="md:hidden max-w-4xl mx-auto">
                        <Swiper
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={"auto"}
                            spaceBetween={16}
                            loop={products.length >= 6}
                            speed={500}
                            watchSlidesProgress={true}
                            className="!overflow-visible px-2"
                        >
                            {products.map((product) => (
                                <SwiperSlide
                                    key={product._id}
                                    className="!w-[80%] sm:!w-[70%]"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* 💻 Desktop Grid */}
                    <div className="hidden md:grid max-w-7xl mx-auto grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default ProductsSection;