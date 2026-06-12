const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('Founding Team', 'HR'), getProjects)
  .post(protect, authorize('Founding Team'), createProject);

router.route('/:id')
  .get(protect, authorize('Founding Team', 'HR'), getProjectById)
  .put(protect, authorize('Founding Team'), updateProject);

module.exports = router;
