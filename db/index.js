'use strict';

const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool && process.env.DB_NAME && process.env.DB_USER) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      console.log('✦ Database pool initialized');
    } catch (err) {
      console.warn('✦ Database pool init warning:', err.message);
    }
  }
  return pool;
}

// Auto-create tables if database is connected
async function initDb() {
  const p = getPool();
  if (!p) return;

  try {
    const conn = await p.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        service VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS career_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(255) NOT NULL,
        portfolio VARCHAR(500),
        resume VARCHAR(500),
        onsite VARCHAR(50),
        linkedin VARCHAR(500),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try { await conn.query('ALTER TABLE career_applications ADD COLUMN resume VARCHAR(500)'); } catch (e) {}
    try { await conn.query('ALTER TABLE career_applications ADD COLUMN onsite VARCHAR(50)'); } catch (e) {}
    conn.release();
    console.log('✦ Database tables verified');
  } catch (err) {
    console.warn('✦ Database connection check:', err.message);
  }
}

module.exports = {
  getPool,
  initDb,
};
