const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    // Dynamic map: taskId (ObjectId string) -> boolean
    tasks: { type: Map, of: Boolean, default: {} },
    doneCnt: { type: Number, default: 0 },
    totalCnt: { type: Number, default: 0 },
    percentDone: { type: Number, default: 0 },
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, date: 1 }, { unique: true });

habitSchema.pre('save', function (next) {
  const vals = [...this.tasks.values()];
  this.doneCnt = vals.filter(Boolean).length;
  this.totalCnt = vals.length;
  this.percentDone = vals.length
    ? Math.round((this.doneCnt / vals.length) * 100)
    : 0;
  next();
});

module.exports = mongoose.model('Habit', habitSchema);
