import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const NAV_ITEMS = {
  'Founding Team': [
    { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2', path: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: 'fa-folder-open', path: '/dashboard/projects' },
    { id: 'team', label: 'Team', icon: 'fa-users', path: '/dashboard/team' },
    { id: 'tasks', label: 'Tasks', icon: 'fa-list-check', path: '/dashboard/tasks' },
    { id: 'escalations', label: 'Escalation Center', icon: 'fa-triangle-exclamation', path: '/dashboard/escalations', section: 'Escalations', badge: 'escalation' },
  ],
  'HR': [
    { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2', path: '/hr' },
    { id: 'people', label: 'People', icon: 'fa-users', path: '/hr/people' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-clock', path: '/hr/attendance' },
    { id: 'leaves', label: 'Leave Requests', icon: 'fa-umbrella-beach', badge: 'brand', path: '/hr/leaves' },
    { id: 'payroll', label: 'Payroll', icon: 'fa-file-invoice-dollar', path: '/hr/payroll', section: 'Finance' },
  ],
  'Employee': [
    { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2', path: '/dashboard' },
    { id: 'daily-status', label: 'Daily Status', icon: 'fa-pen-to-square', path: '/dashboard/daily-status' },
    { id: 'tasks', label: 'My Tasks', icon: 'fa-list-check', path: '/dashboard/tasks', section: 'Work' },
    { id: 'leaves', label: 'Leave & WFH', icon: 'fa-umbrella-beach', path: '/dashboard/leaves', section: 'My Account' },
    { id: 'payroll', label: 'Payslips', icon: 'fa-file-invoice', path: '/dashboard/payroll' },
  ],
  'Intern': [
    { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2', path: '/dashboard' },
    { id: 'daily-status', label: 'Daily Status', icon: 'fa-pen-to-square', path: '/dashboard/daily-status' },
    { id: 'tasks', label: 'My Tasks', icon: 'fa-list-check', path: '/dashboard/tasks', section: 'Work' },
    { id: 'leaves', label: 'Leave & WFH', icon: 'fa-umbrella-beach', path: '/dashboard/leaves', section: 'My Account' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [escOpen, setEscOpen] = useState(0);

  useEffect(() => {
    api.get('/api/notifications')
      .then(({ data }) => setUnreadCount((data || []).filter(n => !n.isRead).length))
      .catch(() => {});
    if (user?.role === 'Founding Team') {
      api.get('/api/escalations')
        .then(({ data }) => setEscOpen((data || []).filter(e => ['Open', 'Under Review', 'In Progress'].includes(e.status)).length))
        .catch(() => {});
    }
  }, [user?.role]);

  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS['Employee'];

  let lastSection = 'Workspace';

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    const role = user?.role || 'Founding Team';
    setTimeout(() => {
      navigate(`/login?role=${encodeURIComponent(role)}`);
      logout();
      setIsLoggingOut(false);
    }, 1200);
  };

  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">W</div>
        <span className="sb-logo-text">WorkFlow</span>
      </div>

      <div className="sb-user">
        <div
          className="av av-sm"
          style={{
            background: user?.avatar?.bg || '#EEF2FF',
            color: user?.avatar?.color || '#4F46E5',
            fontSize: '11px'
          }}
        >
          {user?.avatar?.initials || user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="sb-user-info">
          <div className="sb-user-name">{user?.name}</div>
          <div className="sb-user-role">{user?.role} · {user?.designation}</div>
        </div>
      </div>

      <div className="sb-nav">
        {navItems.map((item, idx) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <React.Fragment key={item.id}>
              {(idx === 0 || showSection) && (
                <div className="sb-section">{item.section || 'Workspace'}</div>
              )}
              <div
                className={`nav-item ${isActive ? 'active' : ''}`}
                id={`nav-${item.id}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon"><i className={`fas ${item.icon}`}></i></span>
                <span>{item.label}</span>
                {item.badge === 'brand' && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                {item.badge === 'escalation' && escOpen > 0 && <span className="nav-badge" style={{ background: 'var(--danger)', color: '#fff' }}>{escOpen}</span>}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="sb-bottom">
        <div className="nav-item" onClick={handleLogout} style={isLoggingOut ? { opacity: 0.6, pointerEvents: 'none' } : {}}>
          <span className="nav-icon">
            {isLoggingOut ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-right-from-bracket"></i>}
          </span>
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </div>
      </div>

      {/* Full-screen Sign Out Overlay */}
      {createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isLoggingOut ? 1 : 0,
          pointerEvents: isLoggingOut ? 'all' : 'none',
          transition: 'opacity 0.4s ease',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            transform: isLoggingOut ? 'scale(1)' : 'scale(0.95)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)' }}>
              <i className="fas fa-right-from-bracket fa-beat-fade"></i>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.02em' }}>Signing out...</div>
            <div style={{ fontSize: '14px', color: 'var(--text2)', fontWeight: 500 }}>Securing your workspace session</div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Sidebar;
