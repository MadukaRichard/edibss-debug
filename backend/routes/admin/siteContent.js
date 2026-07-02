const express = require('express');
const router = express.Router();
const SiteContent = require('../../models/SiteContent');
const { protect, adminOnly } = require('../../middleware/auth');

router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try { res.json(await SiteContent.find({})); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:key', async (req, res) => {
  try {
    const content = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value, label: req.body.label },
      { new: true, upsert: true }
    );
    res.json(content);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const ops = req.body.map(({ key, value, label }) => ({
      updateOne: { filter:{ key }, update:{ $set:{ value, label } }, upsert:true }
    }));
    await SiteContent.bulkWrite(ops);
    res.json({ message: 'Site content updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
