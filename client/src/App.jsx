import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';

// Public
import Landing from './pages/Landing';
import Login from './pages/Login';

// Routing guard
import RoleProtected from './components/routing/RoleProtected';

// Founding Team / All Staff Dashboard
import Overview from './pages/dashboard/Overview';
import Projects from './pages/dashboard/Projects';
import ProjectDetail from './pages/dashboard/ProjectDetail';
import Team from './pages/dashboard/Team';
import EmployeeWorkflow from './pages/dashboard/EmployeeWorkflow';
import Tasks from './pages/dashboard/Tasks';
import Escalations from './pages/dashboard/Escalations';

// Employee Self-Service
import MyLeaves from './pages/employee/MyLeaves';
import MyPayslips from './pages/employee/MyPayslips';
import DailyStatusEntry from './pages/employee/DailyStatusEntry';

// HR
import HRLayout from './components/layout/HRLayout';
import HROverview from './pages/hr/HROverview';
import HRPeople from './pages/hr/HRPeople';
import HRAttendance from './pages/hr/HRAttendance';
import HRLeaves from './pages/hr/HRLeaves';
import HRWorkTracker from './pages/hr/HRWorkTracker';
import HRPayroll from './pages/hr/HRPayroll';
import HRReports from './pages/hr/HRReports';
import HRInventory from './pages/hr/HRInventory';

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Founding Team / Employee / Intern */}
            <Route path="/dashboard" element={<RoleProtected allowedRoles={['Founding Team', 'Employee', 'Intern']} />}>
              <Route index element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="team" element={<Team />} />
              <Route path="team/:id" element={<EmployeeWorkflow />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="escalations" element={<Escalations />} />
              <Route path="leaves" element={<MyLeaves />} />
              <Route path="payroll" element={<MyPayslips />} />
              <Route path="daily-status" element={<DailyStatusEntry />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* HR */}
            <Route path="/hr" element={<RoleProtected allowedRoles={['HR']} shell={HRLayout} />}>
              <Route index element={<HROverview />} />
              <Route path="people" element={<HRPeople />} />
              <Route path="attendance" element={<HRAttendance />} />
              <Route path="leaves" element={<HRLeaves />} />
              <Route path="tracker" element={<HRWorkTracker />} />
              <Route path="payroll" element={<HRPayroll />} />
              <Route path="reports" element={<HRReports />} />
              <Route path="inventory" element={<HRInventory />} />
              <Route path="*" element={<Navigate to="/hr" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
