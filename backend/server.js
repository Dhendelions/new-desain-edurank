const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool, initDb } = require('./db');
const { getCatalog, getMaterial } = require('./materials');
const { configureBattleSocket } = require('./battleSocket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '7f3c9a1e84d62b5f0a7c91e3d8b46f2a6c0e5d9b17a4f8c2e6b93d0a51f7c4e8';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from client directory
app.use('/materi-files', express.static(path.join(__dirname, '..', 'materi')));
app.use(express.static(path.join(__dirname, '..', 'client')));

function calculateRank(elo) {
  const value = Math.max(0, Number(elo) || 0);
  if (value >= 1600) return 'Profesor';
  if (value >= 1101) return 'Master';
  if (value >= 701) return 'Diamond';
  if (value >= 401) return 'Gold';
  if (value >= 201) return 'Silver';
  return 'Bronze';
}

function formatUserResponse(row) {
  if (!row) return null;
  const wins = Number(row.wins) || 0;
  const losses = Number(row.losses) || 0;
  const draws = Number(row.draws) || 0;
  const elo = Number(row.elo) || 100;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'student',
    phoneNumber: row.phone_number || '',
    learningStyle: row.learning_style || '',
    elo: elo,
    rank: calculateRank(elo),
    xp: Number(row.xp) || 0,
    wins: wins,
    losses: losses,
    draws: draws,
    totalBattles: Number(row.total_battles) || (wins + losses + draws),
    correctAnswers: Number(row.correct_answers) || 0,
    incorrectAnswers: Number(row.incorrect_answers) || 0,
    photo: row.photo || '',
    createdAt: row.created_at
  };
}

function generateUserId(email) {
  const clean = String(email).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `user-${clean}`;
}

async function getDailyMissions(userId) {
  const [definitions] = await pool.query('SELECT * FROM daily_missions WHERE is_active = TRUE ORDER BY id');
  if (definitions.length === 0) return [];
  // Rotate up to four real mission definitions by server date; assignments remain
  // immutable for that user/date after they have been created.
  const today = new Date();
  const start = ((Math.floor(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 86400000) % definitions.length) + definitions.length) % definitions.length;
  const missionCount = Math.min(4, definitions.length);
  const selected = definitions.length <= missionCount
    ? definitions
    : Array.from({ length: missionCount }, (_, i) => definitions[(start + i) % definitions.length]);
  for (const mission of selected) {
    await pool.query(`INSERT IGNORE INTO user_daily_missions (user_id, mission_id, assigned_date)
      VALUES (?, ?, CURDATE())`, [userId, mission.id]);
  }
  const [rows] = await pool.query(`
    SELECT udm.id, dm.title, dm.description, dm.target, dm.reward_xp, dm.mission_type,
           udm.progress, udm.completed, udm.assigned_date, udm.completed_at,
           TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY)) AS seconds_until_reset
    FROM user_daily_missions udm JOIN daily_missions dm ON dm.id = udm.mission_id
    WHERE udm.user_id = ? AND udm.assigned_date = CURDATE() ORDER BY dm.id`, [userId]);

  for (const mission of rows) {
    let progress = 0;
    if (mission.mission_type === 'matches') {
      const [r] = await pool.query("SELECT COUNT(*) count FROM battles WHERE user_id = ? AND mode != 'custom' AND DATE(created_at) = CURDATE()", [userId]); progress = r[0].count;
    } else if (mission.mission_type === 'wins') {
      const [r] = await pool.query("SELECT COUNT(*) count FROM battles WHERE user_id = ? AND result = 'win' AND mode != 'custom' AND DATE(created_at) = CURDATE()", [userId]); progress = r[0].count;
    } else if (mission.mission_type === 'ranked_wins') {
      const [r] = await pool.query("SELECT COUNT(*) count FROM battles WHERE user_id = ? AND result = 'win' AND mode = 'ranked' AND DATE(created_at) = CURDATE()", [userId]); progress = r[0].count;
    }
    const completed = progress >= mission.target;
    await pool.query('UPDATE user_daily_missions SET progress = ?, completed = ?, completed_at = CASE WHEN ? AND completed_at IS NULL THEN NOW() ELSE completed_at END WHERE id = ?', [progress, completed, completed, mission.id]);
    mission.progress = progress; mission.completed = completed;
  }
  return rows;
}

// REST API Endpoints

// 1. REGISTER API
app.post('/api/register', async (req, res) => {
  try {
    const name = String(req.body.name || req.body.fullName || '').trim();
    const email = String(req.body.email || req.body.studentEmail || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phoneNumber = String(req.body.phoneNumber || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Kata sandi minimal 6 karakter.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email ini sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUserId(email);

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, phone_number, learning_style, elo, xp, wins, losses, draws, total_battles, correct_answers, incorrect_answers)
       VALUES (?, ?, ?, ?, 'student', ?, '', 400, 0, 0, 0, 0, 0, 0, 0)`,
      [userId, name, email, hashedPassword, phoneNumber]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = formatUserResponse(rows[0]);

    // Insert default subjects (excluding Matematika Lanjut)
    const [subjectsRows] = await pool.query("SELECT id FROM subjects WHERE name NOT IN ('Matematika Lanjut', 'Matematika Tingkat Lanjut')");
    if (subjectsRows.length > 0) {
      const insertData = subjectsRows.map(sub => [userId, sub.id, 100]);
      await pool.query('INSERT IGNORE INTO user_subjects (user_id, subject_id, elo) VALUES ?', [insertData]);
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      token,
      user
    });
  } catch (err) {
    console.error('API Register DB Warning:', err.message);
    return res.status(503).json({ success: false, isDbError: true, message: 'Database MySQL belum terhubung.' });
  }
});

// 2. LOGIN API
app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body.email || req.body.studentEmail || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [email]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const dbUser = rows[0];
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const user = formatUserResponse(dbUser);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user
    });
  } catch (err) {
    console.error('API Login DB Warning:', err.message);
    return res.status(503).json({ success: false, isDbError: true, message: 'Database MySQL belum terhubung.' });
  }
});

// 3. GET CURRENT USER PROFILE
app.get('/api/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = formatUserResponse(rows[0]);
    // Compute user total ELO from user_subjects
    const [totalEloRow] = await pool.query('SELECT SUM(elo) as totalElo FROM user_subjects WHERE user_id = ?', [decoded.id]);
    const computedElo = totalEloRow[0] && totalEloRow[0].totalElo ? Number(totalEloRow[0].totalElo) : (user.elo || 400);
    user.elo = computedElo;
    user.rank = calculateRank(computedElo);

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sesi telah kadaluarsa.' });
  }
});

// 4. UPDATE USER PROFILE (LEARNING STYLE, STATS, DISPLAY NAME, PHOTO, EMAIL)
app.put('/api/user/update', async (req, res) => {
  try {
    const { email, name, photo, newEmail, learningStyle, elo, wins, losses, draws, xp, correctAnswers, incorrectAnswers } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [String(email).toLowerCase()]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const current = rows[0];
    const updatedName = name !== undefined && String(name).trim() ? String(name).trim() : current.name;
    const updatedPhoto = photo !== undefined ? String(photo).trim() : current.photo;
    const updatedEmail = newEmail !== undefined && String(newEmail).trim() ? String(newEmail).trim().toLowerCase() : current.email;

    const updatedStyle = learningStyle !== undefined ? learningStyle : current.learning_style;
    const updatedElo = elo !== undefined ? Number(elo) : current.elo;
    const updatedWins = wins !== undefined ? Number(wins) : current.wins;
    const updatedLosses = losses !== undefined ? Number(losses) : current.losses;
    const updatedDraws = draws !== undefined ? Number(draws) : current.draws;
    const updatedXp = xp !== undefined ? Number(xp) : current.xp;
    const updatedCorrect = correctAnswers !== undefined ? Number(correctAnswers) : current.correct_answers;
    const updatedIncorrect = incorrectAnswers !== undefined ? Number(incorrectAnswers) : current.incorrect_answers;
    const totalBattles = updatedWins + updatedLosses + updatedDraws;

    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, photo = ?, learning_style = ?, elo = ?, xp = ?, wins = ?, losses = ?, draws = ?, total_battles = ?, correct_answers = ?, incorrect_answers = ?
       WHERE id = ?`,
      [updatedName, updatedEmail, updatedPhoto, updatedStyle, updatedElo, updatedXp, updatedWins, updatedLosses, updatedDraws, totalBattles, updatedCorrect, updatedIncorrect, current.id]
    );

    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [current.id]);
    return res.json({ success: true, user: formatUserResponse(updatedRows[0]) });
  } catch (err) {
    console.error('API Update User Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data user.' });
  }
});

// 5. GET HOME PAGE DATA
app.get('/api/home', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Get User Profile with total ELO
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!userRows || userRows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    const user = formatUserResponse(userRows[0]);

    // Calculate total ELO from user_subjects
    const [totalEloRow] = await pool.query('SELECT SUM(elo) as totalElo FROM user_subjects WHERE user_id = ?', [userId]);
    user.elo = totalEloRow[0] && totalEloRow[0].totalElo ? Number(totalEloRow[0].totalElo) : 400;

    // Compute National Rank position for user
    const [allUsersNational] = await pool.query(`
      SELECT u.id, COALESCE(SUM(us.elo), u.elo, 400) as total_elo
      FROM users u
      LEFT JOIN user_subjects us ON u.id = us.user_id
      GROUP BY u.id
      ORDER BY total_elo DESC, u.created_at ASC
    `);
    const nationalRankPos = allUsersNational.findIndex(r => String(r.id) === String(userId));
    user.nationalRank = nationalRankPos !== -1 ? (nationalRankPos + 1) : 1;

    // Get rank from database or calculateRank helper
    const [rankRows] = await pool.query('SELECT name FROM ranks WHERE min_elo <= ? AND max_elo >= ? LIMIT 1', [user.elo, user.elo]);
    user.rank = rankRows.length > 0 ? rankRows[0].name : calculateRank(user.elo);

    // Get User Subjects Data (excluding Matematika Lanjut)
    const [userSubjects] = await pool.query(`
      SELECT s.id, s.name as subjectName, c.level as classLevel, us.elo
      FROM subjects s JOIN classes c ON s.class_id = c.id
      LEFT JOIN user_subjects us ON us.subject_id = s.id AND us.user_id = ?
      WHERE s.id IN (SELECT MIN(id) FROM subjects WHERE name NOT IN ('Matematika Lanjut', 'Matematika Tingkat Lanjut') GROUP BY name)
      ORDER BY s.id
    `, [userId]);

    // Process user subjects with their individual ranks and actual rank positions
    const subjectsData = await Promise.all(userSubjects.map(async (sub) => {
      const eloVal = sub.elo !== null && sub.elo !== undefined ? Number(sub.elo) : 100;
      const [r] = await pool.query('SELECT name FROM ranks WHERE min_elo <= ? AND max_elo >= ? LIMIT 1', [eloVal, eloVal]);
      
      const [rankPosRows] = await pool.query(`
        SELECT COUNT(*) + 1 as rank_pos
        FROM user_subjects us
        WHERE us.subject_id = ? AND us.elo > ?
      `, [sub.id, eloVal]);
      const rankPos = rankPosRows[0] ? rankPosRows[0].rank_pos : 1;

      return {
        ...sub,
        elo: eloVal,
        rank: r.length > 0 ? r[0].name : 'Bronze',
        rankPos: `#${rankPos}`
      };
    }));

    // Get Leaderboard (Top 10)
    const [leaderboard] = await pool.query(`
      SELECT u.id, u.name, u.photo, u.xp, SUM(us.elo) as total_elo,
             (SELECT name FROM ranks WHERE min_elo <= SUM(us.elo) AND max_elo >= SUM(us.elo) LIMIT 1) as rank_name,
             u.wins, u.total_battles
      FROM users u
      LEFT JOIN user_subjects us ON u.id = us.user_id
      GROUP BY u.id
      ORDER BY total_elo DESC
      LIMIT 10
    `);

    // Get Active Classes & Subjects
    const [classesRows] = await pool.query('SELECT * FROM classes WHERE is_active = TRUE');
    const [subjectsRows] = await pool.query('SELECT * FROM subjects');

    // Get Friends
    const [friends] = await pool.query(`
      SELECT u.id, u.name, u.photo
      FROM friends f
      JOIN users u ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
      WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND u.id != ?
      LIMIT 10
    `, [userId, userId, userId]);

    // Get Missions
    const missions = await getDailyMissions(userId);

    // Get Battles
    const [battles] = await pool.query(`
      SELECT b.id, b.result, b.elo_change, b.mode, b.created_at, u.name as opponent_name, s.name as subject_name
      FROM battles b
      LEFT JOIN users u ON b.opponent_id = u.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get Unread Notifications Count
    const [notifCount] = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);

    return res.json({
      success: true,
      user,
      subjectsData,
      leaderboard,
      classes: classesRows,
      allSubjects: subjectsRows,
      friends,
      missions,
      battles,
      unreadNotifications: notifCount[0].count
    });

  } catch (err) {
    console.error('API Home Data Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data Home.' });
  }
});

// 6. OTHER NEW APIS (Search Friend, Add Friend, Notifications, etc.)
app.get('/api/friends/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.json({ success: true, users: [] });

    // Simplification for search
    const [users] = await pool.query('SELECT id, name, photo FROM users WHERE name LIKE ? LIMIT 10', [`%${q}%`]);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/friends/request', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const senderId = decoded.id;
    const { receiverId } = req.body;

    if (!receiverId || receiverId === senderId) {
      return res.status(400).json({ success: false, message: 'ID penerima tidak valid.' });
    }

    const [senderRows] = await pool.query('SELECT name FROM users WHERE id = ?', [senderId]);
    const senderName = senderRows[0] ? senderRows[0].name : 'Teman EduRank';

    // Insert notification for receiver
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES (?, ?, ?, FALSE, NOW())`,
      [receiverId, 'Permintaan Pertemanan', `${senderName} (ID: ${senderId}) ingin menambahkan kamu sebagai teman.`]
    );

    res.json({ success: true, message: 'Permintaan pertemanan berhasil dikirim!' });
  } catch (err) {
    console.error('Friend Request Error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengirim permintaan pertemanan.' });
  }
});

app.post('/api/friends/accept', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const userId = decoded.id;
    const { senderId, notificationId } = req.body;

    if (senderId) {
      await pool.query('INSERT IGNORE INTO friends (user_id_1, user_id_2) VALUES (?, ?)', [senderId, userId]);
      await pool.query('INSERT IGNORE INTO friends (user_id_1, user_id_2) VALUES (?, ?)', [userId, senderId]);

      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
      const userName = userRows[0] ? userRows[0].name : 'Teman EduRank';

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, is_read, created_at)
         VALUES (?, ?, ?, FALSE, NOW())`,
        [senderId, 'Permintaan Pertemanan Diterima', `${userName} menerima permintaan pertemanan kamu.`]
      );
    }

    if (notificationId) {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
    }

    res.json({ success: true, message: 'Permintaan pertemanan diterima!' });
  } catch (err) {
    console.error('Accept Friend Error:', err);
    res.status(500).json({ success: false, message: 'Gagal menerima pertemanan.' });
  }
});

app.post('/api/friends/decline', async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (notificationId) {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
    }
    res.json({ success: true, message: 'Permintaan pertemanan ditolak.' });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/friends/unfriend', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const userId = decoded.id;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ success: false, message: 'Friend ID required.' });

    await pool.query(
      `DELETE FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
      [userId, friendId, friendId, userId]
    );

    res.json({ success: true, message: 'Teman berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus teman.' });
  }
});

app.post('/api/friends/whisper', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const senderId = decoded.id;
    const { friendId, message } = req.body;

    if (!friendId || !message) return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });

    const [senderRows] = await pool.query('SELECT name FROM users WHERE id = ?', [senderId]);
    const senderName = senderRows[0] ? senderRows[0].name : 'Teman EduRank';

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES (?, ?, ?, FALSE, NOW())`,
      [friendId, `Whisper dari ${senderName}`, message]
    );

    res.json({ success: true, message: 'Whisper terkirim!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengirim pesan.' });
  }
});

app.post('/api/friends/invite-duel', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const senderId = decoded.id;
    const { friendId, mode, subjectId } = req.body;

    if (!friendId) return res.status(400).json({ success: false });

    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const [senderRows] = await pool.query('SELECT name FROM users WHERE id = ?', [senderId]);
    const senderName = senderRows[0] ? senderRows[0].name : 'Teman';

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES (?, ?, ?, FALSE, NOW())`,
      [friendId, 'Tantangan Duel Arena!', `${senderName} mengajak kamu berduel di Custom Scrim (Kode: ${roomCode}). Masukkan kode untuk join!`]
    );

    res.json({ success: true, roomCode, message: `Undangan duel dikirim! Kode Room: ${roomCode}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengirim tantangan duel.' });
  }
});

app.get('/api/user/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, photo, elo, xp, wins, losses, draws, total_battles FROM users WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, user: formatUserResponse(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const [notifs] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 15', [decoded.id]);
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 6.5. BATTLE HISTORY & STATS ENHANCED PERSISTENCE API
app.post('/api/battles/record', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { opponentName, subjectId, result, eloChange, mode, correctCount, incorrectCount } = req.body;
    const battleMode = mode || 'classic';
    const battleResult = result || 'draw';
    const eloDelta = Number(eloChange) || 0;
    const subjId = Number(subjectId) || 1;

    // 1. Insert battle history record
    await pool.query(
      `INSERT INTO battles (user_id, opponent_id, subject_id, result, elo_change, mode, created_at)
       VALUES (?, NULL, ?, ?, ?, ?, NOW())`,
      [userId, subjId, battleResult, eloDelta, battleMode]
    );

    // 2. Determine XP & ELO deltas
    let xpDelta = 0;
    if (battleMode === 'ranked') {
      xpDelta = battleResult === 'win' ? 30 : 10;
    } else if (battleMode === 'classic') {
      xpDelta = battleResult === 'win' ? 20 : 10;
    }

    const isWin = battleResult === 'win' ? 1 : 0;
    const isLoss = battleResult === 'loss' ? 1 : 0;
    const isDraw = battleResult === 'draw' ? 1 : 0;
    const correctAdd = Number(correctCount) || 0;
    const incorrectAdd = Number(incorrectCount) || 0;

    // 3. Update main users table
    await pool.query(
      `UPDATE users 
       SET wins = wins + ?, losses = losses + ?, draws = draws + ?, total_battles = total_battles + 1,
           xp = xp + ?, elo = GREATEST(0, elo + ?), correct_answers = correct_answers + ?, incorrect_answers = incorrect_answers + ?
       WHERE id = ?`,
      [isWin, isLoss, isDraw, xpDelta, eloDelta, correctAdd, incorrectAdd, userId]
    );

    // 4. Update user_subjects table for subject ELO
    if (battleMode === 'ranked') {
      await pool.query(
        `INSERT INTO user_subjects (user_id, subject_id, elo)
         VALUES (?, ?, GREATEST(0, 100 + ?))
         ON DUPLICATE KEY UPDATE elo = GREATEST(0, elo + ?)`,
        [userId, subjId, eloDelta, eloDelta]
      );
    }

    return res.json({ success: true, message: 'Riwayat & statistik pertandingan berhasil dicatat ke database.' });
  } catch (err) {
    console.error('API Record Battle Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mencatat pertandingan.' });
  }
});

app.get('/api/battles', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Sesi tidak valid.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [battles] = await pool.query(`
      SELECT b.id, b.result, b.elo_change, b.mode, b.created_at, 
             COALESCE(u.name, 'Lawan EduBot') as opponent_name, 
             COALESCE(s.name, 'Fisika') as subject_name
      FROM battles b
      LEFT JOIN users u ON b.opponent_id = u.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 20
    `, [decoded.id]);

    return res.json({ success: true, battles });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pertandingan.' });
  }
});

// 7. LEADERBOARD API
app.get('/api/leaderboard', async (req, res) => {
  try {
    const subjectId = req.query.subject;

    if (subjectId) {
      // Leaderboard per mapel (includes all users with default 100 ELO if not in user_subjects)
      const [rows] = await pool.query(`
        SELECT u.id, u.name, u.photo, u.xp, COALESCE(us.elo, 100) as elo,
               u.wins, u.total_battles
        FROM users u
        LEFT JOIN user_subjects us ON us.user_id = u.id AND us.subject_id = ?
        ORDER BY elo DESC, u.created_at ASC
        LIMIT 100
      `, [subjectId]);

      const leaderboard = await Promise.all(rows.map(async (row, index) => {
        const eloVal = Number(row.elo) || 100;
        const [rankRows] = await pool.query('SELECT name FROM ranks WHERE min_elo <= ? AND max_elo >= ? LIMIT 1', [eloVal, eloVal]);
        return {
          position: index + 1,
          id: row.id,
          name: row.name,
          photo: row.photo,
          xp: Number(row.xp) || 0,
          level: Math.floor((Number(row.xp) || 0) / 100) + 1,
          elo: eloVal,
          rank_name: rankRows.length > 0 ? rankRows[0].name : calculateRank(eloVal),
          wins: row.wins,
          total_battles: row.total_battles
        };
      }));

      return res.json({ success: true, leaderboard, type: 'subject' });
    } else {
      // Leaderboard semua mapel (total ELO)
      const [rows] = await pool.query(`
        SELECT u.id, u.name, u.photo, u.xp, COALESCE(SUM(us.elo), 0) as total_elo,
               u.wins, u.total_battles
        FROM users u
        LEFT JOIN user_subjects us ON u.id = us.user_id
        GROUP BY u.id
        ORDER BY total_elo DESC
        LIMIT 100
      `);

      const leaderboard = await Promise.all(rows.map(async (row, index) => {
        const elo = Number(row.total_elo) || 0;
        const [rankRows] = await pool.query('SELECT name FROM ranks WHERE min_elo <= ? AND max_elo >= ? LIMIT 1', [elo, elo]);
        return {
          position: index + 1,
          id: row.id,
          name: row.name,
          photo: row.photo,
          xp: Number(row.xp) || 0,
          level: Math.floor((Number(row.xp) || 0) / 100) + 1,
          elo: elo,
          rank_name: rankRows.length > 0 ? rankRows[0].name : calculateRank(elo),
          wins: row.wins,
          total_battles: row.total_battles
        };
      }));

      return res.json({ success: true, leaderboard, type: 'all' });
    }
  } catch (err) {
    console.error('API Leaderboard Error:', err);
    return res.status(500).json({ success: false, message: 'Leaderboard belum dapat dimuat. Silakan coba lagi.' });
  }
});

// 8. SUBJECTS API
app.get('/api/subjects', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.class_id, c.level as class_level
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      ORDER BY s.name
    `);
    // The legacy database stores advanced mathematics separately. It remains
    // intact for historic ELO, but is one Mathematics choice in the UI/API.
    const merged = rows.filter((row) => row.name !== 'Matematika Lanjut')
      .map((row) => ({ ...row, name: row.name === 'Matematika Lanjut' ? 'Matematika' : row.name }));
    return res.json({ success: true, subjects: merged });
  } catch (err) {
    console.error('API Subjects Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar mata pelajaran.' });
  }
});

// Material catalog is derived from the supplied materi/ tree. PDF/DOCX text is
// extracted server-side and never exposed as raw filesystem paths.
// This endpoint is public (no auth required) to allow material browsing
app.get('/api/materials', async (req, res) => {
  try {
    const catalog = await getCatalog();
    const grouped = {};
    for (const item of catalog) {
      const key = `Kelas ${item.classLevel}`;
      grouped[key] ||= {};
      // Use subject directly (already merged by subjectFromPath in materials.js)
      grouped[key][item.subject] ||= {};
      grouped[key][item.subject][item.subchapter] ||= [];
      grouped[key][item.subject][item.subchapter].push({ id: item.id, title: item.title, type: item.type });
    }
    res.json({ success: true, materials: grouped });
  } catch (err) {
    console.error('Material catalog error:', err.message);
    res.status(500).json({ success: false, message: 'Materi belum dapat dimuat.' });
  }
});

// Material content endpoint - also public for browsing
app.get('/api/materials/:id', async (req, res) => {
  try {
    const material = await getMaterial(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });
    res.json({ success: true, material: { id: material.id, classLevel: material.classLevel, subject: material.subject, subchapter: material.subchapter, title: material.title, type: material.type, content: material.text || 'Materi belum tersedia dalam format teks.' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Materi belum dapat dibuka.' });
  }
});

// 9. RANKS API
app.get('/api/ranks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ranks ORDER BY min_elo ASC');
    return res.json({ success: true, ranks: rows });
  } catch (err) {
    console.error('API Ranks Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi rank.' });
  }
});

// Fallback to index.html for client side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Start Express Server & initialize DB connection
configureBattleSocket(server, JWT_SECRET);
server.listen(PORT, async () => {
  console.log(`================================================`);
  console.log(`🚀 EduRank Server running at http://localhost:${PORT}`);
  console.log(`================================================`);
  await initDb();
});
