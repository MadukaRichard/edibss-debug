const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { admin } = require('../config/firebase');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

router.post('/register', [
  body('name').notEmpty(), body('email').isEmail(),
  body('phone').notEmpty(), body('password').isLength({ min:6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, phone, password });
    res.status(201).json({ token: sign(user._id), user: { id:user._id, name:user.name, email:user.email, role:user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && !user.password) return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google instead.' });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), user: { id:user._id, name:user.name, email:user.email, role:user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Google sign-in: the frontend authenticates with Firebase (client-side popup),
// then sends us the resulting Firebase ID token. We verify it server-side with
// the Firebase Admin SDK — never trusting anything the client claims directly —
// then find-or-create a local User so the rest of the app (JWT, roles, orders)
// works exactly the same as with email/password accounts.
router.post('/google', async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(503).json({ message: 'Google sign-in is not configured on the server yet. See README for Firebase setup.' });
    }
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Missing idToken' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;
    if (!email) return res.status(400).json({ message: 'Google account has no email' });

    let user = await User.findOne({ $or: [{ googleId: uid }, { email }] });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId: uid,
        authProvider: 'google',
        avatar: picture,
        phone: ''
      });
    } else if (!user.googleId) {
      // An account with this email already exists (registered with a password) —
      // link the Google identity to it instead of creating a duplicate account.
      user.googleId = uid;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    res.json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone } });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ message: 'Google sign-in failed. Please try again.' });
  }
});

router.get('/me', protect, (req, res) => res.json(req.user));

// Lets a Google-signed-in user (who has no phone on file) add one, since we
// need a phone number for delivery/rider contact.
router.put('/complete-profile', protect, async (req, res) => {
  try {
    const { phone, address } = req.body;
    const update = {};
    if (phone) update.phone = phone;
    if (address) update.address = address;
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/update-location', protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await User.findByIdAndUpdate(req.user._id, { location: { lat, lng } });
    res.json({ message: 'Location updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
