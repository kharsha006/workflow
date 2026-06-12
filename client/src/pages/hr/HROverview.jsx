import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import UserDetailsModal from '../../components/modals/UserDetailsModal';

const HROverview = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ headcount: 0, onLeave: 0, lateArrivals: 0, pendingReviews: 0 });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [usersRes, leavesRes, attendanceRes, projectsRes] = await Promise.all([
        api.get('/api/users').catch(() => ({ data: [] })),
        api.get('/api/leaves').catch(() => ({ data: [] })),
        api.get(`/api/attendance?date=${today}`).catch(() => ({ data: [] })),
        api.get('/api/projects').catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const leaves = leavesRes.data || [];
      const attendance = attendanceRes.data || [];
      const projData = projectsRes.data || [];

      const headcount = users.filter(u => u.status !== 'inactive' && u.approvalStatus === 'approved').length;
      const onLeaveToday = leaves.filter(l => {
        if (l.status !== 'Approved') return false;
        return l.startDate <= today && l.endDate >= today;
      }).length;
      const lateArrivals = attendance.filter(a => a.isLate).length;
      const pendingLeaveList = leaves.filter(l => l.status === 'Pending');
      const pendingUserList = users.filter(u => u.approvalStatus === 'pending');

      // Build upcoming birthdays/anniversaries from joiningDate
      const upcoming = users
        .filter(u => u.joiningDate && u.approvalStatus === 'approved')
        .map(u => {
          const join = new Date(u.joiningDate);
          const now = new Date();
          const thisYear = new Date(now.getFullYear(), join.getMonth(), join.getDate());
          const diff = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
          const years = now.getFullYear() - join.getFullYear();
          return { user: u, diff, years };
        })
        .filter(e => e.diff >= 0 && e.diff <= 14)
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 4);

      setStats({ headcount, onLeave: onLeaveToday, lateArrivals, pendingReviews: pendingLeaveList.length + pendingUserList.length });
      setPendingLeaves(pendingLeaveList.slice(0, 5));
      setPendingUsers(pendingUserList);
      setUpcomingEvents(upcoming);
      setProjects(projData);
    } catch (err) {
      addToast('Failed to load HR overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await api.put(`/api/leaves/${id}`, { status });
      addToast(`Leave request ${status.toLowerCase()}`, 'success');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update leave', 'error');
    }
  };

  const handleUserAction = async (id, action) => {
    try {
      await api.put(`/api/users/${id}/${action}`);
      addToast(`User registration ${action}d`, 'success');
      setSelectedUser(null);
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${action} user`, 'error');
    }
  };

  const dayLabel = (diff) => {
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  return (
    <div className="view active" id="view-hr-overview">
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
          HR Dashboard
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stat cards — real data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/people')}>
          <div className="stat-card-accent" style={{ background: 'var(--brand)' }}></div>
          <div className="stat-label"><i className="fas fa-users" style={{ color: 'var(--brand)' }}></i> Total Headcount</div>
          <div className="stat-value">{loading ? '—' : stats.headcount}</div>
          <div className="stat-delta delta-neutral">active employees</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/leaves')}>
          <div className="stat-card-accent" style={{ background: 'var(--warning)' }}></div>
          <div className="stat-label"><i className="fas fa-umbrella-beach" style={{ color: 'var(--warning)' }}></i> On Leave Today</div>
          <div className="stat-value">{loading ? '—' : stats.onLeave}</div>
          <div className="stat-delta delta-neutral">approved absences</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/attendance')}>
          <div className="stat-card-accent" style={{ background: 'var(--danger)' }}></div>
          <div className="stat-label"><i className="fas fa-clock" style={{ color: 'var(--danger)' }}></i> Late Arrivals</div>
          <div className="stat-value">{loading ? '—' : stats.lateArrivals}</div>
          <div className="stat-delta delta-down">today's attendance</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/hr/leaves')}>
          <div className="stat-card-accent" style={{ background: 'var(--success)' }}></div>
          <div className="stat-label"><i className="fas fa-file-signature" style={{ color: 'var(--success)' }}></i> Pending Leaves</div>
          <div className="stat-value">{loading ? '—' : stats.pendingReviews}</div>
          <div className="stat-delta delta-neutral">awaiting approval</div>
        </div>
      </div>

      <div className="two-col">
        {/* Pending Leave Requests — real data */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '12px' }}>
            <div className="section-title">Pending Leave Requests</div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hr/leaves')}>View all</Button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
              No pending leave requests
            </div>
          ) : (
            pendingLeaves.map(leave => (
              <div key={leave._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar
                    initials={leave.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    bg={leave.employee?.avatar?.bg}
                    color={leave.employee?.avatar?.color}
                    size="sm"
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{leave.employee?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {leave.type} · {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleLeaveAction(leave._id, 'Approved')}>Approve</button>
                  <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleLeaveAction(leave._id, 'Rejected')}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pending Registrations */}
        <div className="card" style={{ gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <div className="section-hdr" style={{ marginBottom: '12px' }}>
            <div className="section-title">Pending Account Approvals</div>
          </div>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: 'var(--text3)' }}>
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
              No pending registrations
            </div>
          ) : (
            pendingUsers.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar initials={u.avatar?.initials} bg={u.avatar?.bg} color={u.avatar?.color} size="sm" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.name} <Badge variant="info" style={{ marginLeft: '4px' }}>{u.role}</Badge></div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      Mobile: {u.mobileNumber || 'N/A'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Work Anniversaries */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '12px' }}>
            <div className="section-title">Upcoming Anniversaries</div>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
              No upcoming anniversaries in the next 14 days
            </div>
          ) : (
            upcomingEvents.map((ev, i) => (
              <div key={ev.user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === upcomingEvents.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar initials={ev.user.avatar?.initials} bg={ev.user.avatar?.bg} color={ev.user.avatar?.color} size="sm" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{ev.user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {ev.years} year{ev.years !== 1 ? 's' : ''} · {dayLabel(ev.diff)}
                    </div>
                  </div>
                </div>
                <Badge variant="brand">Milestone</Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dashboard additions: Inventory & Projects */}
      <div className="two-col" style={{ marginTop: '24px', gridTemplateColumns: '1fr 1fr', gap: '24px', display: 'grid' }}>
        
        {/* Active Projects */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '15px' }}><i className="fas fa-folder-open" style={{ color: 'var(--brand)', marginRight: '8px' }}></i>Active Projects</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.slice(0, 4).map(p => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: p.iconBg || 'var(--bg)', color: p.iconColor || 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                  <i className={`fas ${p.icon || 'fa-folder'}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text1)' }} className="truncate">{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Due: {p.dueDate || 'N/A'}</div>
                </div>
                <Badge variant={p.status === 'At risk' ? 'danger' : p.status === 'On track' ? 'success' : 'info'}>{p.status}</Badge>
              </div>
            ))}
            {projects.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>No active projects</div>}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={(e) => {
          // Prevent navigation if clicking inside the label/input
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL' && !e.target.closest('label')) {
            navigate('/hr/inventory');
          }
        }}>
          <div className="section-hdr" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '15px' }}><i className="fas fa-boxes-stacked" style={{ color: 'var(--warning)', marginRight: '8px' }}></i>Inventory Overview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                background: '#F3E8FF', border: '1px solid #D8B4FE', padding: '4px 8px',
                borderRadius: 'var(--radius)', fontSize: '11px', fontWeight: 600, color: '#6B21A8'
              }}>
                <i className="fas fa-camera"></i>
                Take Photo
                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} />
              </label>
              <Badge variant="warning">6 Assets</Badge>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>3</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>Assigned</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--brand)' }}>2</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>Available</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-wrench" style={{ color: '#DC2626' }}></i>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B' }}>In Repair</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>1 item</span>
          </div>
        </div>

      </div>

      <UserDetailsModal 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        user={selectedUser}
        onApprove={(id) => handleUserAction(id, 'approve')}
        onReject={(id) => handleUserAction(id, 'reject')}
      />
    </div>
  );
};

export default HROverview;
