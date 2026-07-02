const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');

router.get('/', async (req, res) => {
  try {
    const content = await SiteContent.find({});
    const map = {};
    content.forEach(c => { map[c.key] = c.value; });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
