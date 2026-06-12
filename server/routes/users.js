const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser, deactivateUser, approveUser, rejectUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getUsers)
  .post(protect, authorize('HR'), createUser);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, authorize('HR', 'Founding Team'), updateUser);

router.patch('/:id/deactivate', protect, authorize('HR'), deactivateUser);

router.route('/:id/approve')
  .put(protect, authorize('HR'), approveUser);

router.route('/:id/reject')
  .put(protect, authorize('HR'), rejectUser);

module.exports = router;
