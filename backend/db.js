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
    console.log('✅ Database connection successful.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'student',
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
        \`photo\` VARCHAR(255) DEFAULT '',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Additive schema: these tables are intentionally separate from the legacy
    // missions table so existing installations and history stay intact.
    await connection.query(`CREATE TABLE IF NOT EXISTS daily_missions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mission_key VARCHAR(64) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(500) NOT NULL,
      mission_type VARCHAR(32) NOT NULL,
      target INT NOT NULL,
      reward_xp INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await connection.query(`CREATE TABLE IF NOT EXISTS user_daily_missions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      mission_id INT NOT NULL,
      assigned_date DATE NOT NULL,
      progress INT NOT NULL DEFAULT 0,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at DATETIME NULL,
      UNIQUE KEY uq_user_mission_day (user_id, mission_id, assigned_date),
      KEY idx_udm_user_date (user_id, assigned_date),
      KEY idx_udm_mission (mission_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await connection.query(`INSERT IGNORE INTO daily_missions (mission_key,title,description,mission_type,target,reward_xp) VALUES
      ('win_3','Menangkan 3 Pertandingan','Menangkan tiga pertandingan hari ini.','wins',3,60),
      ('play_5','Mainkan 5 Pertandingan','Selesaikan lima pertandingan hari ini.','matches',5,40),
      ('answer_20','Jawab 20 Soal','Jawab dua puluh soal hari ini.','answers',20,40),
      ('ranked_win_1','Menangkan 1 Ranked Match','Raih kemenangan pada satu pertandingan ranked hari ini.','ranked_wins',1,70),
      ('accuracy_70','Raih 70% Akurasi','Pertahankan akurasi jawaban minimal 70% hari ini.','accuracy',70,50)`);
    
    // Check if subjects table exists before attempting to insert
    const [subjectsCheck] = await connection.query(`SHOW TABLES LIKE 'subjects'`);
    if (subjectsCheck.length > 0) {
      await connection.query(`INSERT INTO subjects (name, class_id)
        SELECT 'Informatika', 3 WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = 'Informatika' AND class_id = 3)`);
    } else {
      console.log('⚠️ Schema setup required: Run backend/schema.sql on your database to create all required tables.');
    }

    connection.release();
    console.log('✅ Basic database tables initialized.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.error('❌ Missing table detected. Please run backend/schema.sql on your database.');
    }
  }
}

module.exports = { pool, initDb };
