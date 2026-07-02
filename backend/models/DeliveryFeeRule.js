const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  // Fixed pickup point (pharmacy/warehouse) used to calculate distance and fee.
  // We no longer tie the fee calculation to whichever rider happens to be
  // "available" at checkout time, since riders are now assigned manually by
  // an admin after the order is placed rather than automatically.
  storeLat:         { type: Number, default: 6.5244 },
  storeLng:         { type: Number, default: 3.3792 },
  baseFee:          { type: Number, default: 500 },
  baseFeeMaxKm:     { type: Number, default: 2 },
  perKmRate:        { type: Number, default: 80 },
  peakHourSurcharge:{ type: Number, default: 100 },
  peakHours:        { type: [String], default: ['07:00-09:00','17:00-20:00'] },
  maxRadiusKm:      { type: Number, default: 15 },
  freeDeliveryThreshold: { type: Number, default: 15000 },
  isActive:         { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('DeliveryFeeRule', schema);
