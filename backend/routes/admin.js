// routes/admin.js
const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

// GET /api/admin/reports
router.get('/reports', requireAuth, requireRole('admin'), async (req, res) => {
  const reports = await db.all(`
    SELECT r.*, u.full_name AS reported_by, u.email AS reporter_email
    FROM reports r
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `);

  const counts = await db.all('SELECT status, COUNT(*) AS c FROM reports GROUP BY status');

  res.json({ reports, counts });
});

// PATCH /api/admin/reports/:id/status
router.patch('/reports/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status))
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });

  const report = await db.get('SELECT * FROM reports WHERE id = ?', [req.params.id]);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  await db.run('UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?', [status, report.id]);

  await db.run(
    `INSERT INTO status_history (report_id, old_status, new_status, changed_by_user_id) VALUES (?, ?, ?, ?)`,
    [report.id, report.status, status, req.user.id]
  );

  const updated = await db.get('SELECT * FROM reports WHERE id = ?', [report.id]);
  res.json({ report: updated });
});

// GET /api/admin/reports/:id/history
router.get('/reports/:id/history', requireAuth, requireRole('admin'), async (req, res) => {
  const history = await db.all(`
    SELECT h.*, u.full_name AS changed_by
    FROM status_history h JOIN users u ON u.id = h.changed_by_user_id
    WHERE h.report_id = ? ORDER BY h.changed_at ASC
  `, [req.params.id]);
  res.json({ history });
});

module.exports = router;
