const express = require('express');
const router = express.Router();
const { getDailyStatus, getMyStatus, getEmployeeStatus, createDailyStatus, updateDailyStatus } = require('../controllers/dailyStatusController');
const { protect } = require('../middleware/auth');

router.get('/my-status', protect, getMyStatus);
router.get('/employee/:id', protect, getEmployeeStatus);

router.route('/')
  .get(protect, getDailyStatus)
  .post(protect, createDailyStatus);

router.route('/:id')
  .put(protect, updateDailyStatus);

module.exports = router;
