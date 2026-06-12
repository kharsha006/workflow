const express = require('express');
const router = express.Router();
const { getLeaves, createLeaveRequest, updateLeaveStatus, getLeaveBalance } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getLeaves)
  .post(protect, createLeaveRequest);

router.route('/:id')
  .put(protect, authorize('HR', 'Founding Team'), updateLeaveStatus);

router.get('/balance/:userId', protect, getLeaveBalance);

module.exports = router;
