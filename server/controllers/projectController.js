const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (Founding Team)
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).populate('members', 'name email role avatar department designation status workStats workStatus upcomingLeave leaveBalance');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (Founding Team)
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role avatar department designation status workStats workStatus upcomingLeave leaveBalance');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Founding Team)
const createProject = async (req, res) => {
  try {
    const { name, description, status, dueDate, members } = req.body;

    const icons = ['fa-folder','fa-rocket','fa-lightbulb','fa-chart-line','fa-code'];
    const colors = [{bg:'#F3E8FF',c:'#7C3AED'},{bg:'#FEF3C7',c:'#D97706'},{bg:'#DCFCE7',c:'#16A34A'},{bg:'#DBEAFE',c:'#2563EB'},{bg:'#FCE7F3',c:'#DB2777'}];
    const ci = Math.floor(Math.random() * colors.length);

    const project = new Project({
      name,
      description,
      status,
      dueDate,
      members,
      icon: icons[ci % icons.length],
      iconBg: colors[ci].bg,
      iconColor: colors[ci].c,
      barColor: status === 'On track' ? 'var(--success)' : status === 'At risk' ? 'var(--warning)' : 'var(--info)',
      createdBy: req.user.id
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Founding Team)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject
};
