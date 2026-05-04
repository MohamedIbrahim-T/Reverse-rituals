const Review = require('../models/Review');

const getReviews = async (req, res) => {
  const { type, approved } = req.query;
  let filter = {};
  if (type) filter.type = type;
  if (approved !== undefined) filter.isApproved = approved === 'true' || approved === true;
  
  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  res.json(reviews);
};

const createReview = async (req, res) => {
  const { type, image, audio, customerName, customerPhone, rating, productId, productName } = req.body;
  
  const review = new Review({
    type,
    image,
    audio,
    customerName,
    customerPhone,
    rating,
    productId,
    productName,
  });
  
  const saved = await review.save();
  res.status(201).json(saved);
};

const updateReview = async (req, res) => {
  const { isApproved, isActive } = req.body;
  const review = await Review.findById(req.params.id);
  
  if (!review) return res.status(404).json({ message: 'Review not found' });
  
  if (isApproved !== undefined) review.isApproved = isApproved;
  if (isActive !== undefined) review.isActive = isActive;
  
  await review.save();
  res.json(review);
};

const deleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Review deleted' });
};

module.exports = { getReviews, createReview, updateReview, deleteReview };