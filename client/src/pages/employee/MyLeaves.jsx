import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const diffDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  if (!start || !end || e < s) return 0;
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

const LEAVE_TYPES = [
  { value: 'Annual leave', label: 'Annual Leave', icon: 'fa-sun' },
  { value: 'Sick leave', label: 'Sick Leave', icon: 'fa-kit-medical' },
  { value: 'Personal', label: 'Personal', icon: 'fa-user' },
  { value: 'Work from Home', label: 'Work from Home (WFH)', icon: 'fa-house-laptop' },
];

const EMPTY = { type: 'Annual leave', startDate: '', endDate: '', reason: '' };

const MyLeaves = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        api.get('/api/leaves'),
        user?._id ? api.get(`/api/leaves/balance/${user._id}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);
      setLeaves(leavesRes.data || []);
      setBalance(balanceRes.data);
    } catch {
      addToast('Failed to load leaves', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const days = diffDays(form.startDate, form.endDate);
    if (days <= 0) { addToast('End date must be after start date', 'error'); return; }
    if (!form.reason.trim()) { addToast('Please provide a reason', 'error'); return; }

    try {
      setSubmitting(true);
      await api.post('/api/leaves', { ...form, days });
      addToast('Leave request submitted', 'success');
      setShowApply(false);
      setForm(EMPTY);
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const days = diffDays(form.startDate, form.endDate);

  return (
    <div className="view active" id="view-my-leaves">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Leave & WFH Requests</div>
          <div className="section-sub">Manage your leaves and work-from-home requests</div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={() => setShowApply(true)}>Apply Leave / WFH</Button>
      </div>

      {/* Leave balance widget */}
      {balance && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div className="stat-card">
            <div className="stat-card-accent" style={{ background: 'var(--success)' }}></div>
            <div className="stat-label"><i className="fas fa-circle-check" style={{ color: 'var(--success)' }}></i> Available</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{balance.available}</div>
            <div className="stat-delta delta-neutral">days remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent" style={{ background: 'var(--warning)' }}></div>
            <div className="stat-label"><i className="fas fa-umbrella-beach" style={{ color: 'var(--warning)' }}></i> Taken</div>
            <div className="stat-value">{balance.taken}</div>
            <div className="stat-delta delta-neutral">days used</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-accent" style={{ background: 'var(--brand)' }}></div>
            <div className="stat-label"><i className="fas fa-calendar" style={{ color: 'var(--brand)' }}></i> Total</div>
            <div className="stat-value">{balance.total}</div>
            <div className="stat-delta delta-neutral">days per year</div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}><i className="fas fa-circle-notch fa-spin"></i></div>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            <i className="fas fa-calendar-xmark" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
            No leave history yet
          </div>
        ) : (
          <table className="task-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
                  <td style={{ fontWeight: 500 }}>
                    {leave.type === 'Work from Home'
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-house-laptop" style={{ fontSize: '11px', color: 'var(--info)' }}></i>{leave.type}</span>
                      : leave.type}
                  </td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{leave.days}d</td>
                  <td style={{ fontSize: '12px', color: 'var(--text2)' }}>{leave.reason || '—'}</td>
                  <td>
                    <Badge variant={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'}>
                      {leave.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Apply Leave / WFH Modal */}
      <Modal isOpen={showApply} onClose={() => { setShowApply(false); setForm(EMPTY); }} title="Apply Leave / WFH" subtitle={balance ? `${balance.available} leave days available` : ''} maxWidth="460px">
        <form onSubmit={handleApply}>
          {/* Type selector as cards */}
          <div className="form-group">
            <label className="form-label">Request Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              {LEAVE_TYPES.map(lt => (
                <div key={lt.value}
                  onClick={() => setForm({ ...form, type: lt.value })}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    border: `2px solid ${form.type === lt.value ? 'var(--brand)' : 'var(--border)'}`,
                    background: form.type === lt.value ? 'var(--brand-light)' : 'var(--bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: form.type === lt.value ? 600 : 400,
                    color: form.type === lt.value ? 'var(--brand)' : 'var(--text)',
                    transition: 'all 0.15s',
                  }}>
                  <i className={`fas ${lt.icon}`} style={{ fontSize: '13px' }}></i>
                  {lt.label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="inp" type="date" value={form.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="inp" type="date" value={form.endDate}
                min={form.startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          {days > 0 && (
            <div style={{ padding: '8px 12px', background: form.type === 'Work from Home' ? 'var(--info-bg)' : 'var(--brand-light)', borderRadius: 'var(--radius)', fontSize: '12px', color: form.type === 'Work from Home' ? 'var(--info-text)' : 'var(--brand)', fontWeight: 600, marginBottom: '12px' }}>
              <i className={`fas ${form.type === 'Work from Home' ? 'fa-house-laptop' : 'fa-calendar-days'}`}></i>{' '}
              {days} day{days > 1 ? 's' : ''} {form.type === 'Work from Home' ? '(WFH — no leave balance deducted)' : 'requested'}
              {form.type !== 'Work from Home' && balance && days > balance.available && (
                <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>⚠ Exceeds available balance ({balance.available}d)</span>
              )}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{form.type === 'Work from Home' ? 'WFH Reason' : 'Reason'} *</label>
            <textarea className="inp" rows="3"
              placeholder={form.type === 'Work from Home' ? 'Why are you working from home?' : 'Briefly describe your reason…'}
              value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={() => { setShowApply(false); setForm(EMPTY); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : form.type === 'Work from Home' ? 'Submit WFH Request' : 'Submit Leave Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyLeaves;
