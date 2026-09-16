-- SQL Schema & Migration for EduRank Indonesia
-- Database: edu_pvp
CREATE DATABASE IF NOT EXISTS `edu_pvp_new` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edu_pvp_new`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'student',
  `class_level` INT NOT NULL DEFAULT 12,
  `phone_number` VARCHAR(50) DEFAULT NULL,
  `learning_style` VARCHAR(50) DEFAULT '',
  `elo` INT NOT NULL DEFAULT 400,
  `xp` INT NOT NULL DEFAULT 0,
  `wins` INT NOT NULL DEFAULT 0,
  `losses` INT NOT NULL DEFAULT 0,
  `draws` INT NOT NULL DEFAULT 0,
  `total_battles` INT NOT NULL DEFAULT 0,
  `correct_answers` INT NOT NULL DEFAULT 0,
  `incorrect_answers` INT NOT NULL DEFAULT 0,
  `photo` LONGTEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 1. Tabel Ranks (Konfigurasi Rank)
CREATE TABLE IF NOT EXISTS `ranks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `min_elo` INT NOT NULL,
  `max_elo` INT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Insert Data Rank Default (Abaikan jika sudah ada)
INSERT IGNORE INTO `ranks` (`id`, `name`, `min_elo`, `max_elo`)
VALUES (1, 'Bronze', 0, 200),
  (2, 'Silver', 201, 400),
  (3, 'Gold', 401, 700),
  (4, 'Diamond', 701, 1100),
  (5, 'Master', 1101, 1599),
  (6, 'Profesor', 1600, 999999);
-- 2. Tabel Classes (Kelas 10, 11, 12)
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `level` INT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  UNIQUE KEY `idx_classes_level` (`level`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
INSERT IGNORE INTO `classes` (`id`, `level`, `is_active`)
VALUES (1, 10, TRUE),
  (2, 11, TRUE),
  (3, 12, TRUE);
-- 3. Tabel Subjects (Mata Pelajaran)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `class_id` INT NOT NULL,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
INSERT IGNORE INTO `subjects` (`id`, `name`, `class_id`)
VALUES (1, 'Fisika', 3),
  (2, 'Matematika', 3),
  (3, 'Bahasa Inggris', 3);
INSERT INTO `subjects` (`name`, `class_id`)
SELECT 'Informatika', 3
WHERE NOT EXISTS (SELECT 1 FROM `subjects` WHERE `name` = 'Informatika' AND `class_id` = 3);
-- 4. Tabel User Subjects (ELO per mata pelajaran)
CREATE TABLE IF NOT EXISTS `user_subjects` (
  `user_id` VARCHAR(100) NOT NULL,
  `subject_id` INT NOT NULL,
  `elo` INT NOT NULL DEFAULT 100,
  PRIMARY KEY (`user_id`, `subject_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 5. Tabel Friends
CREATE TABLE IF NOT EXISTS `friends` (
  `user_id_1` VARCHAR(100) NOT NULL,
  `user_id_2` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id_1`, `user_id_2`),
  FOREIGN KEY (`user_id_1`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id_2`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 6. Tabel Friend Requests
CREATE TABLE IF NOT EXISTS `friend_requests` (
  `sender_id` VARCHAR(100) NOT NULL,
  `receiver_id` VARCHAR(100) NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sender_id`, `receiver_id`),
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 7. Tabel Battles (Riwayat Pertandingan)
CREATE TABLE IF NOT EXISTS `battles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `opponent_id` VARCHAR(100),
  `subject_id` INT NOT NULL,
  `result` ENUM('win', 'loss', 'draw') NOT NULL,
  `elo_change` INT NOT NULL,
  `mode` ENUM('ranked', 'classic', 'custom') NOT NULL DEFAULT 'ranked',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`opponent_id`) REFERENCES `users`(`id`) ON DELETE
  SET NULL,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 8. Tabel Missions (Misi Harian)
CREATE TABLE IF NOT EXISTS `missions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `target` INT NOT NULL,
  `progress` INT NOT NULL DEFAULT 0,
  `is_completed` BOOLEAN DEFAULT FALSE,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Daily mission definitions and per-user assignments. Kept separate from the
-- legacy missions table for a non-breaking migration.
CREATE TABLE IF NOT EXISTS `daily_missions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mission_key` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `mission_type` VARCHAR(32) NOT NULL,
  `target` INT NOT NULL,
  `reward_xp` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `user_daily_missions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `mission_id` INT NOT NULL,
  `assigned_date` DATE NOT NULL,
  `progress` INT NOT NULL DEFAULT 0,
  `completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `completed_at` DATETIME NULL,
  UNIQUE KEY `uq_user_mission_day` (`user_id`,`mission_id`,`assigned_date`),
  KEY `idx_udm_user_date` (`user_id`,`assigned_date`),
  KEY `idx_udm_mission` (`mission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- 9. Tabel Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
