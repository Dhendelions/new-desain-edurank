# EduRank Indonesia - Project Context

## Tech Stack
- **Backend**: Node.js + Express + MySQL (mysql2/promise) + Socket.IO + JWT (jsonwebtoken) + bcryptjs
- **Frontend**: HTML + Vanilla JS + TailwindCSS (CDN) + Material Symbols (Google Fonts)
- **Port**: 3000 (configurable via .env PORT)
- **DB**: MySQL database `edu_pvp_new`

## Project Structure
```
New EduRank/
├── backend/
│   ├── server.js        # Express REST API (all endpoints)
│   ├── db.js            # MySQL pool + initDb() with auto-migrations
│   ├── schema.sql       # Full schema (CREATE TABLE + ALTER migrations)
│   ├── battleSocket.js  # Socket.IO battle/matchmaking server
│   └── materials.js     # PDF/DOCX material file processor
├── client/
│   ├── *.html           # Pages: home, battle, materi, profile, leaderboard, login, register, etc.
│   ├── js/
│   │   ├── utils.js        # getApiUrl(), calculateRank(), escapeHtml()
│   │   ├── app.js          # Auth (login/register forms), localStorage helpers, clearStaleUserData()
│   │   ├── header.js       # Reusable Header class (nav, user info, notifications)
│   │   ├── battle.js       # BattlePageManager - lobby UI, matchmaking, result display
│   │   ├── battleEngine.js # BattleEngine class - game loop, timer, socket events, AI
│   │   ├── home.js         # Home page data loading (stats, missions, friends, battle history)
│   │   ├── leaderboard.js  # Leaderboard page - filter tabs, table render
│   │   └── profile.js      # Profile page - stats, battle history, photo upload
│   └── css/
└── materi/              # PDF/DOCX material files organized by subject
```

## Frontend ↔ Backend ↔ Database Flow
1. HTML loads → JS fetches `getApiUrl('/api/...')` (resolves to `http://localhost:3000`)
2. Backend Express handles REST routes, queries MySQL via `pool`
3. Socket.IO handles real-time battle (matchmaking, score sync, question advance)
4. Results written to `battles` table; user stats updated in `users` table

## Authentication Flow
1. `POST /api/register` → bcrypt hash password → INSERT users → sign JWT → return `{token, user}`
2. `POST /api/login` → bcrypt compare → sign JWT → return `{token, user}`
3. Client stores token in `localStorage.getItem('edurank-token')`
4. Protected endpoints: `Authorization: Bearer <token>` header → `jwt.verify()`
5. Socket.IO auth: `socket.handshake.auth.token` → verified in io.use() middleware
6. `clearStaleUserData()` in app.js purges old user localStorage on login/register

## Important API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/register | Register new user |
| POST | /api/login | Login |
| GET | /api/me | Get current user profile |
| PUT | /api/user/update | Update user (photo, learning style) |
| GET | /api/home | Home page data (stats, missions, friends, battles, leaderboard) |
| GET | /api/subjects | List all subjects (with class_level) |
| GET | /api/leaderboard | Leaderboard (query: ?subject=id, ?classLevel=10/11/12) |
| GET | /api/materials | Material catalog |
| GET | /api/materials/:id | Material content |
| POST | /api/battles/record | Record battle result, update XP/ELO |
| GET | /api/battles | Get battle history (uses opponent_name column) |
| GET | /api/notifications | User notifications |

## Socket.IO / Battle System
- **Server**: `battleSocket.js` - manages `queues` Map + `rooms` Map
- **Queue events**: `queue_ranked`, `queue_classic`, `cancel_queue`
- **Room events**: `create_room`, `join_room`, `match_found`
- **Battle events**: `battle_answer`, `player_ready_next`, `next_question`, `player_score_update`
- **End events**: `battle_finish`, `opponent_disconnected`, `battle_forfeit` (new)
- **Class segregation**: Queues keyed as `ranked_fisika_12` (mode_subject_classLevel)
- **Failsafe**: 15-second timeout on `player_ready_next` before forcing next question

## Database Schema (Key Tables)
- `users`: id (VARCHAR), name, email, password (bcrypt), class_level, elo, xp, wins, losses, draws, total_battles
- `battles`: id, user_id, opponent_id (NULL for AI/classic), **opponent_name** (VARCHAR 255), subject_id, result, elo_change, mode, created_at
- `subjects`: id, name, class_id (FK → classes)
- `classes`: id, level (10/11/12)
- `user_subjects`: user_id, subject_id, elo (per-subject ELO for ranked)
- `daily_missions` + `user_daily_missions`: daily quest system

## XP & ELO Rules
- **Ranked win**: +50 XP, +15 ELO | **Ranked loss**: +10 XP, -10 ELO | **Ranked draw**: +25 XP, 0 ELO
- **Classic win**: +50 XP, 0 ELO | **Classic draw/loss**: +10-20 XP, 0 ELO
- **Custom/AI**: 0 XP, 0 ELO

## Anti-Cheat
- `visibilitychange` listener in `BattleEngine.bindUI()` detects tab switch during ranked
- Triggers `finishBattle()` with `userScore = -999` (guaranteed loss)
- Also emits `battle_forfeit` socket event so opponent auto-wins via `opponent_forfeited` event
- Guard flag `this.battleFinished` prevents duplicate `finishBattle()` calls

## Important Constraints
- Do NOT add "Kurikulum Merdeka" or "Kelas 12" text in UI
- Battle history must show real `opponent_name` (not "Lawan EduBot")
- `localStorage.setItem('edurank-token', ...)` is the auth key
- `clearStaleUserData()` must be called on login/register success
- LP terminology replaced by ELO throughout the UI
- Leaderboard page: filtered by class (X/XI/XII) first, then by subject
- Home page: leaderboard section removed
