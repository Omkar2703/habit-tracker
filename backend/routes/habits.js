const router = require('express').Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// GET /api/habits?month=2025-03  (all entries for a month or all)
router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user.id };
    if (req.query.month) {
      query.date = { $regex: `^${req.query.month}` };
    }
    const habits = await Habit.find(query).sort({ date: 1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/habits/:date  (single day)
router.get('/:date', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ user: req.user.id, date: req.params.date });
    if (!habit) return res.status(404).json({ message: 'No entry for this date' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/habits/:date  (upsert)
router.put('/:date', auth, async (req, res) => {
  try {
    const { habits, dayNumber } = req.body;
    const entry = await Habit.findOneAndUpdate(
      { user: req.user.id, date: req.params.date },
      { habits, dayNumber },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    // Trigger pre-save for doneCnt calculation
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/habits/:date
router.delete('/:date', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ user: req.user.id, date: req.params.date });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/habits/stats/weekly
router.get('/stats/weekly', auth, async (req, res) => {
  try {
    const entries = await Habit.find({ user: req.user.id }).sort({ date: 1 });
    const weekly = [];
    for (let i = 0; i < entries.length; i += 7) {
      const week = entries.slice(i, i + 7);
      const avg =
        week.reduce((sum, e) => sum + e.percentDone, 0) / week.length;
      weekly.push({
        week: Math.floor(i / 7) + 1,
        startDate: week[0].date,
        endDate: week[week.length - 1].date,
        avgPercent: Math.round(avg),
        days: week.map((e) => ({ date: e.date, percent: e.percentDone, done: e.doneCnt })),
      });
    }
    res.json(weekly);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
