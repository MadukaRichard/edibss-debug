const mongoose = require('mongoose');
const crypto = require('crypto');
const riderSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  email:    { type: String },
  vehicle:  { type: String, default: 'Motorcycle' },
  plateNumber: { type: String },
  zone:     { type: String, required: true },
  isActive: { type: Boolean, default: true },
  status:   { type: String, enum: ['available','on_delivery','offline'], default: 'available' },
  location: { lat: { type: Number, default: 6.5244 }, lng: { type: Number, default: 3.3792 } },
  rating:   { type: Number, default: 5.0 },
  totalDeliveries: { type: Number, default: 0 },
  // Shared-secret token given to the rider's phone/app so ONLY that rider
  // can push GPS updates for their own record. Generated automatically.
  accessToken: { type: String, default: () => crypto.randomBytes(20).toString('hex'), select: false }
}, { timestamps: true });
module.exports = mongoose.model('Rider', riderSchema);
