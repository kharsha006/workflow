const mongoose = require('mongoose');

const EscalationSchema = new mongoose.Schema({
  escId: { type: String, unique: true },          // e.g. ESC-001
  member: { type: String, required: true },        // employee/intern name
  memberUser: { type: mongoose.Schema.ObjectId, ref: 'User' },
  avatar: {
    initials: { type: String },
    bg: { type: String },
    color: { type: String },
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['Deadline Risk', 'Blocker', 'Resource Issue', 'Client Issue', 'Technical Issue', 'Other'],
    default: 'Other',
  },
  project: { type: String },
  task: { type: String, required: true },
  description: { type: String, default: 'No description provided.' },
  status: {
    type: String,
    enum: ['Open', 'Under Review', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  owner: { type: String, default: 'Riya Kapoor' },
  attachment: { type: String, default: '' },
  raisedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Escalation', EscalationSchema);
