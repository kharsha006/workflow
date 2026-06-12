import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const NewProjectModal = ({ isOpen, onClose, onCreated }) => {
  const { addToast } = useToast();
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', dueDate: '', status: 'On track' });
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', description: '', dueDate: '', status: 'On track' });
      setSelected([]);
      api.get('/api/users').then(({ data }) => setPeople(data.filter((u) => u.role !== 'HR'))).catch(() => {});
    }
  }, [isOpen]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const create = async () => {
    if (!form.name.trim()) { addToast('Please enter a project name.', 'error'); return; }
    try {
      setSaving(true);
      await api.post('/api/projects', { ...form, members: selected });
      addToast(`Project "${form.name}" created successfully!`, 'success');
      onClose();
      onCreated && onCreated();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new project" subtitle="Add a new project to your workspace">
      <div className="form-group">
        <label className="form-label">Project name</label>
        <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q3 Growth Initiative" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="inp" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief project description" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Due date</label>
          <input className="inp" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="inp" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>On track</option><option>At risk</option><option>In progress</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Assign team members</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)' }}>
          {people.map((m) => {
            const on = selected.includes(m._id);
            return (
              <div key={m._id} onClick={() => toggle(m._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border)'}`, cursor: 'pointer', fontSize: '12px', background: on ? 'var(--brand-light)' : 'var(--surface)', color: on ? 'var(--brand)' : 'var(--text)' }}>
                <Avatar initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" style={{ width: '20px', height: '20px', fontSize: '9px' }} />
                <span>{m.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}><i className="fas fa-xmark"></i> Cancel</Button>
        <Button variant="primary" onClick={create} disabled={saving}><i className="fas fa-plus"></i> {saving ? 'Creating…' : 'Create project'}</Button>
      </div>
    </Modal>
  );
};

export default NewProjectModal;
