const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  loginTime: {
    type: String, // e.g. '09:02 AM'
  },
  logoutTime: {
    type: String,
  },
  hoursWorked: {
    type: String, // e.g. '9h 13m'
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'on_leave', 'wfh'],
    default: 'present',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
