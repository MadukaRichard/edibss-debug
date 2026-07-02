const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, enum: ['Medicines','Devices','Baby Care','Vitamins','First Aid','Diagnostics','Other'] },
  image:       { type: String, default: '' },
  stock:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  requiresPrescription: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('Product', productSchema);
