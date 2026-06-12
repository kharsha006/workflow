import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const EMPTY_FORM = {
  name: '', email: '', designation: '', department: '', joiningDate: '',
  role: 'Employee',
};

const HRPeople = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/api/users');
      setTeam(data);
    } catch {
      addToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(team.map(m => m.department).filter(Boolean))].sort();

  const filtered = team.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.designation?.toLowerCase().includes(q);
    const matchDept = !deptFilter || m.department === deptFilter;
    const matchRole = !roleFilter || m.role === roleFilter;
    return matchSearch && matchDept && matchRole;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Name and email are required', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        email: form.email,
        designation: form.designation,
        department: form.department,
        joiningDate: form.joiningDate || undefined,
        type: form.role === 'HR' ? 'hr' : form.role === 'Intern' ? 'intern' : 'employee',
      };
      await api.post('/api/users', payload);
      addToast(`${form.name} added successfully`, 'success');
      setShowAdd(false);
      setForm(EMPTY_FORM);
      fetchTeam();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (s) => s === 'active' ? 'success' : s === 'on-leave' ? 'warning' : 'neutral';

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

  return (
    <div className="view active" id="view-hr-people">
      <div className="section-hdr" style={{ marginBottom: '16px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>People Directory</div>
          <div className="section-sub">{filtered.length} of {team.length} employees</div>
        </div>
        <Button variant="primary" size="sm" icon="user-plus" onClick={() => setShowAdd(true)}>Add Employee</Button>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '12px' }}></i>
          <input className="inp" placeholder="Search by name, email, role…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '30px' }} />
        </div>
        <select className="inp" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
          <option value="">All departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="inp" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto', minWidth: '130px' }}>
          <option value="">All roles</option>
          {['Founding Team', 'HR', 'Employee', 'Intern'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {(search || deptFilter || roleFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDeptFilter(''); setRoleFilter(''); }}>
            <i className="fas fa-xmark"></i> Clear
          </Button>
        )}
      </div>

      <div className="card">
        <table className="task-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Role</th>
              <th>Leave Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px' }}>No employees match your filters</td></tr>
            ) : filtered.map(member => (
              <tr key={member._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={member.avatar?.initials || member.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      bg={member.avatar?.bg} color={member.avatar?.color} size="sm" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '13px' }}>{member.designation || '—'}</td>
                <td style={{ fontSize: '13px' }}>{member.department || '—'}</td>
                <td><Badge variant="neutral">{member.role}</Badge></td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{member.leaveBalance?.available ?? '—'}</span>
                    <span style={{ color: 'var(--text3)' }}> / {member.leaveBalance?.total ?? '—'} days</span>
                  </div>
                </td>
                <td>
                  <Badge variant={statusVariant(member.status)}>{member.status || 'active'}</Badge>
                </td>
                <td>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/team/${member._id}`)}>View Profile</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); }} title="Add Employee" subtitle="New employee gets a default password: password123" maxWidth="480px">
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Full name *</label>
              <input className="inp" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Nair" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="inp" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@company.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input className="inp" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Backend Engineer" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="inp" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" list="dept-list" />
              <datalist id="dept-list">
                {departments.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="inp" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="Employee">Employee</option>
                <option value="Intern">Intern</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input className="inp" type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HRPeople;
