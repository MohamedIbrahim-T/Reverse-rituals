const mongoose = require('mongoose');

const visitSchema = mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  sessionId: {
    type: String,
  },
  deviceType: {
    type: String,
  },
  page: {
    type: String,
  },
  action: {
    type: String,
    enum: ['view', 'cart_add', 'cart_visit', 'cart_abandon', 'ordered', 'checkout_start', 'realtime'],
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

visitSchema.index({ createdAt: -1 });
visitSchema.index({ sessionId: 1 });
visitSchema.index({ action: 1 });

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;