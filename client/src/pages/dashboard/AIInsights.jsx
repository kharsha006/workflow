import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const AIInsights = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      api.get('/api/tasks').catch(() => ({ data: [] })),
      api.get('/api/users').catch(() => ({ data: [] })),
      api.get(`/api/daily-status?date=${today}`).catch(() => ({ data: [] })),
    ]).then(([t, u, l]) => {
      setTasks(t.data || []);
      setUsers(u.data || []);
      setLogs(l.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading insights…</div>;

  // --- Derived insights from real data ---

  const employees = users.filter(u => u.role === 'Employee' || u.role === 'Intern');
  const overdueTasks = tasks.filter(t => t.status === 'Overdue');
  const blockedTasks = tasks.filter(t => t.status === 'Blocked');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'In review');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  // Who has the most overdue tasks
  const overdueByPerson = {};
  overdueTasks.forEach(t => {
    const name = t.assignee?.name;
    if (name) overdueByPerson[name] = (overdueByPerson[name] || 0) + 1;
  });

  // Members who haven't submitted a log today
  const submittedIds = new Set(logs.map(l => (l.employee?._id || l.employee)?.toString()));
  const missingLogs = employees.filter(e => !submittedIds.has(e._id?.toString()));

  // High-workload members (workload > 85%)
  const highWorkload = employees.filter(e => (e.workStats?.workload || 0) >= 85);

  // Top performers
  const topPerformers = [...employees]
    .sort((a, b) => (b.workStats?.performance || 0) - (a.workStats?.performance || 0))
    .slice(0, 4);

  // Daily briefing items
  const briefing = [];

  if (overdueTasks.length > 0) {
    const names = [...new Set(overdueTasks.map(t => t.assignee?.name).filter(Boolean))];
    briefing.push({
      type: 'danger',
      icon: 'fa-circle-exclamation',
      label: 'Critical',
      text: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} across ${names.length} member${names.length > 1 ? 's' : ''} (${names.slice(0, 2).join(', ')}${names.length > 2 ? '…' : ''}). Immediate follow-up needed.`,
    });
  }

  if (blockedTasks.length > 0) {
    const names = [...new Set(blockedTasks.map(t => t.assignee?.name).filter(Boolean))];
    briefing.push({
      type: 'warning',
      icon: 'fa-triangle-exclamation',
      label: 'At risk',
      text: `${blockedTasks.length} task${blockedTasks.length > 1 ? 's' : ''} blocked (${names.slice(0, 2).join(', ')}). Unblocking these should free team velocity.`,
    });
  }

  if (missingLogs.length > 0) {
    briefing.push({
      type: 'warning',
      icon: 'fa-user-clock',
      label: 'No log today',
      text: `${missingLogs.length} member${missingLogs.length > 1 ? 's' : ''} haven't submitted a daily status log yet: ${missingLogs.slice(0, 3).map(m => m.name.split(' ')[0]).join(', ')}${missingLogs.length > 3 ? '…' : ''}.`,
    });
  }

  if (completedTasks.length > 0 && overdueTasks.length === 0) {
    briefing.push({
      type: 'success',
      icon: 'fa-check',
      label: 'Strong delivery',
      text: `${completedTasks.length} task${completedTasks.length > 1 ? 's' : ''} completed with no overdue items. Team is on track.`,
    });
  } else if (completedTasks.length > 0) {
    briefing.push({
      type: 'success',
      icon: 'fa-check',
      label: 'Good progress',
      text: `${completedTasks.length} task${completedTasks.length > 1 ? 's' : ''} completed this period.`,
    });
  }

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  briefing.push({
    type: 'info',
    icon: 'fa-chart-line',
    label: 'Velocity',
    text: `${completionRate}% overall task completion rate. ${inProgressTasks.length} tasks in progress across all projects.`,
  });

  // Risk signals
  const risks = [];
  missingLogs.slice(0, 3).forEach(m => {
    risks.push({ label: `${m.name} — no log today`, level: 'danger', badge: 'High risk' });
  });
  highWorkload.forEach(m => {
    risks.push({ label: `${m.name} — ${m.workStats.workload}% workload`, level: 'warning', badge: 'Overloaded' });
  });
  if (blockedTasks.length >= 3) {
    risks.push({ label: `${blockedTasks.length} tasks currently blocked`, level: 'warning', badge: 'Medium' });
  }
  overdueTasks.slice(0, 2).forEach(t => {
    risks.push({ label: `${t.title} — overdue`, level: 'danger', badge: 'Overdue' });
  });
  if (risks.length === 0) {
    risks.push({ label: 'No risk signals detected today', level: 'success', badge: 'All clear' });
  }

  // Recommendations
  const recs = [];
  if (overdueTasks.length > 0) {
    const t = overdueTasks[0];
    recs.push({
      icon: 'fa-user-check',
      title: `Review ${t.taskId || 'overdue task'}`,
      desc: `"${t.title}" is overdue. Consider reassigning or adjusting the deadline.`,
      color: 'var(--danger-bg)', textColor: 'var(--danger-text)',
    });
  }
  if (blockedTasks.length > 0) {
    const t = blockedTasks[0];
    recs.push({
      icon: 'fa-unlock',
      title: `Unblock ${t.assignee?.name?.split(' ')[0] || 'member'}`,
      desc: `"${t.title}" is blocked. Quick intervention could unblock downstream work.`,
      color: 'var(--warning-bg)', textColor: 'var(--warning-text)',
    });
  }
  if (highWorkload.length > 0) {
    const m = highWorkload[0];
    const lowLoad = employees.filter(e => (e.workStats?.workload || 0) < 50 && e._id !== m._id);
    recs.push({
      icon: 'fa-scale-balanced',
      title: 'Rebalance workload',
      desc: `${m.name} is at ${m.workStats.workload}% capacity.${lowLoad.length > 0 ? ` ${lowLoad[0].name} has capacity to take on more.` : ' Consider redistributing tasks.'}`,
      color: 'var(--info-bg)', textColor: 'var(--info-text)',
    });
  }
  if (recs.length === 0) {
    recs.push({
      icon: 'fa-star',
      title: 'Team is healthy',
      desc: 'No immediate actions needed. Consider planning ahead for next sprint.',
      color: 'var(--success-bg)', textColor: 'var(--success-text)',
    });
  }

  return (
    <div className="view active" id="view-ai">
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div className="section-title" style={{ fontSize: '18px' }}>AI Insights</div>
          <Badge variant="brand"><i className="fas fa-wand-magic-sparkles"></i> Live</Badge>
        </div>
        <div className="section-sub">
          Derived from {tasks.length} tasks · {employees.length} employees · {logs.length} logs today
        </div>
      </div>

      {/* Daily Briefing */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-hdr"><div className="section-title">Daily briefing</div><Badge variant="brand">Auto-generated</Badge></div>
        {briefing.map((item, i) => (
          <div key={i} className={`insight-row ${item.type}`}>
            <div className="insight-icon"><i className={`fas ${item.icon}`}></i></div>
            <div><strong>{item.label}:</strong> {item.text}</div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: '16px' }}>
        {/* Risk signals */}
        <div className="card">
          <div className="section-hdr"><div className="section-title">Risk signals</div></div>
          <table className="task-table" style={{ width: '100%' }}>
            <tbody>
              {risks.slice(0, 6).map((r, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '13px' }}>{r.label}</td>
                  <td><Badge variant={r.level === 'danger' ? 'danger' : r.level === 'success' ? 'success' : 'warning'}>{r.badge}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top performers */}
        <div className="card">
          <div className="section-hdr"><div className="section-title">Top performers</div></div>
          <div>
            {topPerformers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text3)', fontSize: '13px' }}>No performance data yet</div>
            ) : topPerformers.map((m, i) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i === topPerformers.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text3)', width: '20px', textAlign: 'center' }}>{i + 1}</div>
                <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{m.designation}</div>
                </div>
                <Badge variant="success">{m.workStats?.performance ?? 0}%</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task health stats */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-hdr" style={{ marginBottom: '14px' }}><div className="section-title">Task health</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Completed', value: completedTasks.length, color: 'var(--success-bg)', text: 'var(--success-text)' },
            { label: 'In Progress', value: inProgressTasks.length, color: 'var(--info-bg)', text: 'var(--info-text)' },
            { label: 'Blocked', value: blockedTasks.length, color: 'var(--warning-bg)', text: 'var(--warning-text)' },
            { label: 'Overdue', value: overdueTasks.length, color: 'var(--danger-bg)', text: 'var(--danger-text)' },
          ].map(s => (
            <div key={s.label} className="emp-stat" style={{ background: s.color }}>
              <div className="emp-stat-val" style={{ color: s.text }}>{s.value}</div>
              <div className="emp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Completion bar */}
        <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', fontWeight: 600 }}>
          Completion rate — {completionRate}% ({completedTasks.length}/{tasks.length} tasks)
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div className="progress-fill" style={{ width: `${completionRate}%`, background: completionRate >= 70 ? 'var(--success)' : completionRate >= 40 ? 'var(--info)' : 'var(--warning)' }}></div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="section-hdr" style={{ marginBottom: '14px' }}><div className="section-title">Recommendations</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${recs.length > 1 ? Math.min(recs.length, 3) : 1},1fr)`, gap: '12px' }}>
          {recs.map((r, i) => (
            <div key={i} className="card card-sm" style={{ background: r.color, borderColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.textColor, fontSize: '13px' }}>
                  <i className={`fas ${r.icon}`}></i>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: r.textColor }}>{r.title}</div>
              </div>
              <div style={{ fontSize: '12px', color: r.textColor, opacity: 0.85, lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
