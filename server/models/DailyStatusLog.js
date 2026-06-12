const mongoose = require('mongoose');

const DailyStatusLogSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  tasks: [{
    task: { type: String, required: true },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Blocked'],
      default: 'Not Started',
    },
    progress: { type: Number, default: 0 },
    hoursSpent: { type: Number, default: 0 },
    updated: { type: String, default: '—' },
    notes: { type: String, default: '' },
  }],
  isLocked: {
    type: Boolean,
    default: false, // Locked at 6PM daily
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DailyStatusLog', DailyStatusLogSchema);
