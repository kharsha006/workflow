const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Founding Team', 'HR'), createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask);

module.exports = router;
