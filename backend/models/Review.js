const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     { type: String, required: true },
  // FIX: Removed required: true so Google users can leave reviews without crashing
  phone:    { type: String, default: '' },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true, maxlength: 500 },
  status:   { type: String, enum: ['pending','approved','hidden'], default: 'pending' },
  isMock:   { type: Boolean, default: false },
  verifiedPurchase: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);