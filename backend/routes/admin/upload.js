const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
