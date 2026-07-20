const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../../models/Order');
const Rider = require('../../models/Rider');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const q = status ? { status } : {};
    const orders = await Order.find(q)
      .populate('customer','name phone')
      .populate('rider','name phone')
      .sort('-createdAt')
      .skip((page-1)*limit).limit(Number(limit));
    const total = await Order.countDocuments(q);
    res.json({ orders, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/status', [
  body('status').isIn(['pending_payment','pending','confirmed','preparing','in_transit','delivered','cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id,
      { status, ...(status==='delivered' ? { deliveredAt: new Date() } : {}) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if ((status === 'delivered' || status === 'cancelled') && order.rider) {
      await Rider.findByIdAndUpdate(order.rider, { status: 'available' });
    }
    req.app.get('io').to(`order:${order._id}`).emit('order:status:update', { status, orderNumber: order.orderNumber });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Manual bank-transfer confirmation: admin checks their bank account, sees the
// money has actually landed, and marks the order as paid/confirmed. A rider is
// then assigned separately via the assign-rider endpoint below.
router.put('/:id/confirm-payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'bank_transfer') return res.status(400).json({ message: 'This order is not a bank-transfer order' });
    if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'Payment already confirmed' });

    order.paymentStatus = 'paid';
    order.paymentConfirmedAt = new Date();
    order.paymentConfirmedBy = req.user._id;
    order.status = 'confirmed';
    await order.save();

    req.app.get('io').to(`order:${order._id}`).emit('order:status:update', { status: order.status, orderNumber: order.orderNumber });

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Manual rider assignment. Since there's no live GPS matching, the admin picks
// an available rider from the list themselves (e.g. based on zone / who's free).
router.put('/:id/assign-rider', [
  body('riderId').notEmpty().withMessage('riderId is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Confirm payment before assigning a rider to this order' });
    }
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot assign a rider to a ${order.status} order` });
    }

    const { riderId } = req.body;
    const rider = await Rider.findById(riderId);
    if (!rider) return res.status(404).json({ message: 'Rider not found' });
    if (!rider.isActive) return res.status(400).json({ message: 'This rider is inactive' });

    // Free up the previously-assigned rider (if reassigning).
    if (order.rider && order.rider.toString() !== riderId) {
      await Rider.findByIdAndUpdate(order.rider, { status: 'available' });
    }

    order.rider = rider._id;
    if (order.status === 'confirmed' || order.status === 'pending') order.status = 'preparing';
    await order.save();
    await Rider.findByIdAndUpdate(rider._id, { status: 'on_delivery' });

    req.app.get('io').to(`rider:${rider._id}`).emit('new:order', { orderId:order._id, orderNumber:order.orderNumber, deliveryAddress:order.deliveryAddress, deliveryLocation:order.deliveryLocation });
    req.app.get('io').to(`order:${order._id}`).emit('order:status:update', { status: order.status, orderNumber: order.orderNumber });

    req.app.get('io').to(`order:${order._id}`).emit('rider:assigned', { 
      rider: { name: rider.name, phone: rider.phone, vehicle: rider.vehicle },
      location: rider.location
    });
    res.json(await order.populate('rider', 'name phone vehicle'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const [totalToday, revenueArr, activeRiders, avgArr] = await Promise.all([
      Order.countDocuments({ createdAt:{ $gte:today } }),
      Order.aggregate([{ $match:{ createdAt:{ $gte:today }, status:'delivered' } },{ $group:{ _id:null, total:{ $sum:'$total' } } }]),
      Rider.countDocuments({ status:{ $in:['available','on_delivery'] }, isActive:true }),
      Order.aggregate([{ $match:{ status:'delivered' } },{ $group:{ _id:null, avgTime:{ $avg:'$estimatedDeliveryTime' } } }])
    ]);
    res.json({ ordersToday:totalToday, revenueToday:revenueArr[0]?.total||0, activeRiders, avgDeliveryTime:Math.round(avgArr[0]?.avgTime||18) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
