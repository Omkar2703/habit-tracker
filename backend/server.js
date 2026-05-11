const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
// const taskRoutes = require('./routes/tasks');
const goalRoutes = require('./routes/goal');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://habit-tracker-ruby-chi.vercel.app/'  // ← your actual Vercel URL
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
// app.use('/api/tasks', taskRoutes);
app.use('/api/goal', goalRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
