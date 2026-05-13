const mongoose = require('mongoose');

const LOW_STOCK_THRESHOLD = 10;

const getStockStatus = function(countInStock) {
  if (countInStock === 0) return 'out_of_stock';
  if (countInStock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
};

const productSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, default: 'Hair Care' },
  image: { type: String, required: true },
  images: [{ type: String }],
  features: [{ type: String }],
  benefits: [{
    title: { type: String },
    description: { type: String },
    points: [{ type: String }]
  }],
  ingredients: [{
    name: { type: String },
    description: { type: String },
    points: [{ type: String }]
  }],
  usageTips: [{ type: String }],
  countInStock: { type: Number, required: true, default: 0 },
  stockStatus: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock'], 
    default: 'in_stock' 
  },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
module.exports.LOW_STOCK_THRESHOLD = 10;
module.exports.getStockStatus = getStockStatus;
