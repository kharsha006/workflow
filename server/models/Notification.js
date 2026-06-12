const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['task_assigned', 'leave_request', 'wfh_request', 'leave_approved', 'leave_rejected', 'payslip', 'attendance', 'announcement', 'escalation'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: mongoose.Schema.ObjectId, // Could point to task, leave request, payslip, etc.
  },
  relatedModel: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', NotificationSchema);
