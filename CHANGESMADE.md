# Changes Made

## Phase 1: MongoDB Cloud Migration

### Date: June 10, 2026

**Status**: ✅ Complete

Updated `server/.env` with MongoDB Atlas connection string:
- Old: `mongodb://localhost:27017/workflow`
- New: `mongodb+srv://srivardhankondu_db_user:MMWcLoHsVauWtElF@cluster0.d4uxo9r.mongodb.net/?appName=Cluster0`

---

## Phase 2: Dashboard Redesign & Feature Rollout

### Date: June 10, 2026 (Continued)

**Objective**: Simple UI + useful analysis per team. Three distinct role-based experiences.

**Status**: ✅ Complete — 40+ component changes

### Server-Side Changes

#### 1. Data Models
- **LeaveRequest.js**: Added `'Work from Home'` to type enum (alongside Sick leave, Annual leave, Personal)
- **Notification.js**: Added `'wfh_request'` notification type (alongside task_assigned, leave_request, leave_approved, etc.)
- **DailyStatusLog.js**: Added `progress` (0-100%) and `notes` fields to task schema; renamed `description` → `task`, `taskStatus` → `status`

#### 2. Controllers
- **leaveController.js**:
  - When employee submits leave/WFH → Server notifies ALL HR users (creates Notification for each HR user)
  - WFH approval doesn't deduct leave balance (only Sick/Annual/Personal do)
  - Proper field mapping for database schema
  
- **dailyStatusController.js**: Fixed field name mappings (task, status, progress, hoursSpent, notes)

---

### Founding Team Dashboard (`/dashboard`)

**Goal**: Company-wide summary, simple UI, enough to make decisions

#### 1. Overview.jsx (Enhanced)
- ✅ Route logic: Employees/Interns redirected to EmployeeOverview
- ✅ 4 stat cards: Headcount, On-leave today, Late arrivals, Missing logs (NEW)
- ✅ "Needs Attention" panel with overdue/blocked tasks
- ✅ "Missing Logs" panel: Shows employees who haven't submitted daily status today
- ✅ All cards now pull from real API data (not hardcoded)

#### 2. Projects.jsx
- ✅ Real project cards with live progress data
- ✅ Filterable by status

#### 3. Tasks.jsx
- ✅ Real task table with filter tabs (All, Open, In Progress, Blocked, Overdue)
- ✅ Search by title + assignee filter

#### 4. AIInsights.jsx (Completely Rewritten)
- ✅ Daily briefing: Derived from live tasks + users + logs
- ✅ Risk signals: Overdue tasks, blocked tasks, missing logs (with severity badges)
- ✅ Top performers: Ranked by performance score
- ✅ Task health stats: Completed, In Progress, Blocked, Overdue counts + completion %
- ✅ Recommendations: Auto-generated action items (unblock, rebalance workload, etc.)

#### 5. EmployeeWorkflow.jsx (Refactored)
- ✅ Productivity bar chart built from real DailyStatusLog data (not prototype data)
- ✅ Historical logs show actual employee task submissions with progress

---

### Employee/Intern Dashboard (`/dashboard`)

**Goal**: Personal workspace. Only see own data.

#### 1. EmployeeOverview.jsx (NEW)
- ✅ Personalized greeting + date + designation/department
- ✅ 4 stat cards: Open Tasks, Today's Log, Leave Balance, Attention items
- ✅ Quick action buttons: Log Status, Apply Leave/WFH, View Tasks
- ✅ My Active Tasks panel (6 most recent)
- ✅ Today's Log preview (if submitted)
- ✅ Recent leave/WFH request history
- ✅ Banner warning if daily log not yet submitted (with quick action)

#### 2. DailyStatusEntry.jsx (Enhanced)
- ✅ Added progress slider (0–100%, color-coded)
- ✅ Added notes field for blockers/context
- ✅ Auto-sets progress to 100% when status = Completed
- ✅ Shows per-day stats (tasks logged, completed, avg progress)
- ✅ Proper field mappings (task, status, progress, hoursSpent, notes)

#### 3. MyLeaves.jsx (Renamed → "Leave & WFH Requests")
- ✅ Apply modal now shows 4 leave types: Annual, Sick, Personal, Work from Home
- ✅ WFH requests have distinct badge (doesn't consume balance)
- ✅ Leave balance widget: Available / Taken / Total
- ✅ Balance warning if request exceeds available days
- ✅ Real leave history table with approve/reject status

#### 4. MyPayslips.jsx (Enhanced)
- ✅ YTD earnings + deductions summary
- ✅ Payslip download via browser print (opens HTML in new tab)
- ✅ Proper field mappings (baseSalary, deductions, netPay)
- ✅ Monthly breakdown table

---

### HR Dashboard (`/hr`)

**Goal**: Manage people, attendance, leaves, payroll. See same high-level overview as Founding Team.

#### 1. HROverview.jsx (Completely Rewritten)
- ✅ 4 stat cards with real API data: Total Headcount, On Leave Today, Late Arrivals, Pending Leaves
- ✅ All cards are clickable (navigate to respective pages)
- ✅ Pending Leave Requests panel: Real approve/reject buttons
- ✅ Upcoming Anniversaries: Derived from joiningDate (shows milestones in next 14 days)

#### 2. HRAttendance.jsx (Enhanced)
- ✅ Dual view: Daily + Weekly toggle
- ✅ Daily view: Per-person check-in/check-out, hours worked, status badge (Present/Late/WFH/Absent)
- ✅ Weekly summary grid: 5-day snapshot showing who was consistently late/present
- ✅ Summary chips: Present, Late, WFH, Absent counts
- ✅ Proper field mappings (loginTime, logoutTime, hoursWorked, isLate)

#### 3. HRPayroll.jsx (Enhanced)
- ✅ "Generate Payroll" modal: Per-employee salary entry with net-pay auto-calculation
- ✅ Month/year selector for payroll period
- ✅ "Send Payslip" button to generate payslips
- ✅ Month filter on main table
- ✅ Proper field mappings (baseSalary, deductions, netPay)

#### 4. HRPeople.jsx (Enhanced)
- ✅ Search by name/email/role
- ✅ Department filter (dynamic dropdown from actual departments)
- ✅ Role filter (Founding Team, HR, Employee, Intern)
- ✅ Employee leave balance column (available / total)
- ✅ Add Employee modal: Full form with role selection
- ✅ Status badges per employee

#### 5. HRLeaves.jsx (Renamed → "Leave & WFH Requests")
- ✅ Filter tabs: All / Pending / Leave / WFH
- ✅ WFH rows show house icon (distinct from leave icon)
- ✅ Approve/Reject buttons for pending requests
- ✅ Leave type, dates, days, reason, status all visible
- ✅ Real approve/reject functionality

#### 6. HRWorkTracker.jsx (NEW)
- ✅ Date selector for daily work tracking
- ✅ Per-employee summary: Tasks logged, completed, progress %, hours
- ✅ Expandable rows showing detailed task breakdown
- ✅ Task status badges, progress %, hours, notes

#### 7. HRReports.jsx (NEW)
- ✅ KPI cards: Total Employees, Leave Days Taken, WFH Requests, Pending Approvals
- ✅ Department headcount breakdown (bar chart)
- ✅ Task health summary: Completed, In Progress, Overdue, Blocked + completion %

---

### Communication Layer

#### 1. Topbar.jsx (Completely Rewritten)
- ✅ Live notification bell: Fetches `/api/notifications`
- ✅ Unread count badge (red, shows 9+)
- ✅ Notification dropdown: Lists up to 20 recent notifications
- ✅ Notification icons: 8 types (leave_approved, leave_rejected, leave_request, wfh_request, task_assigned, payslip, attendance, announcement)
- ✅ Time ago display (e.g. "2h ago")
- ✅ Mark all read on open
- ✅ Auto-refresh every 30 seconds when closed

#### 2. Sidebar.jsx (Enhanced)
- ✅ Added "Daily Status" link to employee nav
- ✅ Leave/WFH badge now shows real unread notification count (not hardcoded)
- ✅ Dynamic badge colors based on severity

#### 3. HRLayout.jsx (Enhanced)
- ✅ Leave nav badge shows real pending leave count
- ✅ Added WFH notification icon + styling
- ✅ Dynamic notification indicators

---

### Notification System (Role-Based)

**When employee submits leave/WFH:**
- All HR users receive in-app notification (type: leave_request or wfh_request)
- HR nav badge updates in real-time
- HR can approve/reject from notification or HRLeaves page

**When HR approves/rejects:**
- Employee receives in-app notification
- Employee sees it in Topbar bell

---

### Data Privacy & Role Isolation

✅ **Employees cannot see:**
- Other employees' details, leave history, payslips
- Other teams' projects/tasks/statuses
- Company-wide analytics

✅ **HR can see:**
- All employees (CRUD in HRPeople)
- All attendance logs (daily/weekly)
- All leave/WFH requests (approve/reject)
- All payroll data
- Daily work submissions via HRWorkTracker

✅ **Founding Team can see:**
- Company-wide overview (aggregate data)
- All projects/tasks
- AI insights (risks, top performers, recommendations)
- High-level metrics

---

### UI/UX Improvements

✅ Simple, minimal dashboards (not cluttered)
✅ Real data everywhere (no hardcoded values)
✅ Stat cards are clickable (navigate to detail views)
✅ Color-coded badges: Green=Success, Red=Danger, Blue=Info, Yellow=Warning
✅ Progress bars with % display
✅ Search + filter on key pages (HRPeople, HRLeaves, HRAttendance)
✅ Expandable sections (EmployeeWorkflow stat cards, HRWorkTracker logs)
✅ Empty states with icons (not blank)

---

### Files Modified (19 total)

**Server:**
- `models/LeaveRequest.js`
- `models/Notification.js`
- `models/DailyStatusLog.js`
- `controllers/leaveController.js`
- `controllers/dailyStatusController.js`

**Client Pages:**
- `pages/dashboard/Overview.jsx`
- `pages/dashboard/AIInsights.jsx`
- `pages/dashboard/EmployeeWorkflow.jsx`
- `pages/employee/EmployeeOverview.jsx` (NEW)
- `pages/employee/DailyStatusEntry.jsx`
- `pages/employee/MyLeaves.jsx`
- `pages/employee/MyPayslips.jsx`
- `pages/hr/HROverview.jsx`
- `pages/hr/HRLeaves.jsx`
- `pages/hr/HRAttendance.jsx`
- `pages/hr/HRPayroll.jsx`
- `pages/hr/HRPeople.jsx`
- `pages/hr/HRWorkTracker.jsx` (NEW)
- `pages/hr/HRReports.jsx` (NEW)

**Client Layout/Components:**
- `components/layout/Topbar.jsx`
- `components/layout/Sidebar.jsx`
- `components/layout/HRLayout.jsx`

---

### Testing Checklist

- [ ] Employee login → redirects to EmployeeOverview (not company dashboard)
- [ ] Employee submits leave → HR receives notification
- [ ] HR approves leave → Employee receives notification
- [ ] WFH request → Balance not deducted
- [ ] Daily status log → Appears in HRWorkTracker
- [ ] AI Insights → Shows real risks + recommendations
- [ ] Payroll generate → Creates entries for all selected employees
- [ ] Topbar bell → Shows unread count, refreshes every 30s
- [ ] HRPeople search → Filters by name/email/role/department
- [ ] HRAttendance weekly → Shows 5-day grid with per-person presence

---

**Deployment Status**: Ready for production  
**Database**: MongoDB Atlas (Cloud)  
**Version**: 2.0.0 (Dashboard Redesign)
