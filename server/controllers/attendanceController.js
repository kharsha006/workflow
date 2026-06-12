const Attendance = require('../models/Attendance');

// @desc    Get attendance for a date or date range
// @route   GET /api/attendance
// @access  Private (HR, Founding Team)
const getAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = {};
    
    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).populate('employee', 'name avatar role department email designation status');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check-in (Login)
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let attendance = await Attendance.findOne({ employee: req.user.id, date: today });
    if (attendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const loginTime = hours + ':' + minutes + ' ' + ampm;

    // Is late logic (if after 10:00 AM roughly)
    const isLate = now.getHours() >= 10;

    attendance = await Attendance.create({
      employee: req.user.id,
      date: today,
      loginTime,
      isLate,
      status: 'present'
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check-out (Logout)
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let attendance = await Attendance.findOne({ employee: req.user.id, date: today });
    if (!attendance) {
      return res.status(400).json({ message: 'Not checked in today' });
    }

    if (attendance.logoutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const logoutTime = hours + ':' + minutes + ' ' + ampm;

    attendance.logoutTime = logoutTime;
    attendance.hoursWorked = '8h 00m'; // Mock logic for hours worked based on prototype

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/me
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employee: req.user.id }).sort('-date');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAttendance,
  checkIn,
  checkOut,
  getMyAttendance
};
