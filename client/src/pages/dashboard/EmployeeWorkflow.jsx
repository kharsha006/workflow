import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AssignTaskModal from '../../components/modals/AssignTaskModal';
import EscalateModal from '../../components/modals/EscalateModal';
import EscalationDetailModal from '../../components/modals/EscalationDetailModal';
import useAuth from '../../hooks/useAuth';
import { stVariant } from '../../data/prototypeData';
import { ESC_PRI_CFG, ESC_STATUS_BADGE, escTimeAgo } from '../../data/escalations';

const WORK_STATUS_VARIANT = (s) =>
  s === 'Blocked' ? 'warning' : s === 'Overdue task' ? 'danger' : s === 'In review' ? 'info' : 'success';

const progColor = (p) =>
  p === 100 ? 'var(--success)' : p >= 50 ? 'var(--info)' : p > 0 ? 'var(--warning)' : 'var(--text3)';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STAT_DEFS = [
  { key: 'Completed', label: 'Completed', icon: 'fa-circle-check', accent: 'var(--success)', sub: 'this month' },
  { key: 'In Progress', label: 'In progress', icon: 'fa-spinner', accent: 'var(--info)', sub: 'active now' },
  { key: 'Blocked', label: 'Blocked', icon: 'fa-ban', accent: 'var(--warning)', sub: 'need attention' },
  { key: 'Overdue', label: 'Overdue', icon: 'fa-clock', accent: 'var(--danger)', sub: 'past due' },
];

const EmployeeWorkflow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const canManage = user?.role === 'Founding Team' || user?.role === 'HR';

  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showEsc, setShowEsc] = useState(false);
  const [escDetail, setEscDetail] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [empRes, tasksRes, logsRes, escRes] = await Promise.all([
          api.get(`/api/users/${id}`),
          api.get('/api/tasks').catch(() => ({ data: [] })),
          api.get(`/api/daily-status/employee/${id}`).catch(() => ({ data: [] })),
          api.get('/api/escalations').catch(() => ({ data: [] })),
        ]);
        setEmployee(empRes.data);
        setTasks((tasksRes.data || []).filter(t => t.assignee?._id === id || t.assignee === id));
        setStatusLogs(logsRes.data || []);
        setEscalations((escRes.data || []).filter(e => e.member === empRes.data?.name));
      } catch {
        addToast('Failed to load employee details', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const reloadEsc = async () => {
    try {
      const { data } = await api.get('/api/escalations');
      setEscalations((data || []).filter(e => e.member === employee?.name));
    } catch { /* ignore */ }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading...</div>;
  if (!employee) return <div style={{ padding: '24px' }}>Employee not found</div>;

  const countOf = (key) => tasks.filter(t => t.status === key).length;
  const isOnLeave = employee.status === 'on-leave';

  // Productivity from real daily status logs
  // Build a map: day-of-week → total tasks logged on that day (last 7 logs)
  const recentLogs = statusLogs.slice(0, 30);
  const weekBars = [0, 0, 0, 0, 0, 0, 0];
  recentLogs.forEach(log => {
    const d = new Date(log.date + 'T12:00:00');
    const dow = (d.getDay() + 6) % 7; // 0=Mon … 6=Sun
    weekBars[dow] += (log.tasks || []).length;
  });
  const maxBar = Math.max(...weekBars) || 1;

  const totalLogged = recentLogs.reduce((s, l) => s + (l.tasks || []).length, 0);
  const totalHours = recentLogs.reduce((s, l) =>
    s + (l.tasks || []).reduce((a, t) => a + (t.hoursSpent || 0), 0), 0);

  return (
    <div className="view active" id="view-employee">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

      {/* Profile */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="emp-profile-top" style={{ marginBottom: 0 }}>
          <Avatar initials={employee.avatar?.initials} bg={employee.avatar?.bg} color={employee.avatar?.color} size="xl" />
          <div className="emp-profile-info">
            <div className="emp-profile-name">{employee.name}</div>
            <div className="emp-profile-role">{employee.designation} · {employee.department}</div>
            <div className="emp-profile-meta">
              <div className="emp-profile-meta-item"><i className="fas fa-envelope"></i> {employee.email}</div>
              {employee.joiningDate && (
                <div className="emp-profile-meta-item">
                  <i className="fas fa-calendar"></i> Joined {new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {employee.workStatus && <Badge variant={WORK_STATUS_VARIANT(employee.workStatus)}>{employee.workStatus}</Badge>}
              {isOnLeave
                ? <Badge variant="danger"><i className="fas fa-umbrella-beach" style={{ fontSize: '10px' }}></i> On Leave</Badge>
                : <Badge variant="success"><i className="fas fa-circle-check" style={{ fontSize: '10px' }}></i> Available</Badge>}
              <Badge variant="neutral">
                <i className="fas fa-calendar-check" style={{ fontSize: '10px' }}></i> {employee.leaveBalance?.available ?? 0} leave days left
              </Badge>
            </div>
          </div>
          <Button variant="primary" size="sm" icon="plus" onClick={() => setShowAssign(true)}>Assign task</Button>
        </div>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {STAT_DEFS.map(c => {
          const count = countOf(c.key);
          const open = activePanel === c.key;
          return (
            <div key={c.key} className="stat-card" style={{ cursor: 'pointer' }}
              onClick={() => setActivePanel(open ? null : c.key)}>
              <div className="stat-card-accent" style={{ background: c.accent }}></div>
              <div className="stat-label">
                <i className={`fas ${c.icon}`} style={{ color: c.accent }}></i> {c.label}
                <i className={`fas fa-chevron-down chevron-toggle ${open ? 'open' : ''}`} style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
              </div>
              <div className="stat-value">{count}</div>
              <div className="stat-delta delta-neutral">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Stat panel */}
      {activePanel && (() => {
        const cfg = STAT_DEFS.find(c => c.key === activePanel);
        const filtered = tasks.filter(t => t.status === activePanel);
        return (
          <div className="card" style={{ marginBottom: '20px', borderTop: `3px solid ${cfg.accent}`, animation: 'fadeIn 0.2s ease' }}>
            <div className="section-hdr" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className={`fas ${cfg.icon}`} style={{ color: cfg.accent, fontSize: '15px' }}></i>
                <div className="section-title">{cfg.label} tasks</div>
                <Badge variant={stVariant(activePanel)}>{filtered.length}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActivePanel(null)}><i className="fas fa-xmark"></i> Close</Button>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
                <i className="fas fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                No {cfg.label.toLowerCase()} tasks
              </div>
            ) : (
              <table className="task-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead><tr>
                  <th style={{ width: '40%' }}>Task</th>
                  <th style={{ width: '15%' }}>Priority</th>
                  <th style={{ width: '18%' }}>Due date</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '12%' }}>Project</th>
                </tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 500, fontSize: '13px' }}>{t.title}</td>
                      <td><Badge variant={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'warning' : 'neutral'}>{t.priority || 'Normal'}</Badge></td>
                      <td style={{ fontSize: '13px', color: 'var(--text2)' }}>{t.dueDate || '—'}</td>
                      <td><Badge variant={stVariant(t.status)}>{t.status}</Badge></td>
                      <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{t.project?.name?.split(' ')[0] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })()}

      {/* Current tasks + Productivity */}
      <div className="two-col" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">Assigned tasks</div>
            <Badge variant="neutral">{tasks.length}</Badge>
          </div>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>No tasks assigned</div>
          ) : (
            tasks.map((t, i) => (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i === tasks.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{t.title}</div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '4px' }}>{t.dueDate}</span>
                <Badge variant={stVariant(t.status)}>{t.status}</Badge>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '12px' }}>
            <div className="section-title">Productivity (last 30 logs)</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div className="emp-stat">
              <div className="emp-stat-val">{totalLogged}</div>
              <div className="emp-stat-lbl">Tasks logged</div>
            </div>
            <div className="emp-stat">
              <div className="emp-stat-val">{totalHours.toFixed(1)}h</div>
              <div className="emp-stat-lbl">Hours logged</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 600 }}>Activity by day of week</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {weekBars.map((v, i) => {
              const h = v > 0 ? Math.round((v / maxBar) * 64) + 6 : 4;
              const isWeekend = i === 5 || i === 6;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: v === 0 ? 'var(--text3)' : 'var(--text)' }}>{v > 0 ? v : ''}</div>
                  <div style={{ width: '100%', height: h + 'px', background: isWeekend ? 'var(--bg2)' : 'var(--brand-light)', borderRadius: '5px 5px 0 0' }}></div>
                  <div style={{ fontSize: '10px', color: isWeekend ? 'var(--text3)' : 'var(--text2)' }}>{DAYS[i]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical daily logs */}
      <div className="card">
        <div className="section-hdr" style={{ marginBottom: '14px' }}>
          <div className="section-title">Historical daily logs</div>
          <Badge variant="neutral">{statusLogs.length} entries</Badge>
        </div>
        {statusLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>No daily logs yet</div>
        ) : (
          statusLogs.slice(0, 20).map((log, i) => {
            const done = (log.tasks || []).filter(t => t.status === 'Completed').length;
            const inProg = (log.tasks || []).filter(t => t.status === 'In Progress').length;
            const blocked = (log.tasks || []).filter(t => t.status === 'Blocked').length;
            const avgProg = log.tasks?.length
              ? Math.round(log.tasks.reduce((s, t) => s + (t.progress || 0), 0) / log.tasks.length)
              : 0;
            return (
              <div key={log._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: i === Math.min(statusLogs.length, 20) - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ minWidth: '70px', fontSize: '12px', fontWeight: 600, color: 'var(--brand)', marginTop: '2px' }}>
                  {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, marginBottom: '4px' }}>
                    {log.tasks?.length || 0} task{log.tasks?.length !== 1 ? 's' : ''} logged
                    {avgProg > 0 && <span style={{ color: progColor(avgProg), marginLeft: '8px' }}>· {avgProg}% avg progress</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {done > 0 && <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="dot dot-green"></span>{done} done</span>}
                    {inProg > 0 && <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="dot dot-blue"></span>{inProg} in progress</span>}
                    {blocked > 0 && <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}><span className="dot dot-red"></span>{blocked} blocked</span>}
                  </div>
                  {/* Task notes preview */}
                  {log.tasks?.slice(0, 2).map((t, j) => (
                    t.task && (
                      <div key={j} style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px', fontStyle: 'italic' }}>
                        · {t.task}{t.notes ? ` — ${t.notes}` : ''}
                      </div>
                    )
                  ))}
                </div>
                {log.isLocked && <Badge variant="neutral" style={{ flexShrink: 0 }}><i className="fas fa-lock" style={{ fontSize: '9px' }}></i></Badge>}
              </div>
            );
          })
        )}
      </div>

      <AssignTaskModal isOpen={showAssign} onClose={() => setShowAssign(false)} prefillEmail={employee.email} />
    </div>
  );
};

export default EmployeeWorkflow;
