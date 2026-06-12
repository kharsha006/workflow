import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import api from '../../services/api';

const NOTIF_ICON = {
  leave_approved:  { bg: '#D1FAE5', color: '#065F46', icon: 'fa-circle-check' },
  leave_rejected:  { bg: '#FEE2E2', color: '#991B1B', icon: 'fa-circle-xmark' },
  leave_request:   { bg: '#FCE7F3', color: '#9D174D', icon: 'fa-umbrella-beach' },
  wfh_request:     { bg: '#DBEAFE', color: '#1E40AF', icon: 'fa-house-laptop' },
  task_assigned:   { bg: '#EDE9FE', color: '#5B21B6', icon: 'fa-list-check' },
  payslip:         { bg: '#DBEAFE', color: '#1E40AF', icon: 'fa-file-invoice-dollar' },
  attendance:      { bg: '#FEF3C7', color: '#92400E', icon: 'fa-clock' },
  announcement:    { bg: '#F3F4F6', color: '#374151', icon: 'fa-bullhorn' },
};

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [escOpen, setEscOpen] = useState(0);
  const panelRef = useRef(null);
  const isFounder = user?.role === 'Founding Team';

  useEffect(() => {
    api.get('/api/notifications').then(({ data }) => setNotifs(data || [])).catch(() => {});
    if (isFounder) {
      api.get('/api/escalations')
        .then(({ data }) => setEscOpen((data || []).filter(e => ['Open', 'Under Review', 'In Progress'].includes(e.status)).length))
        .catch(() => {});
    }
  }, [isFounder]);

  // Refresh every 30s when panel is closed
  useEffect(() => {
    const id = setInterval(() => {
      if (!open) api.get('/api/notifications').then(({ data }) => setNotifs(data || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.notif-btn')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.isRead).length;

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && unread > 0) {
      try {
        await api.patch('/api/notifications/read-all');
        setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch {}
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="topbar" style={{ position: 'relative' }}>
      <div id="topbar-breadcrumb" className="topbar-breadcrumb">
        <b>Dashboard</b>
      </div>
      <div className="topbar-right">
        <div className="search-wrap">
          <i className="fas fa-magnifying-glass" style={{ color: 'var(--text3)', fontSize: '12px' }}></i>
          <input type="text" placeholder="Search tasks, people…" />
        </div>

        {/* Escalation quick-access (Founding Team) */}
        {isFounder && (
          <div className="esc-header-btn" title="Open escalations" onClick={() => navigate('/dashboard/escalations')}>
            <i className="fas fa-triangle-exclamation"></i>
            {escOpen > 0 && <div className="esc-header-badge">{escOpen}</div>}
          </div>
        )}

        {/* Notification bell */}
        <div className="notif-btn" title="Notifications" onClick={handleOpen}
          style={{ position: 'relative', cursor: 'pointer' }}>
          <i className="fas fa-bell"></i>
          {unread > 0 && (
            <div className="notif-dot" style={{
              position: 'absolute', top: '-2px', right: '-2px',
              minWidth: '16px', height: '16px',
              background: 'var(--danger)', color: '#fff',
              borderRadius: '999px', fontSize: '9px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', lineHeight: 1,
            }}>
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </div>

        <Avatar
          initials={user?.avatar?.initials || user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          bg={user?.avatar?.bg || '#EEF2FF'}
          color={user?.avatar?.color || '#4F46E5'}
          size="sm"
          style={{ cursor: 'pointer' }}
          title="Profile"
        />
      </div>

      {/* Notifications dropdown */}
      {open && (
        <div ref={panelRef} style={{
          position: 'absolute', top: '52px', right: '16px', zIndex: 1000,
          width: '340px', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Notifications</span>
            {unread === 0 && notifs.length > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>All caught up</span>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                <i className="fas fa-bell-slash" style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}></i>
                No notifications yet
              </div>
            ) : notifs.slice(0, 20).map(n => {
              const ic = NOTIF_ICON[n.type] || { bg: '#F3F4F6', color: '#374151', icon: 'fa-circle-info' };
              return (
                <div key={n._id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: n.isRead ? 'var(--bg)' : 'var(--brand-light)',
                  cursor: 'default',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: ic.bg, color: ic.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                  }}>
                    <i className={`fas ${ic.icon}`}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                    {n.message && <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px', lineHeight: 1.4 }}>{n.message}</div>}
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: '6px' }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
