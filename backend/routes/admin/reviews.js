const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');
const Product = require('../../models/Product');
const { protect, adminOnly } = require('../../middleware/auth');
const { maskPhone } = require('../../utils/phoneUtils');

router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try {
    const q = req.query.status ? { status: req.query.status } : {};
    const reviews = await Review.find(q).populate('product','name').sort('-createdAt');
    res.json(reviews.map(r => ({ ...r.toObject(), phone: maskPhone(r.phone) })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/status', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (req.body.status === 'approved') {
      const approved = await Review.find({ product: review.product, status: 'approved' });
      const avg = approved.reduce((s,r) => s+r.rating, 0) / approved.length;
      await Product.findByIdAndUpdate(review.product, { averageRating: Math.round(avg*10)/10, reviewCount: approved.length });
    }
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
