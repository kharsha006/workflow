import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const progColor = (p) =>
  p === 100 ? 'var(--success)' : p >= 50 ? 'var(--info)' : p > 0 ? 'var(--warning)' : 'var(--text3)';

const HRWorkTracker = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [openRows, setOpenRows] = useState({});

  useEffect(() => { fetchLogs(); }, [selectedDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/daily-status?date=${selectedDate}`);
      setLogs(data || []);
    } catch {
      addToast('Failed to load work tracker', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setOpenRows(p => ({ ...p, [id]: !p[id] }));

  const allTasks = logs.flatMap(l => l.tasks || []);
  const completed = allTasks.filter(t => t.status === 'Completed').length;
  const blocked = allTasks.filter(t => t.status === 'Blocked').length;
  const totalHours = allTasks.reduce((s, t) => s + (t.hoursSpent || 0), 0);

  return (
    <div className="view active" id="view-hr-tracker">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Daily Work Tracker</div>
          <div className="section-sub">Track team daily status submissions</div>
        </div>
        <input type="date" className="inp" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }} />
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Submissions', value: logs.length, color: 'var(--brand)' },
          { label: 'Tasks Logged', value: allTasks.length, color: 'var(--info)' },
          { label: 'Completed', value: completed, color: 'var(--success)' },
          { label: 'Blocked', value: blocked, color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="emp-stat">
            <div className="emp-stat-val" style={{ color: s.color }}>{s.value}</div>
            <div className="emp-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}><i className="fas fa-circle-notch fa-spin"></i></div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontSize: '13px' }}>
            <i className="fas fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
            No submissions for this date
          </div>
        ) : logs.map(log => {
          const m = log.employee || {};
          const t = log.tasks || [];
          const done = t.filter(x => x.status === 'Completed').length;
          const prog = t.length ? Math.round(t.reduce((a, x) => a + (x.progress || 0), 0) / t.length) : 0;
          const isOpen = !!openRows[log._id];

          return (
            <div key={log._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', cursor: 'pointer', background: 'var(--bg)' }}
                onClick={() => toggle(log._id)}>
                <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{m.designation}</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{done}/{t.length} done</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: progColor(prog) }}>{prog}%</div>
                <div style={{ width: '80px' }}>
                  <div className="progress" style={{ height: '5px' }}>
                    <div className="progress-fill" style={{ width: prog + '%', background: progColor(prog) }}></div>
                  </div>
                </div>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '10px', color: 'var(--text3)' }}></i>
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <table className="task-table" style={{ width: '100%' }}>
                    <thead><tr><th>Task</th><th>Status</th><th>Progress</th><th>Hours</th><th>Notes</th></tr></thead>
                    <tbody>
                      {t.map((task, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: '12px', fontWeight: 500 }}>{task.task}</td>
                          <td><Badge variant={task.status === 'Completed' ? 'success' : task.status === 'Blocked' ? 'danger' : 'info'}>{task.status}</Badge></td>
                          <td style={{ fontSize: '12px', color: progColor(task.progress || 0), fontWeight: 600 }}>{task.progress || 0}%</td>
                          <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{task.hoursSpent > 0 ? `${task.hoursSpent}h` : '—'}</td>
                          <td style={{ fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic' }}>{task.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HRWorkTracker;
