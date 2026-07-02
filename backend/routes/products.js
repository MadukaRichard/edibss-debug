const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const { category, search, page=1, limit=12 } = req.query;
    const q = { isActive: true };
    if (category) q.category = category;
    if (search) q.$text = { $search: search };
    const products = await Product.find(q).skip((page-1)*limit).limit(Number(limit)).sort('-createdAt');
    const total = await Product.countDocuments(q);
    res.json({ products, total, page:Number(page), pages:Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
