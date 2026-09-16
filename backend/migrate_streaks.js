const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'edu_pvp_new',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function migrate() {
  try {
    // MySQL 5.7/8.0 without MariaDB 10.3 might not support "IF NOT EXISTS" on ADD COLUMN,
    // so we handle errors gracefully.
    const queries = [
      'ALTER TABLE `users` ADD COLUMN `current_streak` INT DEFAULT 0;',
      'ALTER TABLE `users` ADD COLUMN `longest_streak` INT DEFAULT 0;',
      'ALTER TABLE `users` ADD COLUMN `daily_streak` INT DEFAULT 1;',
      'ALTER TABLE `users` ADD COLUMN `last_login_date` DATE;'
    ];
    for (let q of queries) {
      try {
        await pool.query(q);
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.error(e);
        }
      }
    }
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
