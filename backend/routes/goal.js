const router = require('express').Router();
const User = require('../models/User');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// GET /api/goal  — get current goal + stats
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('dailyGoal name');
    const entries = await Habit.find({ user: req.user.id }).sort({ date: 1 });

    const goal = user.dailyGoal ?? 80;
    const totalDays = entries.length;
    const hitDays = entries.filter((e) => e.percentDone >= goal).length;
    const missedDays = totalDays - hitDays;
    const hitRate = totalDays ? Math.round((hitDays / totalDays) * 100) : 0;

    // Current goal streak (consecutive hit days from today backwards)
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    let goalStreak = 0;
    for (const e of sorted) {
      if (e.percentDone >= goal) goalStreak++;
      else break;
    }

    // Last 30 days breakdown
    const today = new Date();
    const last30 = entries.filter((e) => {
      const diff = (today - new Date(e.date)) / 86400000;
      return diff >= 0 && diff < 30;
    });
    const last30Hit = last30.filter((e) => e.percentDone >= goal).length;
    const last30Total = last30.length;

    res.json({
      goal,
      totalDays,
      hitDays,
      missedDays,
      hitRate,
      goalStreak,
      last30: { hit: last30Hit, missed: last30Total - last30Hit, total: last30Total },
      dailyBreakdown: entries.map((e) => ({
        date: e.date,
        percent: e.percentDone,
        hit: e.percentDone >= goal,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/goal  — update goal
router.put('/', auth, async (req, res) => {
  try {
    const { dailyGoal } = req.body;
    if (!dailyGoal || dailyGoal < 1 || dailyGoal > 100)
      return res.status(400).json({ message: 'Goal must be between 1 and 100' });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { dailyGoal },
      { new: true }
    ).select('dailyGoal name email');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
