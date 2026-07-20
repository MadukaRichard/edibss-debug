const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  // FIX: Removed required: true here!
  phone:    { type: String, default: '' }, 
  // Password is only required for locally-registered accounts. Google-auth
  // accounts have no password at all — they sign in via Firebase instead.
  password: { type: String, minlength: 6, select: true },
  authProvider: { type: String, enum: ['local','google'], default: 'local' },
  googleId: { type: String, unique: true, sparse: true },
  avatar:   { type: String },
  role:     { type: String, enum: ['customer','admin'], default: 'customer' },
  address:  { type: String },
  location: { lat: Number, lng: Number }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  if (!this.password) return false; // Google-only account, no local password set
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);