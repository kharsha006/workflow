import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const TYPE_ICON = {
  'Work from Home': { icon: 'fa-house-laptop', color: 'var(--info)' },
  'Sick leave':     { icon: 'fa-kit-medical', color: 'var(--danger)' },
  'Annual leave':   { icon: 'fa-sun', color: 'var(--warning)' },
  'Personal':       { icon: 'fa-user', color: 'var(--text2)' },
};

const HRLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/api/leaves');
      setLeaves(data);
    } catch {
      addToast('Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/leaves/${id}`, { status });
      addToast(`Request ${status.toLowerCase()}`, 'success');
      fetchLeaves();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const pending = leaves.filter(l => l.status === 'Pending');
  const wfhLeaves = leaves.filter(l => l.type === 'Work from Home');

  const filtered = leaves.filter(l => {
    if (filter === 'pending') return l.status === 'Pending';
    if (filter === 'wfh') return l.type === 'Work from Home';
    if (filter === 'leave') return l.type !== 'Work from Home';
    return true;
  });

  const TABS = [
    { key: 'all', label: 'All', count: leaves.length },
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'leave', label: 'Leave', count: leaves.length - wfhLeaves.length },
    { key: 'wfh', label: 'WFH', count: wfhLeaves.length },
  ];

  return (
    <div className="view active" id="view-hr-leaves">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Leave & WFH Requests</div>
          <div className="section-sub">Review and action employee requests</div>
        </div>
        {pending.length > 0 && <Badge variant="warning">{pending.length} pending</Badge>}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <span key={t.key} onClick={() => setFilter(t.key)}
            className={`badge ${filter === t.key ? 'badge-brand' : 'badge-neutral'}`}
            style={{ cursor: 'pointer', padding: '5px 12px' }}>
            {t.label} ({t.count})
          </span>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}><i className="fas fa-circle-notch fa-spin"></i></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontSize: '13px' }}>
            <i className="fas fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
            No requests found
          </div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(leave => {
                const ti = TYPE_ICON[leave.type] || { icon: 'fa-calendar', color: 'var(--text2)' };
                return (
                  <tr key={leave._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar
                          initials={leave.employee?.avatar?.initials || leave.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          bg={leave.employee?.avatar?.bg}
                          color={leave.employee?.avatar?.color}
                          size="sm"
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{leave.employee?.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{leave.employee?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500 }}>
                        <i className={`fas ${ti.icon}`} style={{ color: ti.color, fontSize: '11px' }}></i>
                        {leave.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)' }}>
                      {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' – '}
                      {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{leave.days}d</td>
                    <td style={{ fontSize: '12px', color: 'var(--text2)', maxWidth: '160px' }}>{leave.reason || '—'}</td>
                    <td>
                      <Badge variant={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'}>
                        {leave.status}
                      </Badge>
                    </td>
                    <td>
                      {leave.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button variant="success" size="sm" onClick={() => handleAction(leave._id, 'Approved')}>Approve</Button>
                          <Button variant="danger" size="sm" onClick={() => handleAction(leave._id, 'Rejected')}>Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HRLeaves;
