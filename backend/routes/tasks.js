const router = require('express').Router();
const UserTask = require('../models/UserTask');
const auth = require('../middleware/auth');

const DEFAULT_TASKS = [
  { label: 'Bath & Dress',   emoji: '🛁' },
  { label: 'Breakfast',      emoji: '🍳' },
  { label: 'Exercise / Gym', emoji: '🏋️' },
  { label: 'Session 1',      emoji: '📚' },
  { label: 'Lunch',          emoji: '🍱' },
  { label: 'Session 2',      emoji: '📚' },
  { label: 'Snacks',         emoji: '🍎' },
  { label: 'Swimming',       emoji: '🏊' },
  { label: 'Dinner',         emoji: '🍽️' },
  { label: 'Session 3',      emoji: '📚' },
  { label: 'Sleep',          emoji: '😴' },
];

// GET /api/tasks — fetch all, seed defaults if none
router.get('/', auth, async (req, res) => {
  try {
    let tasks = await UserTask.find({ user: req.user.id }).sort({ order: 1 });
    if (!tasks.length) {
      tasks = await UserTask.insertMany(
        DEFAULT_TASKS.map((t, i) => ({ ...t, user: req.user.id, order: i }))
      );
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — add a new task
router.post('/', auth, async (req, res) => {
  try {
    const { label, emoji } = req.body;
    if (!label || !label.trim())
      return res.status(400).json({ message: 'Label is required' });
    const count = await UserTask.countDocuments({ user: req.user.id });
    const task = await UserTask.create({
      user: req.user.id,
      label: label.trim(),
      emoji: emoji || '✅',
      order: count,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id — edit label or emoji
router.put('/:id', auth, async (req, res) => {
  try {
    const { label, emoji } = req.body;
    const update = {};
    if (label !== undefined) update.label = label.trim();
    if (emoji !== undefined) update.emoji = emoji;
    const task = await UserTask.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/batch/reorder — update order for all tasks
router.put('/batch/reorder', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids))
      return res.status(400).json({ message: 'ids must be an array' });
    await Promise.all(
      ids.map((id, i) =>
        UserTask.findOneAndUpdate({ _id: id, user: req.user.id }, { order: i })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await UserTask.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Re-order remaining tasks
    const remaining = await UserTask.find({ user: req.user.id }).sort({ order: 1 });
    await Promise.all(remaining.map((t, i) => UserTask.findByIdAndUpdate(t._id, { order: i })));
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
