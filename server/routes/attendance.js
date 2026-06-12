const express = require('express');
const router = express.Router();
const { getAttendance, checkIn, checkOut, getMyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('HR', 'Founding Team'), getAttendance);
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/me', protect, getMyAttendance);

module.exports = router;
