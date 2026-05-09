const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    dayNumber: { type: Number },
    habits: {
      bathAndDress: { type: Boolean, default: false },
      breakfast: { type: Boolean, default: false },
      exercise: { type: Boolean, default: false },
      session1: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      session2: { type: Boolean, default: false },
      snacks: { type: Boolean, default: false },
      swimming: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false },
      session3: { type: Boolean, default: false },
      sleep: { type: Boolean, default: false },
    },
    doneCnt: { type: Number, default: 0 },
    percentDone: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound unique index: one entry per user per date
habitSchema.index({ user: 1, date: 1 }, { unique: true });

const TOTAL_HABITS = 11;

habitSchema.pre('save', function (next) {
  const vals = Object.values(this.habits);
  this.doneCnt = vals.filter(Boolean).length;
  this.percentDone = Math.round((this.doneCnt / TOTAL_HABITS) * 100);
  next();
});

module.exports = mongoose.model('Habit', habitSchema);
