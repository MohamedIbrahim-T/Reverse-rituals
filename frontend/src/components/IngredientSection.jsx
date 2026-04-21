import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, FlaskConical, ShieldCheck, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";


const ingredients = [
    {
        name: "Rosemary",
        emoji: "/rosemary.png",
        angle: 0,
        tagline: "The Growth Catalyst",
        details: `Rosemary Alchemy Water is your main active ingredient for growth.

Key nutrients: Rosmarinic acid, ursolic acid, antioxidants.

Benefits:
• Stimulates hair growth: Improves blood circulation to hair follicles, providing more oxygen and nutrients.
• Reduces hair fall: Strengthens hair roots and prevents premature shedding.
• DHT control: Helps block DHT, a hormone linked to hair loss.
• Fights dandruff: Natural antifungal and antibacterial properties.
• Prevents premature greying: Antioxidants reduce oxidative stress.`,
    },
    {
        name: "Bhringraj",
        emoji: "/bhringiraj.png",
        angle: 72,
        tagline: "King of Hair",
        details: `Also known as "King of Hair" in Ayurveda, it works deeply on regrowth.

Key compounds: Wedelolactone, flavonoids.

Benefits:
• Promotes new hair growth: Activates dormant hair follicles.
• Reduces thinning: Improves hair density and volume.
• Controls hair fall: Strengthens roots from within.
• Delays greying: Supports melanin production.
• Soothes scalp: Natural cooling and anti-inflammatory effect.`,
    },
    {
        name: "Fenugreek",
        emoji: "/fenugreek.png",
        angle: 144,
        tagline: "The Strengthener",
        details: `Acts as a natural conditioner + strengthening agent.

Key nutrients: Protein, nicotinic acid, lecithin.

Benefits:
• Strengthens hair shaft: High protein helps repair damaged hair.
• Reduces hair fall: Nourishes weak roots.
• Deep conditioning: Makes hair soft, smooth, and frizz-free.
• Fights dandruff: Reduces dryness and flakiness.
• Adds shine: Improves overall hair texture.`,
    },
    {
        name: "Black Seeds",
        emoji: "/blackseed.png",
        angle: 216,
        tagline: "Scalp Healer",
        details: `Provides scalp healing and follicle stimulation.

Key compound: Thymoquinone.

Benefits:
• Boosts hair growth: Stimulates follicles and improves density.
• Reduces hair thinning: Strengthens roots and prevents breakage.
• Fights scalp infections: Strong antibacterial and antifungal.
• Improves scalp health: Reduces inflammation and irritation.
• Regrowth support: Helps with thinning patches.`,
    },
    {
        name: "Clove",
        emoji: "/clove.png",
        angle: 288,
        tagline: "Circulation Booster",
        details: `Works as a circulation booster + scalp cleanser.

Key compounds: Eugenol, antioxidants.

Benefits:
• Improves blood circulation: Helps nutrients reach roots faster.
• Promotes faster growth: Directly stimulates follicles.
• Antimicrobial: Fights dandruff and scalp infections.
• Strengthens roots: Reduces breakage and shedding.
• Activates scalp: Provides mild warmth to trigger activity.`,
    },
];

const ProductShowcase = () => {
    const [selected, setSelected] = useState(null);
    const [screenWidth, setScreenWidth] = useState(1200);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setScreenWidth(window.innerWidth);
            const handleResize = () => setScreenWidth(window.innerWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    useEffect(() => {
        // Store original overflow value
        const originalOverflow = document.body.style.overflow;
        
        if (selected) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow || '';
        }
        
        return () => {
            document.body.style.overflow = originalOverflow || '';
        };
    }, [selected]);

    const isMobile = screenWidth < 768;
    const radius = isMobile ? Math.min(screenWidth * 0.35, 130) : 320;

    return (
        <section className="relative py-12 md:py-20 bg-[#063b2c] overflow-hidden text-white">

            {/* Background glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#c5a059]/5 blur-[150px] -mr-64 -mt-64 rounded-full" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Title */}
                <div className="text-center md:mb-24">
                    <span className="text-[#c5a059] text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-4 block">
                        Ancient Wisdom
                    </span>

                    <h3 className="text-3xl md:text-5xl lg:text-7xl font-black">
                        The Science of <span className="italic font-serif text-[#c5a059]">Alchemy</span>
                    </h3>
                </div>

                {/* Orbit Section */}
                <div className="relative flex justify-center items-center h-[420px] md:h-[700px]">

                    <div className="relative flex justify-center items-center w-full h-full">

                        {/* Glow */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute w-64 md:w-[600px] h-64 md:h-[600px] rounded-full bg-[#c5a059]/10 blur-[120px]"
                        />

                        {/* Orbit */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="relative w-[280px] md:w-[650px] h-[280px] md:h-[650px]">

                                {ingredients.map((ing) => {
                                    const rad = (ing.angle * Math.PI) / 180;
                                    const x = Math.cos(rad) * radius;
                                    const y = Math.sin(rad) * radius;

                                    return (
                                        <motion.div
                                            key={ing.name}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
                                            style={{ x, y }}
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                            onClick={() => setSelected(ing)}
                                        >
                                            <div className="bg-white/10 md:bg-white/5 border border-white/10 rounded-full px-3 md:px-8 py-1.5 md:py-4 text-[9px] md:text-sm whitespace-nowrap flex items-center gap-2 md:gap-4 shadow-2xl cursor-pointer hover:border-[#c5a059]/40 transition">

                                                <span className="text-base md:text-3xl">
                                                    <img src={ing.emoji} alt="" className="w-5 md:w-10" />
                                                </span>

                                                <span className="font-black uppercase tracking-widest">
                                                    {ing.name}
                                                </span>

                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Center Bottle */}
                        <motion.img
                            src="/ingredient.png"
                            alt="Signature Alchemy Water"
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-36 md:w-[480px]"
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-4">
                        <motion.div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setSelected(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            className="relative w-full max-w-sm md:max-w-3xl max-h-[85vh] md:max-h-[90vh] bg-[#082f2a] border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-3 right-3 z-10 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                            >
                                <X size={18} className="text-white" />
                            </button>

                            {/* Header - Image + Title - Scrollable if needed */}
                            <div className="flex-shrink-0 flex flex-col md:flex-row gap-3 md:gap-6 p-4 md:p-6 pb-4">
                                {/* Image */}
                                <div className="flex-shrink-0 flex items-center justify-center">
                                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center">
                                        <img
                                            src={selected.emoji}
                                            alt={selected.name}
                                            className="w-14 h-14 md:w-24 md:h-24 object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Title Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl md:text-3xl font-bold text-white">
                                        {selected.name}
                                    </h4>
                                    <p className="text-[#c5a059] mt-1 text-xs font-medium uppercase tracking-wider">
                                        {selected.tagline}
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex-shrink-0 h-px bg-white/10 mx-4" />

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
                                <p className="text-white/80 text-sm leading-relaxed">
                                    {selected.details.split('\n\n')[0]}
                                </p>

                                {selected.details.includes('Benefits:') && (
                                    <div>
                                        <h6 className="text-[#c5a059] font-semibold text-xs uppercase tracking-wide mb-2">
                                            Key Benefits
                                        </h6>
                                        <ul className="space-y-1.5">
                                            {selected.details.split('\n').filter(line => line.startsWith('•')).map((benefit, idx) => (
                                                <li key={idx} className="text-white/70 text-sm leading-relaxed flex items-start gap-2">
                                                    <span className="text-[#c5a059] mt-0.5">•</span>
                                                    <span>{benefit.replace('• ', '')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Quality Badges */}
                            <div className="flex-shrink-0 px-4 pb-4 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2">
                                        <ShieldCheck className="text-[#c5a059] w-4 h-4 flex-shrink-0" />
                                        <p className="text-white/70 text-xs">Clinical-grade</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2">
                                        <Sparkles className="text-[#c5a059] w-4 h-4 flex-shrink-0" />
                                        <p className="text-white/70 text-xs">100% Organic</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Button */}


            {/* Ingredient Cards Section */}
            <div className="mt-0 md:mt-12">
                <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-2xl md:text-4xl font-bold text-white">
                        Meet the <span className="text-[#c5a059]">Ingredients</span>
                    </h3>
                </div>

                {/* Horizontal scroll on mobile, grid on desktop */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-2.5 w-max">
                        {ingredients.map((ing, i) => (
                            <motion.div
                                key={ing.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelected(ing)}
                                className="w-[85px] flex-shrink-0 bg-white border border-white/10 rounded-lg p-2.5 cursor-pointer  transition group"
                            >
                                <div className="aspect-square relative mb-1.5">
                                    <img
                                        src={ing.emoji}
                                        alt={ing.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                                    />
                                </div>
                                <h4 className="text-[#064e3b] text-center font-bold text-[10px] uppercase tracking-wide">{ing.name}</h4>
                                <p className="text-[#c5a059] text-center text-[8px] mt-0.5">{ing.tagline}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-5 gap-6 max-w-6xl mx-auto px-4">
                    {ingredients.map((ing, i) => (
                        <motion.div
                            key={ing.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelected(ing)}
                            className="bg-white border border-white/10 rounded-2xl p-6 cursor-pointer transition group"
                        >
                            <div className="aspect-square relative mb-3">
                                <img
                                    src={ing.emoji}
                                    alt={ing.name}
                                    className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                                />
                            </div>
                            <h4 className="text-[#064e3b] text-center font-bold text-base uppercase tracking-wide">{ing.name}</h4>
                            <p className="text-[#c5a059] text-center text-xs mt-1">{ing.tagline}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <VideoShowcase />
        </section>
    );
};

const VideoShowcase = () => {
    const [showVideo, setShowVideo] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        
        if (showVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow || '';
        }
        
        return () => {
            document.body.style.overflow = originalOverflow || '';
        };
    }, [showVideo]);

    const videos = [
        {
            id: 1,
            title: "How to Apply",
            thumbnail: "/video.mp4",
            duration: "1:30"
        }
    ];

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
                <div className="text-center mb-6 md:mb-8">
                    <span className="text-[#c5a059] text-xs font-black uppercase tracking-[0.3em] mb-2 md:mb-3 block">
                        Tutorial
                    </span>
                    <h3 className="text-xl md:text-3xl font-bold text-white">
                        How to <span className="text-[#c5a059]">Use</span>
                    </h3>
                </div>

                <div className="flex justify-center">
                    {videos.map((video) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            onClick={() => {
                                setSelectedVideo(video);
                                setShowVideo(true);
                            }}
                            className="w-full max-w-sm md:max-w-lg group cursor-pointer rounded-xl md:rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#c5a059]/40 transition"
                        >
                            <div className="aspect-video relative bg-gradient-to-br from-[#064e3b]/30 to-[#c5a059]/30">
                                <video
                                    src={video.thumbnail}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    preload="auto"
                                    muted
                                    loop
                                />
                                <div 
                                  className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center cursor-pointer"
                                  onClick={() => {
                                    setSelectedVideo(video);
                                    setShowVideo(true);
                                  }}
                                >
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition">
                                        <Play size={24} className="text-white ml-1" fill="white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
                                    {video.duration}
                                </div>
                            </div>
                            <div className="p-3 md:p-4">
                                <h4 className="text-white font-semibold text-sm md:text-base">{video.title}</h4>
                                <p className="text-white/50 text-xs mt-0.5">Watch tutorial</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {showVideo && selectedVideo && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            className="absolute inset-0 bg-black/90"
                            onClick={() => setShowVideo(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button
                                onClick={() => setShowVideo(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                            >
                                <X size={24} className="text-white" />
                            </button>
                            <video
                                src={selectedVideo.thumbnail}
                                className="w-full h-full"
                                controls
                                autoPlay
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductShowcase;