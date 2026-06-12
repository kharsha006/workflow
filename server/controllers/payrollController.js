const Payroll = require('../models/Payroll');
const Payslip = require('../models/Payslip');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private (HR, Founding Team)
const getPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month) query.month = month;
    if (year) query.year = year;

    const records = await Payroll.find(query).populate('employee', 'name avatar department');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate payroll
// @route   POST /api/payroll/generate
// @access  Private (HR)
const generatePayroll = async (req, res) => {
  try {
    const { month, year, records } = req.body;
    // records: [{ employeeId, baseSalary, deductions, netPay }]

    const payrolls = [];
    for (const record of records) {
      const existing = await Payroll.findOne({ employee: record.employeeId, month, year });
      if (!existing) {
        const payroll = await Payroll.create({
          employee: record.employeeId,
          month,
          year,
          baseSalary: record.baseSalary,
          deductions: record.deductions,
          netPay: record.netPay,
          status: 'Paid',
          paidAt: Date.now()
        });
        payrolls.push(payroll);
      }
    }

    res.status(201).json({ message: 'Payroll generated successfully', generated: payrolls.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send payslip to employee
// @route   POST /api/payroll/:id/payslip
// @access  Private (HR)
const sendPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const payslip = await Payslip.create({
      employee: payroll.employee,
      payroll: payroll._id,
      generatedAt: Date.now(),
      status: 'Generated',
      downloadUrl: `/api/payslips/download/${payroll._id}` // Mock URL
    });

    // Create Notification
    await Notification.create({
      recipient: payroll.employee,
      type: 'payslip',
      title: 'New Payslip Available',
      message: `Your payslip for ${payroll.month} ${payroll.year} is now available for download.`,
      relatedId: payslip._id,
      relatedModel: 'Payslip'
    });

    res.status(201).json(payslip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my payroll records
// @route   GET /api/payroll/me
// @access  Private
const getMyPayroll = async (req, res) => {
  try {
    const records = await Payroll.find({ employee: req.user.id }).sort('-createdAt');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPayroll,
  generatePayroll,
  sendPayslip,
  getMyPayroll
};
