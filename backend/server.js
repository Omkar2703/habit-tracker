const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes  = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const goalRoutes  = require('./routes/goal');
const taskRoutes  = require('./routes/tasks');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://habit-tracker-ruby-chi.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: '✅ Habit Tracker API is running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',   authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goal',   goalRoutes);
app.use('/api/tasks',  taskRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`));
  })
  .catch((err) => console.error(err));
