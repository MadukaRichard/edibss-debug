const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { maskPhone } = require('../utils/phoneUtils');

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product:req.params.productId, status:'approved' }).sort('-createdAt');
    res.json(reviews.map(r => ({ ...r.toObject(), phone:maskPhone(r.phone) })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, [
  body('productId').notEmpty().withMessage('Product is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { productId, rating, comment } = req.body;
    const review = await Review.create({ product:productId, user:req.user._id, name:req.user.name, phone:req.user.phone, rating, comment, status:'pending', verifiedPurchase:true });
    res.status(201).json({ message: 'Review submitted — pending moderation', review });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
