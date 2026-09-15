# EduRank Indonesia - Project Documentation

## Project Overview
EduRank Indonesia is an educational platform that combines learning with competitive elements, featuring real-time PvP battles, comprehensive learning materials, and a ranking system.

## Technology Stack
- **Backend**: Node.js, Express, MySQL, Socket.IO
- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Authentication**: JWT tokens
- **Database**: MySQL with comprehensive schema for users, battles, materials, etc.

## Project Structure
```
New EduRank/
├── backend/
│   ├── server.js          # Main Express server with API endpoints
│   ├── db.js              # Database connection and initialization
│   ├── schema.sql         # Database schema and migrations
│   ├── battleSocket.js    # Socket.IO battle system
│   └── materials.js       # PDF/DOCX material processing
├── client/
│   ├── *.html             # Page templates (home, battle, materi, profile, etc.)
│   ├── css/               # Stylesheets
│   ├── js/
│   │   ├── header.js      # Reusable header component with navigation
│   │   ├── app.js         # Shared utilities and page initialization
│   │   ├── home.js        # Home page logic
│   │   ├── battle.js      # Battle page logic
│   │   ├── profile.js     # Profile page logic
│   │   ├── leaderboard.js # Leaderboard page logic
│   │   └── utils.js       # Shared utility functions
├── materi/                # Learning materials (PDF/DOCX files)
└── package.json
```

## Key Features
1. **Authentication System**: JWT-based auth with login/register
2. **Battle System**: Real-time PvP battles with Socket.IO
3. **Learning Materials**: Comprehensive materials organized by class and subject
4. **Ranking System**: ELO-based ranking per subject
5. **Daily Missions**: Gamified learning with daily quests
6. **Leaderboard**: Global and subject-specific rankings

## API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user profile
- `PUT /api/user/update` - Update user profile
- `GET /api/home` - Get home page data (user stats, missions, battles, etc.)
- `GET /api/subjects` - Get available subjects
- `GET /api/materials` - Get material catalog
- `GET /api/materials/:id` - Get specific material content
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/notifications` - Get user notifications

## Database Schema
- `users` - User accounts with stats and learning styles
- `ranks` - Rank configurations (Bronze, Silver, Gold, etc.)
- `classes` - Class levels (10, 11, 12)
- `subjects` - Available subjects per class
- `user_subjects` - User ELO per subject
- `battles` - Battle history
- `daily_missions` - Daily mission definitions
- `user_daily_missions` - User daily mission progress
- `notifications` - User notifications
- `friends` - Friend relationships

## Development Commands
- `npm start` - Start the server (port 3000)
- `npm run dev` - Start with file watching

## Environment Variables
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT signing secret
- Database connection configured in `backend/db.js`

## Recent Improvements
1. **Home Page Refactoring**: Removed duplicate features (leaderboard, battle mode selector, materi selector) and focused on user activity dashboard
2. **Battle Page Enhancement**: Fixed all battle mode buttons (Ranked, Classic, Private Room, VS AI) with proper Socket.IO integration
3. **Navigation System**: Implemented URL-based active states with proper browser history support
4. **Button Functionality**: Audited and fixed all non-functional buttons across the application
5. **Code Structure**: Created shared utilities in `utils.js` to reduce code duplication
6. **Material Browser**: Improved material hierarchy with proper class/subject/subchapter organization

## Navigation Routes
- `/` or `/home.html` - Home dashboard
- `/battle.html` - Battle mode selection
- `/materi.html` - Learning materials browser
- `/profile.html` - User profile
- `/leaderboard.html` - Leaderboard
- `/feedback.html` - Feedback page (accessible via footer)
- `/login.html` - Login page
- `/register.html` - Registration page
- `/learning-style.html` - Learning style assessment

## Important Notes
- The project uses real data from the MySQL database, not dummy data
- Socket.IO is used for real-time battle functionality
- Materials are processed server-side from PDF/DOCX files in the `materi/` directory
- Header component is reusable across all pages with consistent navigation
- Feedback is removed from main navigation but accessible via footer
- All authentication and user sessions are preserved