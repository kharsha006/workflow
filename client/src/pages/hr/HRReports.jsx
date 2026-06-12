import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';

const HRReports = () => {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/users').catch(() => ({ data: [] })),
      api.get('/api/leaves').catch(() => ({ data: [] })),
      api.get('/api/tasks').catch(() => ({ data: [] })),
    ]).then(([u, l, t]) => {
      setUsers(u.data || []);
      setLeaves(l.data || []);
      setTasks(t.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i></div>;

  const employees = users.filter(u => u.role === 'Employee' || u.role === 'Intern');
  const approved = leaves.filter(l => l.status === 'Approved');
  const pending = leaves.filter(l => l.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const overdueTasks = tasks.filter(t => t.status === 'Overdue');
  const wfhLeaves = leaves.filter(l => l.type === 'Work from Home');

  const totalLeaveDays = approved
    .filter(l => l.type !== 'Work from Home')
    .reduce((s, l) => s + (l.days || 0), 0);

  const deptBreakdown = employees.reduce((acc, e) => {
    const d = e.department || 'Unknown';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="view active" id="view-hr-reports">
      <div style={{ marginBottom: '22px' }}>
        <div className="section-title" style={{ fontSize: '18px' }}>Reports & Analytics</div>
        <div className="section-sub">Company-wide summary for HR</div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Employees', value: employees.length, icon: 'fa-users', color: 'var(--brand)' },
          { label: 'Leave Days Taken', value: totalLeaveDays, icon: 'fa-umbrella-beach', color: 'var(--warning)' },
          { label: 'WFH Requests', value: wfhLeaves.length, icon: 'fa-house-laptop', color: 'var(--info)' },
          { label: 'Pending Approvals', value: pending.length, icon: 'fa-clock', color: pending.length > 0 ? 'var(--danger)' : 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-accent" style={{ background: s.color }}></div>
            <div className="stat-label"><i className={`fas ${s.icon}`} style={{ color: s.color }}></i> {s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Department breakdown */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">Headcount by Department</div>
            <Badge variant="neutral">{employees.length} total</Badge>
          </div>
          {Object.entries(deptBreakdown).sort((a, b) => b[1] - a[1]).map(([dept, count]) => {
            const pct = Math.round((count / employees.length) * 100);
            return (
              <div key={dept} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 500 }}>{dept}</span>
                  <span style={{ color: 'var(--text2)' }}>{count} ({pct}%)</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--brand)' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Task summary */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '14px' }}>
            <div className="section-title">Task Overview</div>
            <Badge variant="neutral">{tasks.length} total</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {[
              { label: 'Completed', value: completedTasks.length, color: 'var(--success-bg)', text: 'var(--success-text)' },
              { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'var(--info-bg)', text: 'var(--info-text)' },
              { label: 'Overdue', value: overdueTasks.length, color: 'var(--danger-bg)', text: 'var(--danger-text)' },
              { label: 'Blocked', value: tasks.filter(t => t.status === 'Blocked').length, color: 'var(--warning-bg)', text: 'var(--warning-text)' },
            ].map(s => (
              <div key={s.label} className="emp-stat" style={{ background: s.color }}>
                <div className="emp-stat-val" style={{ color: s.text }}>{s.value}</div>
                <div className="emp-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
          {tasks.length > 0 && (
            <>
              <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px', fontWeight: 600 }}>
                Completion rate — {Math.round((completedTasks.length / tasks.length) * 100)}%
              </div>
              <div className="progress" style={{ height: '7px' }}>
                <div className="progress-fill" style={{ width: `${Math.round((completedTasks.length / tasks.length) * 100)}%`, background: 'var(--success)' }}></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRReports;
