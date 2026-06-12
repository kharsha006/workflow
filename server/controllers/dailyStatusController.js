const DailyStatusLog = require('../models/DailyStatusLog');

// Format current server time as e.g. "09:30 AM"
const currentTimeLabel = () => {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
};

// @desc    Get daily status logs for a specific date
// @route   GET /api/daily-status
// @access  Private
const getDailyStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    let query = { date };

    // If Employee or Intern, only show logs of team members
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR') {
      const Project = require('../models/Project');
      const User = require('../models/User');
      const myProjects = await Project.find({ members: req.user.id });
      const teamMemberIds = new Set(myProjects.flatMap(p => p.members.map(m => m.toString())));
      
      if (req.user.role === 'Intern') {
        const currentUser = await User.findById(req.user.id);
        if (currentUser && currentUser.reportingManager) {
          teamMemberIds.add(currentUser.reportingManager.toString());
        }
      }
      query.employee = { $in: Array.from(teamMemberIds) };
    }

    const logs = await DailyStatusLog.find(query).populate('employee', 'name avatar role designation department status');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get the current user's status log for a date
// @route   GET /api/daily-status/my-status
// @access  Private
const getMyStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const logs = await DailyStatusLog.find({ date, employee: req.user.id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all status logs for a specific employee (newest first)
// @route   GET /api/daily-status/employee/:id
// @access  Private (HR, Founding Team, or the employee themselves)
const getEmployeeStatus = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR' && req.user.id !== targetId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const logs = await DailyStatusLog.find({ employee: targetId }).sort('-date');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a task entry to the current user's status log (creates the
//          log for the day on first entry).
// @route   POST /api/daily-status
// @access  Private (Employee, Intern)
const createDailyStatus = async (req, res) => {
  try {
    const { date, taskUpdate } = req.body;

    if (!date || !taskUpdate || (!taskUpdate.task && !taskUpdate.description)) {
      return res.status(400).json({ message: 'Date and task description are required' });
    }

    let log = await DailyStatusLog.findOne({ date, employee: req.user.id });

    if (log && log.isLocked) {
      return res.status(400).json({ message: 'This log is locked for editing (past 6:00 PM)' });
    }

    const task = {
      task: taskUpdate.task || taskUpdate.description || '',
      hoursSpent: taskUpdate.hoursSpent || 0,
      status: taskUpdate.status || 'In Progress',
      progress: taskUpdate.progress != null ? Number(taskUpdate.progress) : 0,
      notes: taskUpdate.notes || '',
      updated: currentTimeLabel(),
    };

    if (!log) {
      log = await DailyStatusLog.create({
        date,
        employee: req.user.id,
        tasks: [task],
      });
      return res.status(201).json(log);
    }

    log.tasks.push(task);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update daily status log
// @route   PUT /api/daily-status/:id
// @access  Private (Employee, Intern)
const updateDailyStatus = async (req, res) => {
  try {
    const log = await DailyStatusLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    if (log.employee.toString() !== req.user.id && req.user.role !== 'Founding Team') {
      return res.status(403).json({ message: 'Not authorized to update this log' });
    }

    if (log.isLocked && req.user.role !== 'Founding Team') {
      return res.status(400).json({ message: 'This log is locked for editing (past 6:00 PM)' });
    }

    const updatedLog = await DailyStatusLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDailyStatus,
  getMyStatus,
  getEmployeeStatus,
  createDailyStatus,
  updateDailyStatus
};
