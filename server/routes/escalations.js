const express = require('express');
const router = express.Router();
const { getEscalations, createEscalation, updateEscalation } = require('../controllers/escalationController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getEscalations)
  .post(protect, createEscalation);

router.patch('/:id', protect, authorize('Founding Team', 'HR'), updateEscalation);

module.exports = router;
