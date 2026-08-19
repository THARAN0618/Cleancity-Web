// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Something went wrong' });
  next();
});

const PORT = process.env.PORT || 5000;
db._ready.then(() => {
  app.listen(PORT, () => console.log(`CleanCity API listening on http://localhost:${PORT}`));
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
