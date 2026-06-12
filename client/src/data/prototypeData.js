// Exact illustrative datasets ported verbatim from the UI/UX prototype.
// Keyed by member initials (pn, lf, so, at, mw, dr). Used by the Employee
// Workflow and the employee-card Leave Summary so they match the prototype
// exactly. Identity (name/role/avatar) still comes from the live API.

export const keyFromInitials = (initials = '') => (initials || '').toLowerCase();

// status -> badge variant
export const stVariant = (s) => {
  switch (s) {
    case 'Overdue': return 'danger';
    case 'Blocked': return 'warning';
    case 'In progress':
    case 'In review': return 'info';
    case 'Pending': return 'neutral';
    case 'Upcoming': return 'purple';
    case 'Submitted':
    case 'Completed': return 'success';
    default: return 'neutral';
  }
};

export const EMP_TASKS = {
  pn: [
    { title: 'Reconcile March carrier invoices', status: 'Overdue', due: 'Jun 6' },
    { title: 'Q2 vendor payment audit', status: 'In progress', due: 'Jun 15' },
    { title: 'Budget forecast spreadsheet', status: 'Pending', due: 'Jun 20' },
    { title: 'Contract renewal — logistics firm', status: 'Upcoming', due: 'Jun 25' },
  ],
  lf: [
    { title: 'Q1 fuel-cost variance report', status: 'Blocked', due: 'Jun 3' },
    { title: 'Data pipeline ETL refactor', status: 'In progress', due: 'Jun 14' },
    { title: 'Warehouse telemetry dashboard', status: 'Pending', due: 'Jun 22' },
    { title: 'Quarterly analytics report', status: 'Upcoming', due: 'Jun 30' },
  ],
  so: [
    { title: 'Warehouse safety checklist', status: 'Submitted', due: 'Jun 5' },
    { title: 'Vendor SLA review', status: 'Completed', due: 'Jun 4' },
    { title: 'Ops runbook update', status: 'In progress', due: 'Jun 12' },
    { title: 'Fleet maintenance schedule', status: 'Upcoming', due: 'Jun 28' },
  ],
  at: [
    { title: 'API rate limiter implementation', status: 'In progress', due: 'Jun 10' },
    { title: 'Auth flow unit tests', status: 'In progress', due: 'Jun 10' },
    { title: 'Dashboard v2 QA review', status: 'Completed', due: 'Jun 7' },
    { title: 'Mobile responsive fixes', status: 'Upcoming', due: 'Jun 18' },
  ],
  mw: [
    { title: 'LLM fine-tuning v2 checkpoint', status: 'In review', due: 'Jun 12' },
    { title: 'Model evaluation harness', status: 'In progress', due: 'Jun 16' },
    { title: 'Training data pipeline', status: 'Pending', due: 'Jun 20' },
    { title: 'Benchmark comparison report', status: 'Upcoming', due: 'Jun 28' },
  ],
  dr: [
    { title: 'Dashboard v2 QA review', status: 'Completed', due: 'Jun 7' },
    { title: 'Q3 roadmap planning', status: 'In progress', due: 'Jun 14' },
    { title: 'Client onboarding deck', status: 'Pending', due: 'Jun 18' },
    { title: 'Feature spec: notifications', status: 'Upcoming', due: 'Jun 25' },
  ],
};

export const PROD_DATA = {
  jun: { monthly: 18, weekly: 4, bars: [2, 3, 1, 3, 2, 0, 0], label: 'Jun 2–8' },
  may: { monthly: 15, weekly: null, bars: [2, 2, 3, 1, 2, 0, 0], label: 'May 26–Jun 1' },
  apr: { monthly: 12, weekly: null, bars: [1, 2, 2, 3, 1, 0, 0], label: 'Apr 21–27' },
  mar: { monthly: 10, weekly: null, bars: [1, 1, 2, 2, 3, 0, 0], label: 'Mar 24–30' },
};

export const MONTH_OPTIONS = [
  { value: 'jun', label: 'June 2026' },
  { value: 'may', label: 'May 2026' },
  { value: 'apr', label: 'April 2026' },
  { value: 'mar', label: 'March 2026' },
];

const range = (n, start = 1) => Array.from({ length: n }, (_, i) => i + start);

export const TIMELINE_DATA = {
  jun: { days: 30, completed: [1, 2, 3, 4, 5, 6, 7], ongoing: [8], delayed: [3], upcoming: range(22, 9), label: 'Jun' },
  may: { days: 31, completed: range(31), ongoing: [], delayed: [], upcoming: [], label: 'May' },
  apr: { days: 30, completed: range(30), ongoing: [], delayed: [], upcoming: [], label: 'Apr' },
  mar: { days: 31, completed: range(31), ongoing: [], delayed: [], upcoming: [], label: 'Mar' },
};

export const LOG_DATA = {
  jun: [
    { d: 'Jun 8', note: 'API rate limiter — 60% done, blocked on auth middleware', done: 2, prog: 3 },
    { d: 'Jun 7', note: 'Reviewed dashboard QA checklist, merged 2 PRs', done: 3, prog: 1 },
    { d: 'Jun 6', note: 'Standby for deployment — monitoring logs', done: 1, prog: 2 },
    { d: 'Jun 5', note: 'Auth unit tests scaffold complete', done: 2, prog: 2 },
    { d: 'Jun 4', note: 'Code review + team sync', done: 4, prog: 0 },
  ],
  may: [
    { d: 'May 31', note: 'Sprint retrospective + planning', done: 3, prog: 0 },
    { d: 'May 30', note: 'Feature delivery — notifications module', done: 5, prog: 1 },
    { d: 'May 29', note: 'Bug fixes and staging deploy', done: 4, prog: 2 },
    { d: 'May 28', note: 'Design review with product team', done: 2, prog: 3 },
    { d: 'May 27', note: 'Documentation update', done: 3, prog: 1 },
  ],
  apr: [
    { d: 'Apr 30', note: 'Q1 wrap-up tasks', done: 4, prog: 0 },
    { d: 'Apr 29', note: 'Client demo prep', done: 2, prog: 2 },
    { d: 'Apr 28', note: 'Integration testing', done: 3, prog: 2 },
    { d: 'Apr 27', note: 'Infrastructure scaling tasks', done: 5, prog: 0 },
    { d: 'Apr 26', note: 'Sprint kickoff', done: 1, prog: 3 },
  ],
  mar: [
    { d: 'Mar 31', note: 'Quarter close documentation', done: 3, prog: 0 },
    { d: 'Mar 30', note: 'Performance review prep', done: 2, prog: 1 },
    { d: 'Mar 29', note: 'Code cleanup sprint', done: 5, prog: 0 },
    { d: 'Mar 28', note: 'Onboarding new tooling', done: 2, prog: 2 },
    { d: 'Mar 27', note: 'Architecture planning session', done: 1, prog: 3 },
  ],
};

// HR leave-history modal data, keyed by full name (mirrors EMP_LEAVE_DATA_HR)
export const HR_LEAVE_HISTORY = {
  'Priya Nair': { total: 24, taken: 8, available: 16, history: [{ date: 'Apr 14–15', type: 'Sick leave', days: 2 }, { date: 'Mar 22', type: 'Personal', days: 1 }] },
  'Lena Fischer': { total: 24, taken: 5, available: 19, history: [{ date: 'May 3–4', type: 'Personal', days: 2 }] },
  'Sam Osei': { total: 24, taken: 3, available: 21, history: [{ date: 'May 19', type: 'Sick leave', days: 1 }, { date: 'Mar 8–9', type: 'Personal', days: 2 }] },
  'Aiko Tanaka': { total: 24, taken: 6, available: 18, history: [{ date: 'May 26–28', type: 'Personal', days: 3 }] },
  'Marcus Webb': { total: 24, taken: 10, available: 14, history: [{ date: 'Jun 1–4', type: 'Sick leave', days: 4 }, { date: 'Apr 18', type: 'Personal', days: 1 }] },
  'Divya Rao': { total: 24, taken: 4, available: 20, history: [{ date: 'May 12–13', type: 'Personal', days: 2 }, { date: 'Mar 25', type: 'Sick leave', days: 1 }] },
  'Alex Chen': { total: 12, taken: 2, available: 10, history: [{ date: 'Apr 10', type: 'Sick leave', days: 1 }] },
  'Riya Sharma': { total: 12, taken: 1, available: 11, history: [{ date: 'May 5', type: 'Personal', days: 1 }] },
};

// June 2026 leave calendar (day -> entry), mirrors LEAVE_CALENDAR_DATA
export const LEAVE_CALENDAR_DATA = {
  9: { name: 'Marcus Webb', type: 'Annual leave', status: 'approved', days: 'Jun 9–12' },
  10: { name: 'Marcus Webb', type: 'Annual leave', status: 'approved', days: 'Jun 9–12' },
  11: { name: 'Marcus Webb', type: 'Annual leave', status: 'approved', days: 'Jun 9–12' },
  12: { name: 'Marcus Webb + Priya Nair', type: 'Annual leave / Sick leave', status: 'approved+pending', days: 'Jun 12–13' },
  13: { name: 'Priya Nair', type: 'Sick leave', status: 'pending', days: 'Jun 12–13' },
  15: { name: 'Lena Fischer', type: 'Personal leave', status: 'pending', days: 'Jun 15' },
};

// Per-member leave history (sick & personal shown; annual excluded in the card)
export const LEAVE_DATA = {
  pn: [{ date: 'Apr 14–15', days: 2, type: 'Sick leave' }, { date: 'Mar 22', days: 1, type: 'Personal' }, { date: 'Feb 10–14', days: 5, type: 'Annual leave' }],
  lf: [{ date: 'May 3–4', days: 2, type: 'Annual leave' }, { date: 'Jan 20', days: 1, type: 'Personal' }, { date: 'Jan 2–3', days: 2, type: 'Annual leave' }],
  so: [{ date: 'May 19', days: 1, type: 'Sick leave' }, { date: 'Mar 8–9', days: 2, type: 'Personal' }],
  at: [{ date: 'May 26–28', days: 3, type: 'Annual leave' }, { date: 'Apr 1', days: 1, type: 'Personal' }, { date: 'Feb 24–25', days: 2, type: 'Annual leave' }],
  mw: [{ date: 'Jun 1–4', days: 4, type: 'Annual leave' }, { date: 'Apr 18', days: 1, type: 'Sick leave' }, { date: 'Mar 11–15', days: 5, type: 'Annual leave' }],
  dr: [{ date: 'May 12–13', days: 2, type: 'Annual leave' }, { date: 'Mar 25', days: 1, type: 'Personal' }, { date: 'Feb 3', days: 1, type: 'Sick leave' }],
};
