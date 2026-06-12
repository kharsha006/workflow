const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR') {
      query.employee = req.user.id;
    }

    const leaves = await LeaveRequest.find(query).populate('employee', 'name avatar department').sort('-createdAt');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private (Employee, Intern)
const createLeaveRequest = async (req, res) => {
  try {
    const { type, startDate, endDate, days, reason } = req.body;

    const leave = await LeaveRequest.create({
      employee: req.user.id,
      type,
      startDate,
      endDate,
      days,
      reason
    });

    // Notify all HR users about the new request
    const isWFH = type === 'Work from Home';
    const hrUsers = await User.find({ role: 'HR' }).select('_id');
    if (hrUsers.length > 0) {
      const requester = await User.findById(req.user.id).select('name');
      const notifType = isWFH ? 'wfh_request' : 'leave_request';
      const notifTitle = isWFH
        ? `WFH Request from ${requester.name}`
        : `Leave Request from ${requester.name}`;
      const notifMsg = `${requester.name} requested ${type} from ${startDate} to ${endDate} (${days} day${days > 1 ? 's' : ''}).`;

      await Notification.insertMany(
        hrUsers.map((hr) => ({
          recipient: hr._id,
          type: notifType,
          title: notifTitle,
          message: notifMsg,
          relatedId: leave._id,
          relatedModel: 'LeaveRequest',
        }))
      );
    }

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve or Reject leave
// @route   PUT /api/leaves/:id
// @access  Private (HR, Founding Team)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;

    const leave = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Guard against double-processing (and double-deducting) an already-decided request
    if (leave.status === 'Approved' || leave.status === 'Rejected') {
      return res.status(400).json({ message: `Leave request has already been ${leave.status.toLowerCase()}` });
    }

    // If approving a leave (not WFH), check and deduct balance
    if (status === 'Approved' && leave.type !== 'Work from Home') {
      const user = await User.findById(leave.employee._id);
      if (leave.days > user.leaveBalance.available) {
        return res.status(400).json({
          message: `Insufficient leave balance: ${user.leaveBalance.available} day(s) available, ${leave.days} requested`,
        });
      }
      user.leaveBalance.taken += leave.days;
      user.leaveBalance.available -= leave.days;
      await user.save();
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewComment = reviewComment;

    await leave.save();

    // Create Notification
    await Notification.create({
      recipient: leave.employee._id,
      type: status === 'Approved' ? 'leave_approved' : 'leave_rejected',
      title: `Leave Request ${status}`,
      message: `Your ${leave.type} request for ${leave.startDate} to ${leave.endDate} was ${status.toLowerCase()}.`,
      relatedId: leave._id,
      relatedModel: 'LeaveRequest'
    });

    if (status === 'Approved') {
      try {
        await sendEmail({
          to: leave.employee.email,
          subject: `${leave.type === 'Work from Home' ? 'WFH' : 'Leave'} Request Approved`,
          text: `Hello ${leave.employee.name}, your ${leave.type} request from ${leave.startDate} to ${leave.endDate} has been approved.`,
          html: `<p>Hello <strong>${leave.employee.name}</strong>,</p><p>Your request for <strong>${leave.type}</strong> from ${leave.startDate} to ${leave.endDate} has been <strong>approved</strong>.</p>`
        });
      } catch (err) {
        console.error('Failed to send leave approval email:', err);
      }
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get leave balance for a user
// @route   GET /api/leaves/balance/:userId
// @access  Private
const getLeaveBalance = async (req, res) => {
  try {
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to view this balance' });
    }

    const user = await User.findById(req.params.userId).select('leaveBalance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.leaveBalance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getLeaves,
  createLeaveRequest,
  updateLeaveStatus,
  getLeaveBalance
};
