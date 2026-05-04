const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['voice', 'whatsapp'], 
    required: true 
  },
  image: { type: String },
  audio: { type: String },
  customerName: { type: String },
  customerPhone: { type: String },
  productName: { type: String },
  rating: { type: Number, default: 5 },
  productId: { type: String },
  isApproved: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);