const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  label: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('SiteContent', schema);
