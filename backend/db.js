const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'edurank123',
  database: process.env.DB_NAME || 'edu_pvp_new',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database successfully.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'student',
        \`class_level\` INT NOT NULL DEFAULT 12,
        \`phone_number\` VARCHAR(50) DEFAULT NULL,
        \`learning_style\` VARCHAR(50) DEFAULT '',
        \`elo\` INT NOT NULL DEFAULT 100,
        \`xp\` INT NOT NULL DEFAULT 0,
        \`wins\` INT NOT NULL DEFAULT 0,
        \`losses\` INT NOT NULL DEFAULT 0,
        \`draws\` INT NOT NULL DEFAULT 0,
        \`total_battles\` INT NOT NULL DEFAULT 0,
        \`correct_answers\` INT NOT NULL DEFAULT 0,
        \`incorrect_answers\` INT NOT NULL DEFAULT 0,
        \`photo\` LONGTEXT,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Upgrade existing photo columns from VARCHAR(255) to LONGTEXT to support base64 images
    try {
      await connection.query('ALTER TABLE `users` MODIFY `photo` LONGTEXT');
    } catch (e) {
      console.log('Note: Photo column already longtext or could not be altered.');
    }
    
    // Add class_level if not exists
    try {
      await connection.query('ALTER TABLE `users` ADD COLUMN `class_level` INT NOT NULL DEFAULT 12 AFTER `role`');
      console.log('✅ Added class_level column to users table.');
    } catch (e) {
      // Duplicate column error code is 1060
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.log('Note: class_level column already exists or could not be altered.');
      }
    }

    // Add opponent_name to battles if not exists
    try {
      await connection.query('ALTER TABLE `battles` ADD COLUMN `opponent_name` VARCHAR(255) DEFAULT NULL AFTER `opponent_id`');
      console.log('✅ Added opponent_name column to battles table.');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.log('Note: opponent_name column already exists or battles table not yet created.');
      }
    }

    connection.release();
    console.log('✅ MySQL Table `users` is ready.');
  } catch (err) {
    console.warn('⚠️ Warning: MySQL connection not active yet or failed:', err.message);
  }
}

module.exports = { pool, initDb };
