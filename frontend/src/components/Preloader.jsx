import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 bg-[#064e3b]/10 blur-3xl rounded-full"
                        />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative flex flex-col items-center"
                        >
                            <img
                                src={new URL('../assets/rr-logo.png', import.meta.url).href}
                                alt="Reverse Rituals"
                                className="w-24 h-24 md:w-32 md:h-32 object-contain mb-8"
                                fetchPriority="high"
                            />

                            <div className="flex flex-col items-center gap-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-[#064e3b] font-serif text-xl tracking-[0.2em] font-black uppercase"
                                >
                                    Reverse Rituals
                                </motion.span>

                                <div className="w-48 h-1 bg-[#064e3b]/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "100%" }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="w-full h-full bg-[#c5a059]"
                                    />
                                </div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-[#064e3b]/40 text-[10px] uppercase tracking-widest font-bold"
                                >
                                    Preparing Your Ritual...
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;