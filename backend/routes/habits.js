const router = require('express').Router();
const Habit = require('../models/Habit');
const UserTask = require('../models/UserTask');
const auth = require('../middleware/auth');

// GET /api/habits?month=YYYY-MM
router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user.id };
    if (req.query.month) query.date = { $regex: `^${req.query.month}` };
    const habits = await Habit.find(query).sort({ date: 1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/habits/:date
router.get('/:date', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ user: req.user.id, date: req.params.date });
    if (!habit) return res.status(404).json({ message: 'No entry for this date' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/habits/:date — upsert with dynamic tasks map
router.put('/:date', auth, async (req, res) => {
  try {
    const { tasks } = req.body; // { taskId: boolean, ... }

    // Validate task IDs belong to this user
    const userTasks = await UserTask.find({ user: req.user.id });
    const validIds = new Set(userTasks.map((t) => t._id.toString()));
    const filteredTasks = {};
    Object.entries(tasks || {}).forEach(([k, v]) => {
      if (validIds.has(k)) filteredTasks[k] = Boolean(v);
    });

    let entry = await Habit.findOne({ user: req.user.id, date: req.params.date });
    if (entry) {
      entry.tasks = filteredTasks;
    } else {
      entry = new Habit({ user: req.user.id, date: req.params.date, tasks: filteredTasks });
    }
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
      const avg = week.reduce((s, e) => s + e.percentDone, 0) / week.length;
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
