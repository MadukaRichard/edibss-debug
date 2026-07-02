const express = require('express');
const router = express.Router();
const DeliveryFeeRule = require('../../models/DeliveryFeeRule');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try {
    let rule = await DeliveryFeeRule.findOne({ isActive:true });
    if (!rule) rule = await DeliveryFeeRule.create({});
    res.json(rule);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/', async (req, res) => {
  try {
    let rule = await DeliveryFeeRule.findOne({ isActive:true });
    if (!rule) rule = new DeliveryFeeRule();
    Object.assign(rule, req.body);
    await rule.save();
    res.json(rule);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
