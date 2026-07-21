const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true }, // <-- Removed the strict enum here!
  image:       { type: String, default: '' },
  stock:       { type: Number, default: 0 },
  unitSize:     { type: Number, default: 1 },
  unit:         { type: String, enum: ['item', 'g', 'mg', 'kg', 'ml', 'cl', 'L'], default: 'item' },
  isActive:    { type: Boolean, default: true },
  requiresPrescription: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  allowCustomAmount: { type: Boolean, default: false },
  variants: [{ name: String, price: Number }],
  reviewCount:   { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('Product', productSchema);