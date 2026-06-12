import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';

const statusVariant = (s) =>
  s === 'Completed' ? 'success' : s === 'Blocked' ? 'danger' : s === 'Overdue' ? 'danger' : 'info';

const progColor = (p) =>
  p === 100 ? 'var(--success)' : p >= 50 ? 'var(--info)' : p > 0 ? 'var(--warning)' : 'var(--text3)';

const EmployeeOverview = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLogs, setTeamLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    (async () => {
      try {
        const [tasksRes, logRes, leavesRes, balanceRes, teamRes, teamLogsRes] = await Promise.all([
          api.get('/api/tasks').catch(() => ({ data: [] })),
          api.get(`/api/daily-status/my-status?date=${today}`).catch(() => ({ data: [] })),
          api.get('/api/leaves').catch(() => ({ data: [] })),
          user?._id
            ? api.get(`/api/leaves/balance/${user._id}`).catch(() => ({ data: null }))
            : Promise.resolve({ data: null }),
          api.get('/api/users').catch(() => ({ data: [] })),
          api.get(`/api/daily-status?date=${today}`).catch(() => ({ data: [] })),
        ]);
        setTasks(tasksRes.data || []);
        setTodayLog((logRes.data || [])[0] || null);
        setLeaves(leavesRes.data || []);
        setBalance(balanceRes.data);
        setTeamMembers((teamRes.data || []).filter(u => u._id !== user?._id));
        setTeamLogs((teamLogsRes.data || []).filter(l => l.employee?._id !== user?._id));
      } catch {
        addToast('Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?._id]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading…</div>;

  const openTasks = tasks.filter(t => t.status !== 'Completed');
  const overdueTasks = tasks.filter(t => t.status === 'Overdue');
  const blockedTasks = tasks.filter(t => t.status === 'Blocked');
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const todayTasks = todayLog?.tasks || [];
  const todayDone = todayTasks.filter(t => t.status === 'Completed').length;
  const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started').slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="view active" id="view-employee-home">
      {/* Greeting */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {user?.designation && ` · ${user.designation}`}
          {user?.department && ` · ${user.department}`}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        <div className="stat-card" onClick={() => navigate('/dashboard/tasks')} style={{ cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--brand)' }}></div>
          <div className="stat-label">
            <i className="fas fa-list-check" style={{ color: 'var(--brand)' }}></i> Open Tasks
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value">{openTasks.length}</div>
          <div className="stat-delta delta-neutral">{tasks.length} total assigned</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/dashboard/daily-status')} style={{ cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = todayLog ? 'var(--success)' : 'var(--warning)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: todayLog ? 'var(--success)' : 'var(--warning)' }}></div>
          <div className="stat-label">
            <i className="fas fa-check-square" style={{ color: todayLog ? 'var(--success)' : 'var(--warning)' }}></i> Today's Log
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value" style={{ color: todayLog ? 'var(--success)' : 'var(--warning)' }}>
            {todayLog ? todayDone : '—'}
          </div>
          <div className="stat-delta delta-neutral">
            {todayLog ? `${todayTasks.length} tasks logged` : 'not submitted yet'}
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/dashboard/leaves')} style={{ cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--success)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--success)' }}></div>
          <div className="stat-label">
            <i className="fas fa-umbrella-beach" style={{ color: 'var(--success)' }}></i> Leave Balance
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {balance?.available ?? '—'}
          </div>
          <div className="stat-delta delta-neutral">days remaining</div>
        </div>

        <div className="stat-card" style={{ cursor: 'default' }}>
          <div className="stat-card-accent" style={{ background: overdueTasks.length > 0 ? 'var(--danger)' : blockedTasks.length > 0 ? 'var(--warning)' : 'var(--success)' }}></div>
          <div className="stat-label">
            <i className="fas fa-triangle-exclamation" style={{ color: overdueTasks.length > 0 ? 'var(--danger)' : blockedTasks.length > 0 ? 'var(--warning)' : 'var(--success)' }}></i> Attention
          </div>
          <div className="stat-value" style={{ color: overdueTasks.length > 0 ? 'var(--danger)' : 'var(--text)' }}>
            {overdueTasks.length + blockedTasks.length}
          </div>
          <div className="stat-delta delta-neutral">
            {overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : blockedTasks.length > 0 ? `${blockedTasks.length} blocked` : 'all clear'}
          </div>
        </div>
      </div>

      {/* Quick action banner if log not submitted */}
      {!todayLog && (
        <div style={{ padding: '14px 18px', background: 'var(--warning-bg)', border: '1px solid #FDE68A', borderRadius: 'var(--radius-lg)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fas fa-clock" style={{ color: 'var(--warning)', fontSize: '18px' }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--warning-text)' }}>You haven't logged your status today</div>
            <div style={{ fontSize: '12px', color: 'var(--warning-text)', opacity: 0.8 }}>Daily logs are due by 6:00 PM</div>
          </div>
          <Button variant="primary" size="sm" icon="plus" onClick={() => navigate('/dashboard/daily-status')}>Log Status</Button>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="sm" icon="pen-to-square" onClick={() => navigate('/dashboard/daily-status')}>
          Log Today's Status
        </Button>
        <Button variant="secondary" size="sm" icon="umbrella-beach" onClick={() => navigate('/dashboard/leaves')}>
          Apply Leave / WFH
        </Button>
        <Button variant="secondary" size="sm" icon="list-check" onClick={() => navigate('/dashboard/tasks')}>
          View My Tasks
        </Button>
      </div>

      <div className="two-col" style={{ marginBottom: '20px' }}>
        {/* Active tasks */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">My Active Tasks</div>
            <Badge variant="neutral">{openTasks.length}</Badge>
          </div>
          {activeTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)', fontSize: '13px' }}>
              <i className="fas fa-circle-check" style={{ fontSize: '24px', color: 'var(--success)', display: 'block', marginBottom: '8px' }}></i>
              No open tasks — you're all caught up!
            </div>
          ) : activeTasks.map((t, i) => (
            <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i === activeTasks.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{t.title}</div>
                {t.project?.name && <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{t.project.name}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                {t.dueDate && <div style={{ fontSize: '10px', color: t.status === 'Overdue' ? 'var(--danger)' : 'var(--text3)', marginTop: '3px' }}>Due {t.dueDate}</div>}
              </div>
            </div>
          ))}
          {openTasks.length > 6 && (
            <div style={{ textAlign: 'center', paddingTop: '10px' }}>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/tasks')}>
                View all {openTasks.length} tasks →
              </Button>
            </div>
          )}
        </div>

        {/* Today's log preview */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">Today's Status Log</div>
            {todayLog
              ? <Badge variant="success"><i className="fas fa-circle-check"></i> Submitted</Badge>
              : <Badge variant="warning"><i className="fas fa-clock"></i> Pending</Badge>}
          </div>
          {!todayLog ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)', fontSize: '13px', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              <i className="fas fa-pen-to-square" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
              No log submitted yet today
              <div style={{ marginTop: '12px' }}>
                <Button variant="primary" size="sm" icon="plus" onClick={() => navigate('/dashboard/daily-status')}>Start Log</Button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div className="emp-stat">
                  <div className="emp-stat-val" style={{ color: 'var(--brand)' }}>{todayTasks.length}</div>
                  <div className="emp-stat-lbl">Tasks logged</div>
                </div>
                <div className="emp-stat">
                  <div className="emp-stat-val" style={{ color: 'var(--success)' }}>{todayDone}</div>
                  <div className="emp-stat-lbl">Completed</div>
                </div>
              </div>
              {todayTasks.slice(0, 4).map((t, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i === Math.min(todayTasks.length, 4) - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, flex: 1, marginRight: '8px' }}>{t.task}</div>
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  </div>
                  {t.progress > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <div className="progress" style={{ height: '4px' }}>
                        <div className="progress-fill" style={{ width: `${t.progress}%`, background: progColor(t.progress) }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {todayTasks.length > 4 && (
                <div style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', paddingTop: '8px' }}>
                  +{todayTasks.length - 4} more tasks
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent leave requests */}
      {leaves.length > 0 && (
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">My Leave & WFH Requests</div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/leaves')}>View all →</Button>
          </div>
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr>
            </thead>
            <tbody>
              {leaves.slice(0, 5).map(leave => (
                <tr key={leave._id}>
                  <td style={{ fontWeight: 500 }}>{leave.type}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text2)' }}>
                    {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {leave.startDate !== leave.endDate && ` – ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{leave.days}d</td>
                  <td>
                    <Badge variant={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'}>
                      {leave.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Team Members & Status Logs */}
      {teamMembers.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="section-hdr" style={{ marginBottom: '16px' }}>
            <div className="section-title"><i className="fas fa-users" style={{ color: 'var(--brand)', marginRight: '8px' }}></i>My Team Updates</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {teamMembers.map(member => {
              const memberLog = teamLogs.find(l => l.employee?._id === member._id);
              return (
                <div key={member._id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={member.avatar?.initials} bg={member.avatar?.bg} size="md" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{member.role}</div>
                      </div>
                    </div>
                    <Badge variant={member.status === 'on-leave' ? 'danger' : 'success'}>
                      {member.status === 'on-leave' ? 'On Leave' : 'Working'}
                    </Badge>
                  </div>
                  
                  {memberLog ? (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>TODAY'S TASKS</div>
                      {memberLog.tasks.slice(0, 3).map((t, idx) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span className="truncate" style={{ maxWidth: '180px' }}>{t.task}</span>
                            <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                          </div>
                          {t.progress > 0 && (
                            <div className="progress" style={{ height: '3px' }}>
                              <div className="progress-fill" style={{ width: `${t.progress}%`, background: progColor(t.progress) }}></div>
                            </div>
                          )}
                        </div>
                      ))}
                      {memberLog.tasks.length > 3 && (
                         <div style={{ fontSize: '11px', color: 'var(--text3)' }}>+{memberLog.tasks.length - 3} more</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', padding: '8px 0' }}>No log submitted yet</div>
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

export default EmployeeOverview;
