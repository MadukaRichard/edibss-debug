const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../../models/Product');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

const productValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').optional().isString(),
];

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort('-createdAt');
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', productValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', productValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
