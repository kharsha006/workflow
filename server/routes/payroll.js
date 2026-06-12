const express = require('express');
const router = express.Router();
const { getPayroll, generatePayroll, sendPayslip, getMyPayroll } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('HR', 'Founding Team'), getPayroll);
router.post('/generate', protect, authorize('HR'), generatePayroll);
router.post('/:id/payslip', protect, authorize('HR'), sendPayslip);
router.get('/me', protect, getMyPayroll);

module.exports = router;
