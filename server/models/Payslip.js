const mongoose = require('mongoose');

const PayslipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  payroll: {
    type: mongoose.Schema.ObjectId,
    ref: 'Payroll',
    required: true,
  },
  requestedAt: {
    type: Date,
  },
  generatedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Requested', 'Generated', 'Downloaded'],
    default: 'Requested',
  },
  downloadUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payslip', PayslipSchema);
