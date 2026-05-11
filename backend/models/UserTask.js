const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true, trim: true },
    emoji: { type: String, default: '✅' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userTaskSchema.index({ user: 1, order: 1 });

module.exports = mongoose.model('UserTask', userTaskSchema);
