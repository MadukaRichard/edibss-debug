require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');

dotenv.config();
connectDB();
initFirebase();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'] }
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // cross-origin so /uploads images load on the frontend's origin
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Basic abuse protection. Auth endpoints get a stricter limit since they're the
// most common brute-force target.
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts, please try again later' } });
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// Serve uploaded product images / prescriptions
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/products',     require('./routes/products'));
app.use('/api/orders',       require('./routes/orders'));
app.use('/api/riders',       require('./routes/riders'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/delivery',     require('./routes/delivery'));
app.use('/api/site-content', require('./routes/siteContent'));

// Admin routes
app.use('/api/admin/products',     require('./routes/admin/products'));
app.use('/api/admin/orders',       require('./routes/admin/orders'));
app.use('/api/admin/riders',       require('./routes/admin/riders'));
app.use('/api/admin/reviews',      require('./routes/admin/reviews'));
app.use('/api/admin/site-content', require('./routes/admin/siteContent'));
app.use('/api/admin/fee-rules',    require('./routes/admin/feeRules'));
app.use('/api/admin/upload',       require('./routes/admin/upload'));

// Socket.IO — live rider tracking (read-only to clients; location updates only
// come in via the authenticated REST endpoint POST /api/riders/location)
io.on('connection', (socket) => {
  socket.on('rider:join', (riderId) => socket.join(`rider:${riderId}`));
  socket.on('order:track', (orderId) => socket.join(`order:${orderId}`));
  socket.on('disconnect', () => {});
});

app.set('io', io);

// 404 + centralized error handler (also catches multer errors, e.g. oversized files)
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5003;
server.listen(PORT, () => console.log(`MediRun running on port ${PORT}`));
