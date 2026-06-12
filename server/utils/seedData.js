const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const DailyStatusLog = require('../models/DailyStatusLog');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Payroll = require('../models/Payroll');
const Payslip = require('../models/Payslip');
const Notification = require('../models/Notification');
const Escalation = require('../models/Escalation');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../config/db');

// =====================================================================
//  USERS — mirrors the prototype (Riya Kapoor founder, Sarah Adams HR,
//  the 6 MEMBERS and 2 interns). All passwords: password123
// =====================================================================
const usersData = [
  {
    key: 'riya', name: 'Riya Kapoor', email: 'foundation1@kodryx.ai', password: 'password123',
    role: 'Founding Team', designation: 'Co-Founder · CEO', department: 'Management',
    joiningDate: '2021-01-01', status: 'active',
    avatar: { initials: 'RK', bg: '#EEF2FF', color: '#4F46E5' },
    leaveBalance: { total: 24, taken: 0, available: 24 },
  },
  {
    key: 'f2', name: 'Foundation Two', email: 'foundation2@kodryx.ai', password: 'password123',
    role: 'Founding Team', designation: 'Co-Founder', department: 'Management',
    joiningDate: '2021-01-01', status: 'active',
    avatar: { initials: 'F2', bg: '#EEF2FF', color: '#4F46E5' },
    leaveBalance: { total: 24, taken: 0, available: 24 },
  },
  {
    key: 'f3', name: 'Foundation Three', email: 'foundation3@kodryx.ai', password: 'password123',
    role: 'Founding Team', designation: 'Co-Founder', department: 'Management',
    joiningDate: '2021-01-01', status: 'active',
    avatar: { initials: 'F3', bg: '#EEF2FF', color: '#4F46E5' },
    leaveBalance: { total: 24, taken: 0, available: 24 },
  },
  {
    key: 'sarah', name: 'Sarah Adams', email: 'hr@kodryx.ai', password: 'password123',
    role: 'HR', designation: 'HR Manager', department: 'Human Resources',
    joiningDate: '2021-06-01', status: 'active',
    avatar: { initials: 'SA', bg: '#FCE7F3', color: '#9D174D' },
    leaveBalance: { total: 24, taken: 0, available: 24 },
  },
];

const seedData = async (skipConnect = false) => {
  try {
    if (!skipConnect) await connectDB();

    await Promise.all([
      User.deleteMany(), Project.deleteMany(), Task.deleteMany(),
      DailyStatusLog.deleteMany(), Attendance.deleteMany(), LeaveRequest.deleteMany(),
      Payroll.deleteMany(), Payslip.deleteMany(), Notification.deleteMany(),
      Escalation.deleteMany(),
    ]);
    console.log('Data Cleared!');

    // ---- Users ----
    const reportsTo = (id) => ({ reportingManager: id });
    const created = {};
    // create one-by-one so pre-save password hashing runs per doc
    for (const u of usersData) {
      const { key, ...fields } = u;
      const doc = await User.create(fields);
      created[key] = doc;
    }
    // set reporting manager (everyone reports to Riya) — use updateOne to skip re-hash
    const riyaId = created.riya._id;
    for (const key of Object.keys(created)) {
      if (key === 'riya') continue;
      await User.updateOne({ _id: created[key]._id }, reportsTo(riyaId));
    }
    const id = (k) => created[k]._id;

    // ---- Empty Dummy Data ----
    // Projects
    const projectsData = [];
    const projects = {};

    // Tasks
    const tasksData = [];
    
    // Daily Status Logs
    const DAILY_LOG = {};

    // Attendance
    const ATT = {};

    // Leave Requests
    const leaveDocs = [];

    // Payroll
    const payrollData = [];

    // Notifications
    const notifs = [];

    // Escalations
    const escData = [];

    console.log('Data Imported!');
    if (require.main === module) process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    if (require.main === module) process.exit(1);
  }
};

if (require.main === module) seedData();

module.exports = seedData;
