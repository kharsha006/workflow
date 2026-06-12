const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String, // e.g. "June"
    required: true,
  },
  year: {
    type: Number, // e.g. 2026
    required: true,
  },
  baseSalary: {
    type: String, // Storing as formatted string (e.g. '₹85,000') as requested
    required: true,
  },
  deductions: {
    type: String,
  },
  netPay: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payroll', PayrollSchema);
