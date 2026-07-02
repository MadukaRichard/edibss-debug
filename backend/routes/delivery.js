const express = require('express');
const router = express.Router();
const { calculateDeliveryFee } = require('../services/deliveryFeeService');

router.post('/calculate-fee', async (req, res) => {
  try {
    const { customerLat, customerLng, orderSubtotal } = req.body;
    if (typeof customerLat !== 'number' || typeof customerLng !== 'number') {
      return res.status(400).json({ message: 'Valid customer coordinates are required' });
    }
    const result = await calculateDeliveryFee({ customerLat, customerLng, orderSubtotal });
    if (result.error) return res.status(400).json({ message: result.error });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
