const Escalation = require('../models/Escalation');
const User = require('../models/User');
const Notification = require('../models/Notification');

const PALETTE = [
  { bg: '#FEE2E2', color: '#991B1B' }, { bg: '#DBEAFE', color: '#1E40AF' },
  { bg: '#D1FAE5', color: '#065F46' }, { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FEF3C7', color: '#92400E' }, { bg: '#FCE7F3', color: '#9D174D' },
];

// Build an avatar for a member name, preferring their real user record.
const avatarFor = async (name) => {
  const user = await User.findOne({ name }).select('avatar');
  if (user && user.avatar && user.avatar.initials) return user.avatar;
  const initials = (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const c = PALETTE[(name || '').length % PALETTE.length];
  return { initials, bg: c.bg, color: c.color };
};

// Next sequential escId (ESC-001, ESC-002, ...)
const nextEscId = async () => {
  const all = await Escalation.find({}, 'escId').lean();
  const max = all.reduce((mx, e) => {
    const n = parseInt(String(e.escId || '').replace(/\D/g, ''), 10) || 0;
    return n > mx ? n : mx;
  }, 0);
  return 'ESC-' + String(max + 1).padStart(3, '0');
};

// @desc    Get escalations (Founding/HR see all; others see their own)
// @route   GET /api/escalations
const getEscalations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR') {
      query = { $or: [{ member: req.user.name }, { raisedBy: req.user.id }] };
    }
    const escalations = await Escalation.find(query).sort('-createdAt');
    res.json(escalations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create an escalation
// @route   POST /api/escalations
const createEscalation = async (req, res) => {
  try {
    const { member, project, task, category, priority, description, owner, attachment, createdAt } = req.body;
    if (!member || !task) {
      return res.status(400).json({ message: 'Member and task are required' });
    }

    const escId = await nextEscId();
    const avatar = await avatarFor(member);
    const memberUser = await User.findOne({ name: member }).select('_id');

    const escalation = await Escalation.create({
      escId,
      member,
      memberUser: memberUser ? memberUser._id : undefined,
      avatar,
      priority: priority || 'medium',
      category: category || 'Other',
      project,
      task,
      description: description || 'No description provided.',
      owner: owner || 'Riya Kapoor',
      attachment: attachment || '',
      raisedBy: req.user.id,
      ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    });

    // Notify the Founding Team
    const founders = await User.find({ role: 'Founding Team' }).select('_id');
    if (founders.length) {
      await Notification.insertMany(founders.map((f) => ({
        recipient: f._id,
        type: 'escalation',
        title: `Escalation ${escId} raised`,
        message: `${member} · ${category || 'Other'} · ${task}`,
        relatedId: escalation._id,
        relatedModel: 'Escalation',
      })));
    }

    res.status(201).json(escalation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an escalation's status (Founding/HR)
// @route   PATCH /api/escalations/:id
const updateEscalation = async (req, res) => {
  try {
    const { status } = req.body;
    if (status && !['Open', 'Under Review', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const escalation = await Escalation.findByIdAndUpdate(
      req.params.id,
      { ...(status ? { status } : {}) },
      { new: true, runValidators: true }
    );
    if (!escalation) return res.status(404).json({ message: 'Escalation not found' });
    res.json(escalation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getEscalations, createEscalation, updateEscalation };
