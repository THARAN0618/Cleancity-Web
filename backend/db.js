// db.js — MySQL via mysql2/promise
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'cleancity',

  ssl: {
    rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('resident','admin') NOT NULL DEFAULT 'resident',
  ward          VARCHAR(255) DEFAULT 'Ward 14 - Gandhipuram',
  created_at    DATETIME NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  public_id   VARCHAR(50) NOT NULL UNIQUE,
  user_id     INT NOT NULL,
  location    TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_path  VARCHAR(500),
  status      ENUM('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
  ward        VARCHAR(255) DEFAULT 'Ward 14 - Gandhipuram',
  created_at  DATETIME NOT NULL DEFAULT NOW(),
  updated_at  DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS status_history (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  report_id           INT NOT NULL,
  old_status          VARCHAR(50),
  new_status          VARCHAR(50) NOT NULL,
  changed_by_user_id  INT NOT NULL,
  changed_at          DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);
`;

// Helper: run each CREATE TABLE statement separately
async function initSchema() {
  const stmts = SCHEMA.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of stmts) {
    await pool.execute(stmt);
  }
}

// Unified query helpers used by all routes
const db = {
  // Returns { insertId, affectedRows }
  async run(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return { lastInsertRowid: result.insertId, changes: result.affectedRows };
  },
  // Returns first row or undefined
  async get(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  },
  // Returns all rows
  async all(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  _ready: null
};

db._ready = initSchema();

module.exports = db;
