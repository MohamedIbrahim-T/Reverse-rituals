import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const VoiceReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState({});
  const audioRefs = useRef({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${API_URL}/api/reviews?type=voice`);
        const approvedReviews = res.data.filter(r => r.isApproved !== false);
        setReviews(approvedReviews);
      } catch (error) {
        console.error('Failed to fetch voice reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((a) => a?.pause());
    };
  }, []);

  const togglePlay = (id) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    Object.values(audioRefs.current).forEach((a) => {
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    });

    if (playingId === id) {
      setPlayingId(null);
      return;
    }

    audio.play()
      .then(() => setPlayingId(id))
      .catch(() => { });
  };

  const handleTimeUpdate = (id) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    const percent = (audio.currentTime / audio.duration) * 100;

    setProgress((prev) => ({
      ...prev,
      [id]: percent || 0,
    }));
  };

  const defaultVoiceReviews = [
    { _id: 'local-1', customerName: "Jagathisan", audio: new URL('../assets/voice/audio-1.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-2', customerName: "Lavanya", audio: new URL('../assets/voice/audio-3.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-3', customerName: "Srinivasan", audio: new URL('../assets/voice/Srini.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-4', customerName: "Saravanavel", audio: new URL('../assets/voice/saravana.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-5', customerName: "Thivan", audio: new URL('../assets/voice/thivan.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-6', customerName: "Gopikrishnan G", audio: new URL('../assets/voice/audio-2.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-7', customerName: "Santhosh", audio: new URL('../assets/voice/santhosh.mp3', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-8', customerName: "Periyanayagasamy", audio: new URL('../assets/voice/peri.opus', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
    { _id: 'local-9', customerName: "Srinivasan", audio: new URL('../assets/voice/srini25.mp3', import.meta.url).href, productName: "Reverse ritual combo", isLocal: true },
  ];

  const displayReviews = [...reviews, ...defaultVoiceReviews];

  return (
    <section className="py-20 bg-gradient-to-b from-[#fdfbf7] to-[#f8f5ee]">
      <div className="max-w-2xl mx-auto px-4">

        <h2 className="text-center text-4xl font-bold text-[#064e3b] mb-12">
          What Our Customers Say 🎧
        </h2>

        <div className="relative">

          {/* Fade Top */}
          <div className="pointer-events-none absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#fdfbf7] to-transparent z-10" />

          {/* Fade Bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#fdfbf7] to-transparent z-10" />

          <div className="h-[420px] overflow-y-auto snap-y snap-mandatory scroll-smooth scroll-py-6 space-y-5 pr-2 pt-6 pb-10">

            {displayReviews.map((review) => (
              <motion.div
                key={review._id || review.id}
                className={`snap-start rounded-2xl border box-border overflow-hidden transition-all duration-300 ${playingId === (review._id || review.id)
                    ? "border-[#064e3b] shadow-[0_0_12px_rgba(6,78,59,0.25)]"
                    : "border-transparent"
                  }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white rounded-2xl p-3 shadow-md"
                >

                  <audio
                    ref={(el) => (audioRefs.current[review._id || review.id] = el)}
                    src={review.audio}
                    preload="none"
                    onTimeUpdate={() => handleTimeUpdate(review._id || review.id)}
                    onEnded={() => setPlayingId(null)}
                  />

                  <div className="flex items-center gap-4">

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c5a059] to-[#e6d3a3] flex items-center justify-center text-white font-bold text-lg">
                      {(review.customerName || review.name || 'A').charAt(0)}
                    </div>

                    <div className="flex-1">

                      <h4 className="font-semibold text-[#064e3b]">
                        {review.customerName || review.name || 'Anonymous'}
                      </h4>

                      {/* Product */}
                      <div className="text-sm text-gray-500 mt-1">
                        {review.productName || review.product || 'Reverse ritual combo'}
                      </div>

                      {/* Player */}
                      <button
                        onClick={() => togglePlay(review._id || review.id)}
                        className={`mt-4 flex items-center gap-3 px-3 py-2 rounded-xl w-full transition-all ${playingId === (review._id || review.id)
                            ? "bg-[#064e3b] text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                          }`}
                      >
                        {/* Play/Pause */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
                          {playingId === (review._id || review.id) ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#c5a059] to-[#064e3b]"
                            style={{
                              width: `${progress[review._id || review.id] || 0}%`,
                            }}
                          />
                        </div>
                      </button>

                    </div>
                  </div>

                </motion.div>
              </motion.div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
};

export default VoiceReviewsSection;