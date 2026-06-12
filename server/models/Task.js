const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
  },
  description: {
    type: String,
  },
  taskId: {
    type: String,
  },
  assignee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
  },
  priority: {
    type: String,
    enum: ['Urgent', 'High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Blocked', 'Overdue', 'Submitted', 'In review'],
    default: 'Not Started',
  },
  dueDate: {
    type: String,
  },
  attachment: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', TaskSchema);
