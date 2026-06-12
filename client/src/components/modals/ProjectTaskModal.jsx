import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

// Multi-member "Assign task to team" modal (mirrors prototype proj-task-modal)
const ProjectTaskModal = ({ isOpen, onClose, project }) => {
  const { addToast } = useToast();
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ title: '', desc: '', priority: 'Medium', due: '' });

  useEffect(() => {
    if (isOpen) { setSelected([]); setForm({ title: '', desc: '', priority: 'Medium', due: '' }); }
  }, [isOpen]);

  const members = project?.members || [];
  const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const send = () => {
    if (!form.title.trim()) { addToast('Please enter a task title.', 'error'); return; }
    if (selected.length === 0) { addToast('Please select at least one team member.', 'error'); return; }
    const names = members.filter((m) => selected.includes(m._id)).map((m) => m.name.split(' ')[0]);
    const label = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    onClose();
    addToast(`Task "${form.title}" assigned to ${label} and sent via email.`, 'success');
  };

  if (!isOpen) return null;

  const selectedNames = members.filter((m) => selected.includes(m._id)).map((m) => m.name.split(' ')[0]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="520px" title="Assign task to team" subtitle={`${project?.name || ''} · select one or more members`}>
      <div style={{ marginBottom: '18px' }}>
        <div className="form-label" style={{ marginBottom: '10px' }}>Assign to</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {members.map((m) => {
            const on = selected.includes(m._id);
            return (
              <div key={m._id} onClick={() => toggle(m._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: 'var(--radius)', border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border)'}`, cursor: 'pointer', background: on ? 'var(--brand-light)' : 'var(--surface)', userSelect: 'none' }}>
                <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{m.designation || m.role}</div>
                </div>
                {on && <i className="fas fa-circle-check" style={{ marginLeft: '6px', fontSize: '14px', color: 'var(--brand)' }}></i>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Task title</label>
        <input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete sprint review doc" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="inp" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Task details, deliverables, context…"></textarea>
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
      {selectedNames.length > 0 && (
        <div style={{ background: 'var(--brand-light)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '13px', color: 'var(--brand)', marginBottom: '4px' }}>
          <i className="fas fa-users" style={{ marginRight: '6px' }}></i>Assigning to: <strong>{selectedNames.join(', ')}</strong>
        </div>
      )}
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}><i className="fas fa-xmark"></i> Cancel</Button>
        <Button variant="primary" onClick={send}><i className="fas fa-paper-plane"></i> Send task</Button>
      </div>
    </Modal>
  );
};

export default ProjectTaskModal;
