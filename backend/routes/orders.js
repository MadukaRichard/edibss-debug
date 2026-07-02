const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { calculateDeliveryFee } = require('../services/deliveryFeeService');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('prescriptionImage'), [
  body('items').custom(v => {
    try { const parsed = typeof v === 'string' ? JSON.parse(v) : v; return Array.isArray(parsed) && parsed.length > 0; }
    catch { return false; }
  }).withMessage('At least one item is required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('paymentMethod').isIn(['cash','card','bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
    const deliveryLocation = typeof req.body.deliveryLocation === 'string' ? JSON.parse(req.body.deliveryLocation) : req.body.deliveryLocation;
    const { deliveryAddress, paymentMethod, notes } = req.body;

    if (!deliveryLocation || typeof deliveryLocation.lat !== 'number' || typeof deliveryLocation.lng !== 'number') {
      return res.status(400).json({ message: 'A valid delivery location is required' });
    }

    // Re-check stock/price server-side rather than trusting the client's cart numbers.
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let requiresPrescription = false;
    let subtotal = 0;
    const verifiedItems = items.map(i => {
      const p = productMap.get(i.product);
      if (!p) throw new Error(`Product ${i.name || i.product} is no longer available`);
      if (i.quantity < 1) throw new Error(`Invalid quantity for ${p.name}`);
      if (p.stock < i.quantity) throw new Error(`Only ${p.stock} left in stock for ${p.name}`);
      if (p.requiresPrescription) requiresPrescription = true;
      subtotal += p.price * i.quantity;
      return { product: p._id, name: p.name, price: p.price, quantity: i.quantity };
    });

    if (requiresPrescription && !req.file) {
      return res.status(400).json({ message: 'One or more items require a prescription upload' });
    }

    const fee = await calculateDeliveryFee({ customerLat:deliveryLocation.lat, customerLng:deliveryLocation.lng, orderSubtotal:subtotal });
    if (fee.error) return res.status(400).json({ message: fee.error });

    const isBankTransfer = paymentMethod === 'bank_transfer';

    // No rider is assigned at order time — an admin assigns an available rider
    // manually from the Orders dashboard once the order (and payment, for bank
    // transfer) is confirmed. This avoids needing a live-GPS "nearest rider"
    // matching system.
    const order = await Order.create({
      customer: req.user._id,
      items: verifiedItems,
      subtotal,
      deliveryFee: fee.fee,
      total: subtotal + fee.fee,
      deliveryAddress,
      deliveryLocation,
      estimatedDeliveryTime: fee.estimatedMinutes,
      paymentMethod,
      paymentStatus: isBankTransfer ? 'awaiting_confirmation' : 'unpaid',
      status: isBankTransfer ? 'pending_payment' : 'confirmed',
      notes,
      prescriptionImage: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    req.app.get('io').to(`order:${order._id}`).emit('order:status:update', { status: order.status, orderNumber: order.orderNumber });

    res.status(201).json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer:req.user._id }).populate('rider','name phone vehicle').sort('-createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product').populate('rider','name phone vehicle plateNumber location');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
