import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import axios from "axios";
import "../index.css"

import "swiper/css";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${API_URL}/api/reviews?type=whatsapp`);
        const approvedReviews = res.data.filter(r => r.isApproved !== false);
        setReviews(approvedReviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const defaultReviews = [
    { _id: 'local-1', image: new URL('../assets/reviews/review-1.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-2', image: new URL('../assets/reviews/review-2.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-3', image: new URL('../assets/reviews/review-3.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-4', image: new URL('../assets/reviews/review-4.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-5', image: new URL('../assets/reviews/review-5.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-6', image: new URL('../assets/reviews/review-6.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-7', image: new URL('../assets/reviews/review-7.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-8', image: new URL('../assets/reviews/review-8.PNG', import.meta.url).href, isLocal: true },
    { _id: 'local-9', image: new URL('../assets/reviews/review-9.PNG', import.meta.url).href, isLocal: true },
  ];

  const displayReviews = [...reviews, ...defaultReviews];

  return (
    <section className="py-6 bg-[#fdfbf7]">

      {/* Title */}
      <div className="text-center mb-8 md:mb-10">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#064e3b]">
          Honest <span className="italic text-[#c5a059]">Reflections</span>
        </h2>
        <p className="text-lg text-[#064e3b]">The real results from the people who have tried it</p>
      </div>

      {/* Narrow centered container */}
      <div className="max-w-3xl mx-auto">

        <Swiper
          centeredSlides={true}
          loop={displayReviews.length > 3}
          grabCursor={true}

          slidesPerView={1.5}
          spaceBetween={15}
          breakpoints={{
            640: {
              slidesPerView: 1.7,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 2.2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 25,
            },
          }}
          modules={[Autoplay]}
          className="reviewSwiper touch-pan-y"
        >
          {displayReviews.map((review, idx) => (
            <SwiperSlide key={review._id || idx}>
              <div className="review-card">
                <img
                  src={review.image}
                  alt="review"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default ReviewSection;