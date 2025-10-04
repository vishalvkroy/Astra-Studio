# 🎓 Astra 3D Education App

> **Professional 3D Education Platform with AI-Powered C++ Tutoring**

An immersive 3D learning environment featuring Astra, your friendly AI coding companion. Learn C++ programming through interactive conversations, quizzes, and visual explanations in a beautiful 3D classroom.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6)
![Three.js](https://img.shields.io/badge/Three.js-0.179.1-000000)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933)

---

## ✨ Features

### 🎯 Core Features

- **🤖 AI-Powered Tutoring** - Astra acts as your friendly coding companion
- **🎮 3D Interactive Classroom** - Immersive learning environment with Three.js
- **🎤 Voice Interaction** - Natural conversation with speech recognition
- **📊 Professional Dashboard** - Track your progress with beautiful charts
- **🏆 Global Leaderboard** - Compete with learners worldwide
- **📝 Smart Notes System** - Auto-save explanations with folder organization
- **✅ Quiz System** - Timed questions based on your skill level
- **📈 Progress Analytics** - Detailed insights into your learning journey

### 🎨 UI/UX Features

- **Glassmorphism Design** - Modern, professional interface
- **Smooth Animations** - Framer Motion powered transitions
- **Dynamic Backgrounds** - 21st.dev inspired effects
- **Responsive Layout** - Works on all devices
- **Dark Theme** - Easy on the eyes
- **Toast Notifications** - Real-time feedback

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- MySQL 8.0+
- MongoDB 6.0+

### Installation

```bash
# 1. Clone or navigate to the project
cd "d:\Astra Studio\3d-education-app"

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../backend
npm install

# 4. Copy 3D models (from old project)
mkdir frontend/public/assets
copy "d:\astra-3d-app\public\assets\*.glb" frontend/public/assets/

# 5. Set up environment variables (see SETUP_GUIDE.md)

# 6. Set up databases (see QUICK_START.md for SQL)

# 7. Start development servers
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Visit **http://localhost:5173** to see the app!

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[FINAL_IMPLEMENTATION_REPORT.md](./FINAL_IMPLEMENTATION_REPORT.md)** - Complete feature list

---

## 🎯 User Workflow

1. **Home Page** → Professional landing page
2. **Login/Register** → Google OAuth or email/password
3. **Dashboard** → View stats, leaderboard, progress
4. **Talk to Astra** → Select your C++ skill level
5. **3D Classroom** → Interactive learning experience
   - Mic OFF by default
   - Click "Talk to Astra" to start
   - Natural conversation for 1.5 minutes
   - Quiz question appears
   - Right answer → Appreciation
   - Wrong answer → Whiteboard explanation (15 seconds)
   - Cycle repeats
6. **Notes** → Save and organize explanations

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with SWC
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MySQL** - Relational database
- **MongoDB** - Document database
- **JWT** - Authentication
- **Multer** - File uploads
- **Socket.io** - Real-time communication

---

## 📁 Project Structure

```
3d-education-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── Character.tsx
│   │   │   │   └── Room.tsx
│   │   │   ├── ProfessionalDashboard.tsx
│   │   │   ├── EnhancedWhiteboard.tsx
│   │   │   ├── ConversationManager.tsx
│   │   │   ├── ExperienceDashboard.tsx
│   │   │   ├── NotesIcon.tsx
│   │   │   └── ChatInterface.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── LevelSelection.tsx
│   │   │   ├── ExperiencePage.tsx
│   │   │   └── NotesPage.tsx
│   │   ├── utils/
│   │   │   ├── barbaTransitions.ts
│   │   │   └── backgroundEffects.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   └── public/
│       └── assets/
│           ├── room.glb
│           └── char.glb
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── questions.ts
│   │   │   ├── chat.ts
│   │   │   ├── user.ts
│   │   │   ├── leaderboard.ts
│   │   │   └── notes.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── mysql.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── server.ts
│   └── uploads/
└── docs/
    ├── QUICK_START.md
    ├── SETUP_GUIDE.md
    └── IMPLEMENTATION_SUMMARY.md
```

---

## 🎮 Key Components

### 3D Experience
- **Character** - Animated 3D avatar with emotions
- **Room** - Interactive 3D classroom environment
- **Whiteboard** - Visual explanations with syntax highlighting

### Dashboard
- **Stats Cards** - Score, questions, rank, streak
- **Charts** - Radar, area, bar, line charts
- **Leaderboard** - Global rankings
- **Profile** - Edit settings and view progress

### Notes System
- **Folder Management** - Organize like PC folders
- **Drag & Drop** - Easy organization
- **Auto-Expiry** - 24-hour temporary notes
- **Search** - Find notes quickly

---

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Rate limiting
- Input validation
- SQL injection prevention

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth

### Questions
- `GET /api/questions/random?level={level}` - Get random question
- `POST /api/questions/answer` - Submit answer

### User
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/progress` - Get progress data
- `PUT /api/user/profile` - Update profile

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Chat
- `POST /api/chat` - AI conversation

---

## 🎨 Customization

### Theme Colors
Edit CSS variables in `frontend/src/styles/*.css`

### AI Personality
Modify responses in `backend/src/routes/chat.ts`

### Questions
Add questions to MySQL `questions` table

---

## 📊 Database Schema

### MySQL Tables
- `users` - User accounts
- `user_stats` - Statistics and progress
- `questions` - Question bank
- `user_answers` - Answer history

### MongoDB Collections
- `notes` - User notes
- `folders` - Note folders

---

## 🤝 Contributing

This is a professional educational project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

MIT License - feel free to use for educational purposes

---

## 🙏 Acknowledgments

- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Recharts** - Charting library
- **21st.dev** - UI inspiration
- **Framer Motion** - Animation library

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review console logs
3. Verify database connections
4. Check environment variables

---

## 🎯 Roadmap

- [ ] OpenAI integration for smarter AI responses
- [ ] More programming languages
- [ ] Multiplayer learning sessions
- [ ] Mobile app version
- [ ] Advanced analytics
- [ ] Certificate system

---

## ⭐ Show Your Support

If you found this project helpful, please give it a star!

---

**Built with ❤️ using React, TypeScript, Three.js, and Node.js**

*Making programming education immersive and fun!*
