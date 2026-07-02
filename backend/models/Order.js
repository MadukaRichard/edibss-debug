const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:      [orderItemSchema],
  subtotal:   { type: Number, required: true },
  deliveryFee:{ type: Number, required: true },
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['pending_payment','pending','confirmed','preparing','in_transit','delivered','cancelled'], default: 'pending' },
  rider:      { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  riderLocation: { lat: Number, lng: Number },
  estimatedDeliveryTime: { type: Number },
  paymentMethod: { type: String, enum: ['cash','card','bank_transfer'], default: 'cash' },
  // Manual bank-transfer flow: customer transfers to the admin-configured account,
  // then an admin manually confirms the payment before a rider is assigned.
  paymentStatus: { type: String, enum: ['unpaid','awaiting_confirmation','paid'], default: 'unpaid' },
  paymentConfirmedAt: { type: Date },
  paymentConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prescriptionImage: { type: String },
  notes:    { type: String },
  deliveredAt: { type: Date }
}, { timestamps: true });
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `MR-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});
module.exports = mongoose.model('Order', orderSchema);
