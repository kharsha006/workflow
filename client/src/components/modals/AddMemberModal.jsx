import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';

// HR add-member modal (mirrors prototype add-member-modal). Creates a real user.
const AddMemberModal = ({ isOpen, onClose, onAdded }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', role: '', email: '', dept: 'Engineering', type: 'employee', date: '', manager: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ name: '', role: '', email: '', dept: 'Engineering', type: 'employee', date: '', manager: '' });
  }, [isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) { addToast('Please enter name and email.', 'error'); return; }
    try {
      setSaving(true);
      await api.post('/api/users', {
        name: form.name, email: form.email, role: form.role, designation: form.role,
        department: form.dept, type: form.type, joiningDate: form.date, reportingManager: undefined,
      });
      addToast(`${form.name} added successfully to the team!`, 'success');
      onClose();
      onAdded && onAdded();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add member', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="460px" title="Add new member" subtitle="Add an employee, intern or HR staff">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group"><label className="form-label">Full name</label><input className="inp" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Jordan Blake" /></div>
        <div className="form-group"><label className="form-label">Role / Designation</label><input className="inp" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Backend Engineer" /></div>
        <div className="form-group"><label className="form-label">Email address</label><input className="inp" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jordan@company.com" /></div>
        <div className="form-group"><label className="form-label">Department</label>
          <select className="inp" value={form.dept} onChange={(e) => set('dept', e.target.value)}>
            <option>Engineering</option><option>Operations</option><option>AI Research</option><option>Product Dev</option><option>HR</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Member type</label>
          <select className="inp" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="employee">Employee</option><option value="intern">Intern</option><option value="hr">HR</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Joining date</label><input className="inp" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Reporting manager</label><input className="inp" value={form.manager} onChange={(e) => set('manager', e.target.value)} placeholder="e.g. Riya Kapoor" /></div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}><i className="fas fa-xmark"></i> Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={saving}><i className="fas fa-plus"></i> {saving ? 'Adding…' : 'Add member'}</Button>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
