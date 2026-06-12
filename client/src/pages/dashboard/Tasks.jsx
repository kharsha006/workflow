import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import AssignTaskModal from '../../components/modals/AssignTaskModal';

const priorityVariant = (p) => (p === 'Urgent' ? 'danger' : p === 'High' ? 'warning' : 'neutral');
const statusVariant = (s) => {
  if (s === 'Completed' || s === 'Submitted') return 'success';
  if (s === 'Overdue') return 'danger';
  if (s === 'Blocked') return 'warning';
  if (s === 'In Progress' || s === 'In review') return 'info';
  return 'neutral';
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'completed', label: 'Completed' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => addToast('Failed to load tasks', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const matches = (t, f) => {
    if (f === 'urgent') return t.priority === 'Urgent';
    if (f === 'in-progress') return t.status === 'In Progress';
    if (f === 'blocked') return t.status === 'Blocked';
    if (f === 'completed') return t.status === 'Completed';
    return true;
  };
  const count = (f) => tasks.filter((t) => matches(t, f)).length;
  const list = tasks.filter((t) => matches(t, filter));

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading...</div>;

  return (
    <div className="view active" id="view-tasks">
      <div className="section-hdr" style={{ marginBottom: '16px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Task manager</div>
          <div className="section-sub">All tasks across projects</div>
        </div>
        {(user?.role === 'Founding Team' || user?.role === 'HR') && (
          <Button variant="primary" size="sm" icon="plus" onClick={() => setShowModal(true)}>New task</Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <span key={f.key} onClick={() => setFilter(f.key)}
            className={`badge ${filter === f.key ? 'badge-brand' : 'badge-neutral'}`}
            style={{ cursor: 'pointer', padding: '5px 12px' }}>
            {f.label} ({count(f.key)})
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="task-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead><tr>
            <th style={{ width: '32%' }}>Task</th>
            <th style={{ width: '16%' }}>Assignee</th>
            <th style={{ width: '13%' }}>Priority</th>
            <th style={{ width: '15%' }}>Status</th>
            <th style={{ width: '12%' }}>Due</th>
            <th style={{ width: '12%' }}>Project</th>
          </tr></thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text3)' }}>No tasks found</td></tr>
            ) : list.map((t) => (
              <tr key={t._id}>
                <td><div className="task-title-cell">{t.title}</div><div className="task-id">{t.taskId}</div></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Avatar initials={t.assignee?.avatar?.initials} bg={t.assignee?.avatar?.bg} color={t.assignee?.avatar?.color} size="sm" />
                    <span style={{ fontSize: '13px' }}>{t.assignee?.name?.split(' ')[0]}</span>
                  </div>
                </td>
                <td><Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge></td>
                <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                <td style={{ fontSize: '13px' }}>{t.dueDate}</td>
                <td><span style={{ fontSize: '12px', color: 'var(--text2)' }}>{t.project?.name?.split(' ')[0]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AssignTaskModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Tasks;
