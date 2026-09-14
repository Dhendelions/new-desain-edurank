const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'edurank_jwt_secret_fallback_key';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

function calculateRank(elo) {
  const value = Math.max(0, Number(elo) || 0);
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
       VALUES (?, ?, ?, ?, 'student', ?, '', 100, 0, 0, 0, 0, 0, 0, 0)`,
      [userId, name, email, hashedPassword, phoneNumber]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = formatUserResponse(rows[0]);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

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
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

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

    return res.json({ success: true, user: formatUserResponse(rows[0]) });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sesi telah kadaluarsa.' });
  }
});

// 4. UPDATE USER PROFILE (LEARNING STYLE, STATS)
app.put('/api/user/update', async (req, res) => {
  try {
    const { email, learningStyle, elo, wins, losses, draws, xp, correctAnswers, incorrectAnswers } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [String(email).toLowerCase()]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const current = rows[0];
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
       SET learning_style = ?, elo = ?, xp = ?, wins = ?, losses = ?, draws = ?, total_battles = ?, correct_answers = ?, incorrect_answers = ?
       WHERE id = ?`,
      [updatedStyle, updatedElo, updatedXp, updatedWins, updatedLosses, updatedDraws, totalBattles, updatedCorrect, updatedIncorrect, current.id]
    );

    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [current.id]);
    return res.json({ success: true, user: formatUserResponse(updatedRows[0]) });
  } catch (err) {
    console.error('API Update User Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data user.' });
  }
});

// Fallback to index.html for client side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Start Express Server & initialize DB connection
app.listen(PORT, async () => {
  console.log(`================================================`);
  console.log(`🚀 EduRank Server running at http://localhost:${PORT}`);
  console.log(`================================================`);
  await initDb();
});
