const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private (Depends on role)
const getTasks = async (req, res) => {
  try {
    let query = {};
    // If not Founding Team, only show their own tasks
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR') {
      query.assignee = req.user.id;
    }
    
    // Allow filtering by project
    if (req.query.projectId) {
      query.project = req.query.projectId;
    }

    const tasks = await Task.find(query).populate('assignee', 'name avatar').populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee', 'name avatar').populate('project', 'name');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check authorization
    if (req.user.role !== 'Founding Team' && task.assignee._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Founding Team, HR)
const createTask = async (req, res) => {
  try {
    const { title, description, assignee, project, priority, dueDate } = req.body;

    const taskId = `WF-${Math.floor(Math.random() * 900) + 100}`;

    const task = new Task({
      title,
      description,
      taskId,
      assignee,
      project,
      priority,
      dueDate,
      createdBy: req.user.id
    });

    const createdTask = await task.save();

    // Create Notification
    await Notification.create({
      recipient: assignee,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${title}`,
      relatedId: createdTask._id,
      relatedModel: 'Task'
    });

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only assignees or Founding Team can update
    if (req.user.role !== 'Founding Team' && task.assignee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask
};
