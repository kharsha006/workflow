import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';

// Invite member modal (mirrors prototype invite-modal / sendInvite)
const InviteModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', role: '', project: '', access: 'Employee' });

  useEffect(() => {
    if (isOpen) setForm({ name: '', email: '', role: '', project: '', access: 'Employee' });
  }, [isOpen]);

  const send = () => {
    if (!form.name.trim() || !form.email.trim()) { addToast('Please enter name and email.', 'error'); return; }
    onClose();
    addToast(`Invite sent to ${form.name} (${form.email}) successfully!`, 'success');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px" title="Invite team member" subtitle="They'll receive an email invite to join WorkFlow">
      <div className="form-group">
        <label className="form-label">Full name</label>
        <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jordan Blake" />
      </div>
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input className="inp" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jordan@company.com" />
      </div>
      <div className="form-group">
        <label className="form-label">Role / designation</label>
        <input className="inp" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Backend Engineer" />
      </div>
      <div className="form-group">
        <label className="form-label">Assign to project</label>
        <select className="inp" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
          <option value="">— Select a project —</option>
          <option>Workday Project</option><option>AI Research</option><option>Product Development</option><option>Client Success</option><option>Internal Operations</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Access level</label>
        <select className="inp" value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })}>
          <option>Employee</option><option>Team Lead</option><option>Intern</option><option>HR</option>
        </select>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}><i className="fas fa-xmark"></i> Cancel</Button>
        <Button variant="primary" onClick={send}><i className="fas fa-envelope"></i> Send invite</Button>
      </div>
    </Modal>
  );
};

export default InviteModal;
