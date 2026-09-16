# EduRank Indonesia - Project Context

## Tech Stack
- **Backend**: Node.js, Express, MySQL (`mysql2/promise`), Socket.IO
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS
- **Authentication**: JWT token stored in localStorage (`edurank-token`), verified via `Bearer <token>` in authorization headers.

## Project Structure
```
New EduRank/
├── backend/
│   ├── server.js          # Express API server with all REST endpoints & auth
│   ├── db.js              # MySQL connection pool, table schema setup & migrations
│   ├── schema.sql         # Reference SQL schema definition
│   ├── battleSocket.js    # Socket.IO battle room handling & real-time PvP engine
│   └── materials.js       # PDF/DOCX material parsing helper
├── client/
│   ├── *.html             # HTML pages: home, battle, materi, profile, leaderboard, etc.
│   ├── css/               # Standard CSS files
│   └── js/
│       ├── header.js      # Global navigation header component
│       ├── app.js         # Client authentication, route protection & utility init
│       ├── home.js        # Home page dashboard, 6-stat card rendering & mission claiming
│       ├── battle.js      # Battle lobby management & mode selection
│       ├── battleEngine.js# Real-time question rendering & answer handling
│       ├── profile.js     # Profile UI, subject ELO ranks, match history & streak stats
│       ├── leaderboard.js # Leaderboard filtering & ranking display (Class 10, 11, 12)
│       └── utils.js       # Formatters & shared helper utilities
└── materi/                # Learning resources storage (PDF/DOCX)
```

## Data Flow (Frontend ↔ Backend ↔ Database)
1. **Frontend**: Makes HTTP `fetch()` requests with JWT in `Authorization` header to `/api/*` endpoints, or establishes Socket.IO websocket connections for real-time PvP.
2. **Backend**: Express middleware validates JWT, executes SQL queries on MySQL via `db.pool`, formats response data, and returns JSON.
3. **Database**: MySQL database (`edu_pvp_new`) stores users, ranks, classes, subjects, user_subjects ELO, battle logs, daily missions, user daily mission progress, and notifications.

## Authentication Flow
- User logs in (`POST /api/login`) or registers (`POST /api/register`).
- Server returns a JWT token signed with `JWT_SECRET`.
- Client stores token in `localStorage.setItem('edurank-token', token)`.
- Client attaches `Authorization: Bearer <token>` on API requests (`/api/me`, `/api/home`, etc.).
- Protected routes inspect `req.headers.authorization` via `authenticateToken` middleware.

## Important APIs
- `GET /api/me` - Profile overview, user level, total ELO, `dailyStreak`, `currentStreak`, `longestStreak`.
- `GET /api/home` - Home dashboard dataset including missions, stats, and streaks.
- `POST /api/missions/claim` - Claim daily mission reward XP & trigger status update.
- `GET /api/leaderboard` - Class & subject filterable leaderboard data.
- `GET /api/battles` - User battle history.
- `POST /api/battles/record` - End-of-battle result logging & ELO calculation.

## Socket.IO / Battle System
- Real-time PvP matching & room creation via `battleSocket.js`.
- Event flow: `joinRoom`, `matchFound`, `submitAnswer`, `roundResult`, `battleEnd`.
- Handles Ranked, Classic, Private Room, and VS AI modes seamlessly.

## Important Project Rules & Constraints
- Retain existing layout styling (Tailwind CSS) & core user features.
- Never write dummy mock data when real MySQL queries can produce live statistics.
- ELO floor is capped at 0 using `GREATEST(0, elo + delta)`.
- Per-subject rankings calculate user positioning via subject ELO (`user_subjects` table).

## Current Known Issues / Notes
- Node process auto-runs on port 3000; ensure background process is active and schema migrations run safely via `initDb()`.
