# ✅ Habit Tracker — MERN Stack

A full-stack habit tracking app based on your habits:
Bath & Dress, Breakfast, Exercise/Gym, Session 1, Lunch, Session 2, Snacks, Swimming, Dinner, Session 3, Sleep.

## Project Structure

```
habit-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Habit.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── habits.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── HabitCheckbox.js
    │   │   └── ProgressRing.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── DayTracker.js
    │   │   └── WeeklyStats.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Features

- **Auth** — Register / Login with JWT
- **Dashboard** — Monthly calendar with color-coded progress rings per day
- **Day Tracker** — Check off each of the 11 daily habits, save to DB
- **Weekly Stats** — Bar chart + table showing weekly average completion %
- **Progress Rings** — Green ≥80%, Yellow 50–79%, Red <50%

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and a JWT_SECRET
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**, proxies API calls to **http://localhost:5000**.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/habits?month=YYYY-MM | Get all entries for a month |
| GET | /api/habits/:date | Get single day entry |
| PUT | /api/habits/:date | Upsert day entry |
| DELETE | /api/habits/:date | Delete day entry |
| GET | /api/habits/stats/weekly | Get weekly aggregated stats |

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your_secret_here
```
