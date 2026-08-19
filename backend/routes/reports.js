// routes/reports.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => String(req.user?.id || req.ip),
  message: { error: 'Report submission limit reached. Please try again later.' }
});

const ALLOWED_EXTS = { 'image/jpeg': '.jpg', 'image/png': '.png' };

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = ALLOWED_EXTS[file.mimetype];
    cb(null, `${uuidv4()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_EXTS[file.mimetype]) return cb(new Error('Only JPG or PNG images are allowed'));
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });

async function nextPublicId() {
  const year = new Date().getFullYear();
  const row = await db.get('SELECT COUNT(*) AS c FROM reports WHERE public_id LIKE ?', [`CLC-${year}-%`]);
  const seq = (row.c + 1).toString().padStart(4, '0');
  return `CLC-${year}-${seq}`;
}

// POST /api/reports
router.post('/', requireAuth, reportLimiter, upload.single('photo'), async (req, res) => {
  const { location, description } = req.body;
  if (!location || !description)
    return res.status(400).json({ error: 'location and description are required' });

  const public_id = await nextPublicId();
  const photo_path = req.file ? `/uploads/${req.file.filename}` : null;

  const info = await db.run(
    `INSERT INTO reports (public_id, user_id, location, description, photo_path, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [public_id, req.user.id, location, description, photo_path]
  );

  await db.run(
    `INSERT INTO status_history (report_id, old_status, new_status, changed_by_user_id) VALUES (?, NULL, 'Pending', ?)`,
    [info.lastInsertRowid, req.user.id]
  );

  const report = await db.get('SELECT * FROM reports WHERE id = ?', [info.lastInsertRowid]);
  res.status(201).json({ report });
});

// GET /api/reports
router.get('/', requireAuth, async (req, res) => {
  const reports = await db.all(
    'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ reports });
});

module.exports = router;
