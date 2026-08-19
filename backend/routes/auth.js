// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later.' }
});

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

function isStrongPassword(pw) {
  return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password)
    return res.status(400).json({ error: 'full_name, email and password are required' });
  if (!isStrongPassword(password))
    return res.status(400).json({ error: 'Password must be at least 8 characters and include a letter and a number' });

  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const cost = parseInt(process.env.BCRYPT_COST || '12', 10);
  const password_hash = await bcrypt.hash(password, cost);

  const info = await db.run(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [full_name, email.toLowerCase(), password_hash, 'resident']
  );

  const user = { id: info.lastInsertRowid, role: 'resident', email: email.toLowerCase() };
  const token = signToken(user);

  res.status(201).json({ token, user: { id: user.id, full_name, email: user.email, role: 'resident' } });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  const row = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  const dummyHash = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8O6a1x1a1x1a1x1a1x1a1x1a1x1a1x';
  const match = await bcrypt.compare(password, row ? row.password_hash : dummyHash);

  if (!row || !match) return res.status(401).json({ error: 'Invalid email or password' });

  const token = signToken(row);
  res.json({ token, user: { id: row.id, full_name: row.full_name, email: row.email, role: row.role } });
});

module.exports = router;
