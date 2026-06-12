const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  resetPasswordOTP: String,
  resetPasswordExpire: Date,
  dateOfBirth: {
    type: Date,
  },
  panDetails: {
    type: String,
  },
  aadharCard: {
    type: String,
  },
  mobileNumber: {
    type: String,
  },
  role: {
    type: String,
    enum: ['Founding Team', 'HR', 'Employee', 'Intern'],
    default: 'Employee',
  },
  avatar: {
    initials: { type: String },
    bg: { type: String },
    color: { type: String },
  },
  designation: {
    type: String,
  },
  department: {
    type: String,
  },
  joiningDate: {
    type: Date,
  },
  reportingManager: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'inactive'],
    default: 'active',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  leaveBalance: {
    total: { type: Number, default: 24 },
    taken: { type: Number, default: 0 },
    available: { type: Number, default: 24 },
  },
  // Display stats shown on employee cards / workflow (mirrors prototype MEMBERS)
  workStats: {
    activeTasks: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    performance: { type: Number, default: 0 }, // %
    workload: { type: Number, default: 0 },    // %
  },
  workStatus: { type: String },        // e.g. 'On track', 'Blocked', 'Overdue task', 'In review'
  upcomingLeave: { type: String, default: 'None scheduled' },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt. Async middleware in Mongoose resolves via the
// returned promise, so we just return early when the password is unchanged
// instead of calling next() (which is not passed to async hooks).
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
