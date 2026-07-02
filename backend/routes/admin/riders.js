const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Rider = require('../../models/Rider');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try {
    res.json(await Rider.find({}).sort('-createdAt'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Reveals the rider's location-tracking token (never returned by other endpoints).
// Give this to the rider so their tracking device/app can authenticate.
router.get('/:id/token', async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id).select('+accessToken name');
    if (!rider) return res.status(404).json({ message: 'Rider not found' });
    res.json({ riderId: rider._id, name: rider.name, accessToken: rider.accessToken });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', [
  body('name').notEmpty(), body('phone').notEmpty(), body('zone').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const rider = await Rider.create(req.body);
    res.status(201).json(rider);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const rider = await Rider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rider) return res.status(404).json({ message: 'Rider not found' });
    res.json(rider);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rider removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
