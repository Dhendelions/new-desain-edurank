# EduRank Indonesia - Project Context

## Tech Stack
- **Backend**: Node.js + Express + MySQL (mysql2/promise) + Socket.IO
- **Frontend**: HTML + Tailwind CSS + Vanilla JS
- **Auth**: JWT (7d expiry), stored as `edurank-token` in localStorage

## Project Structure
```
New EduRank/
├── backend/
│   ├── server.js        # Main API server (all REST endpoints)
│   ├── db.js            # MySQL pool + initDb migrations
│   ├── schema.sql       # Reference schema
│   ├── battleSocket.js  # Socket.IO battle engine
│   └── materials.js     # PDF/DOCX material reader
├── client/
│   ├── *.html           # Pages: home, battle, materi, profile, leaderboard, etc.
│   ├── css/
│   └── js/
│       ├── header.js    # Reusable header component
│       ├── app.js       # Auth, register, login, routing
│       ├── home.js      # Home page rendering
│       ├── battle.js    # Battle lobby logic
│       ├── battleEngine.js # Real-time battle game logic
│       ├── profile.js   # Profile page
│       ├── leaderboard.js  # Leaderboard page
│       └── utils.js     # Shared utilities
└── materi/              # PDF/DOCX learning materials
```

## Key APIs
| Endpoint | Description |
|---|---|
| POST /api/register | Register - redirects to home.html (VARK removed) |
| POST /api/login | Login - always redirects to home.html |
| GET /api/me | Current user with totalELO + currentStreak + longestStreak |
| GET /api/home | Full home data incl. winstreak |
| GET /api/battles | Battle history (shows actual opponent name, not EduBot) |
| POST /api/battles/record | Record battle (accepts opponentId + opponentName) |
| GET /api/leaderboard | With ?subject=ID&classLevel=10 filters |

## Leaderboard Filter Fix
- Param order fixed: `[subjectId, classLevel]` (JOIN comes before WHERE)

## Winstreak
- Computed from battles table at query time - no schema change needed
- `currentStreak` = consecutive wins from latest battle backwards
- `longestStreak` = longest win streak in history
- Available in /api/me and /api/home responses

## Removed
- VARK learning style: learning-style.html deleted, no more redirects to it

## Constraints
- Never expose raw filesystem paths for materials
- Use GREATEST(0, elo+delta) to prevent negative ELO
- user_subjects table holds per-subject ELO; users.elo is secondary
- Migrations done in db.js initDb() with try/catch
