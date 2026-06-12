const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['On track', 'At risk', 'Ahead', 'In progress'],
    default: 'On track',
  },
  progress: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: String,
  },
  updated: {
    type: String, // e.g. 'Jun 7'
  },
  icon: {
    type: String,
  },
  iconBg: {
    type: String,
  },
  iconColor: {
    type: String,
  },
  barColor: {
    type: String,
  },
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', ProjectSchema);
