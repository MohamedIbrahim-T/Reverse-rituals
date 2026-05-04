import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Image, Mic, MicOff, Play, Pause, Trash2, Check, X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../components/ImageUpload';

const ReviewsSection = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'whatsapp',
    image: '',
    audio: '',
    customerName: '',
    customerPhone: '',
    rating: 5,
    productId: '',
    productName: '',
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await axios.get(`${API_URL}/api/reviews?type=${activeTab}`);
      setReviews(res.data);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${API_URL}/api/reviews`, formData);
      toast.success('Review added!');
      setIsModalOpen(false);
      setFormData({
        type: activeTab,
        image: '',
        audio: '',
        customerName: '',
        customerPhone: '',
        rating: 5,
        productId: '',
        productName: '',
      });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to add review');
    }
  };

  const toggleApproval = async (review) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(
        `${API_URL}/api/reviews/${review._id}`,
        { isApproved: !review.isApproved },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchReviews();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.delete(`${API_URL}/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#064e3b]">Reviews</h3>
          <p className="text-[#064e3b]/40 text-sm">Manage voice & WhatsApp reviews</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, type: activeTab });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#064e3b] text-white rounded-xl sm:rounded-2xl font-bold hover:bg-[#c5a059] transition-all text-sm"
        >
          <Plus size={18} /> Add Review
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-[#25D366] text-white'
              : 'bg-white border border-[#064e3b]/10 text-[#064e3b]'
          }`}
        >
          <Image size={16} /> WhatsApp Reviews
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'voice'
              ? 'bg-[#064e3b] text-white'
              : 'bg-white border border-[#064e3b]/10 text-[#064e3b]'
          }`}
        >
          <Mic size={16} /> Voice Reviews
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden border border-[#064e3b]/5"
            >
              {activeTab === 'whatsapp' && review.image && (
                <div className="aspect-square relative">
                  <img
                    src={review.image}
                    alt="Review"
                    className="w-full h-full object-cover"
                  />
                  {!review.isApproved && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
                        Pending
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'voice' && review.audio && (
                <div className="p-6 bg-gradient-to-br from-[#064e3b] to-[#064e3b]/80">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Mic size={32} className="text-white" />
                    </div>
                  </div>
                  <audio controls className="w-full h-10" src={review.audio} />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#064e3b]">{review.customerName || 'Anonymous'}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[#064e3b]/40 text-sm mb-3">
                  {review.customerPhone}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleApproval(review)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                      review.isApproved
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    }`}
                  >
                    {review.isApproved ? <Check size={14} /> : <X size={14} />}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-[#064e3b]/20 mb-4" />
          <p className="text-[#064e3b]/40">No {activeTab} reviews yet</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#064e3b]">
                  Add {activeTab === 'whatsapp' ? 'WhatsApp' : 'Voice'} Review
                </h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <X size={24} className="text-[#064e3b]/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'whatsapp' ? (
                  <ImageUpload
                    label="WhatsApp Screenshot"
                    folder="whatsapp"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                  />
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-[#064e3b] mb-2">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#064e3b] mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        placeholder="e.g., Reverse Ritual Combo"
                        className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

<ImageUpload
                      label="Voice Recording"
                      folder="audio"
                      value={formData.audio}
                      onChange={(url) => setFormData({ ...formData, audio: url })}
                    />
                  </>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-[#064e3b]/10 rounded-xl font-bold text-[#064e3b] hover:bg-[#064e3b]/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#c5a059]"
                  >
                    Add Review
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsSection;