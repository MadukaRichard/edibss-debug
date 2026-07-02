const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Rider = require('../models/Rider');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

// Confirms the caller pushing a GPS update actually holds that rider's
// access token, so a stranger can't spoof another rider's location.
exports.riderAuth = async (req, res, next) => {
  try {
    const { riderId } = req.body;
    const token = req.headers['x-rider-token'];
    if (!riderId || !token) return res.status(401).json({ message: 'Rider ID and rider token required' });
    const rider = await Rider.findById(riderId).select('+accessToken');
    if (!rider || rider.accessToken !== token) return res.status(401).json({ message: 'Invalid rider credentials' });
    req.rider = rider;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Rider authentication failed' });
  }
};
