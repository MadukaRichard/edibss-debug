const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Rider = require('../models/Rider');
const Order = require('../models/Order');
const { riderAuth } = require('../middleware/auth');

router.post('/location', [
  body('riderId').notEmpty(),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 })
], riderAuth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { riderId, lat, lng, orderId } = req.body;
    await Rider.findByIdAndUpdate(riderId, { location: { lat, lng } });
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { riderLocation: { lat, lng } });
      req.app.get('io').to(`order:${orderId}`).emit('rider:location:update', { lat, lng, riderId });
    }
    res.json({ message: 'Location updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/available', async (req, res) => {
  try {
    const riders = await Rider.find({ status:'available', isActive:true }).select('name location zone');
    res.json(riders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
