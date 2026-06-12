import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';

// Single-employee "Assign task" modal (mirrors prototype task-modal / sendTask)
const AssignTaskModal = ({ isOpen, onClose, prefillEmail = '' }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', title: '', desc: '', priority: 'Medium', due: '' });

  useEffect(() => {
    if (isOpen) setForm({ email: prefillEmail, title: '', desc: '', priority: 'Medium', due: '' });
  }, [isOpen, prefillEmail]);

  const send = () => {
    if (!form.email || !form.title.trim()) { addToast('Please fill in email and task title.', 'error'); return; }
    onClose();
    addToast(`Task "${form.title}" sent to ${form.email} via email successfully.`, 'success');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign task" subtitle="Task will be sent via email to the employee">
      <div className="form-group">
        <label className="form-label">Employee email</label>
        <input className="inp" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="employee@company.com" />
      </div>
      <div className="form-group">
        <label className="form-label">Task title</label>
        <input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete API documentation" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="inp" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Task details, acceptance criteria, context…"></textarea>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="inp" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due date</label>
          <input className="inp" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Attachment (optional)</label>
        <input className="inp" type="file" style={{ padding: '7px 12px' }} />
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}><i className="fas fa-xmark"></i> Cancel</Button>
        <Button variant="primary" onClick={send}><i className="fas fa-paper-plane"></i> Send task</Button>
      </div>
    </Modal>
  );
};

export default AssignTaskModal;
