const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Sick leave', 'Annual leave', 'Personal', 'Work from Home'],
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  reviewComment: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
