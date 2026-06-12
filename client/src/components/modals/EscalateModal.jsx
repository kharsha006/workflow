import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ESC_CATEGORIES, PRIORITY_OPTIONS } from '../../data/escalations';

const PROJECTS = ['Workday Project', 'AI Research', 'Product Development', 'Client Success', 'Internal Operations'];

// Raise escalation modal (mirrors prototype openEscalateModal / submitEscalation)
const EscalateModal = ({ isOpen, onClose, onCreated, prefill }) => {
  const { addToast } = useToast();
  const localNow = () => {
    const n = new Date();
    n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
    return n.toISOString().slice(0, 16);
  };
  const blank = { member: '', project: PROJECTS[0], task: '', category: 'Deadline Risk', priority: 'medium', description: '', owner: 'Riya Kapoor', datetime: localNow() };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...blank,
        member: prefill?.member || '',
        task: prefill?.task || '',
        project: prefill?.project && PROJECTS.includes(prefill.project) ? prefill.project : PROJECTS[0],
        datetime: localNow(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prefill]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.member.trim() || !form.task.trim()) {
      addToast('Please fill in employee name and task.', 'error');
      return;
    }
    try {
      setSaving(true);
      const { data } = await api.post('/api/escalations', {
        member: form.member, project: form.project, task: form.task,
        category: form.category, priority: form.priority, description: form.description,
        owner: form.owner, createdAt: form.datetime ? new Date(form.datetime).toISOString() : undefined,
      });
      addToast(`Escalation ${data.escId} raised — Founding Team notified.`, 'success');
      onClose();
      onCreated && onCreated(data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to raise escalation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="520px" title="Raise Escalation" subtitle="Flag a blocker, risk or issue for immediate founder attention">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Employee / Intern name</label>
          <input className="inp" value={form.member} onChange={(e) => set('member', e.target.value)} placeholder="e.g. Priya Nair" />
        </div>
        <div className="form-group">
          <label className="form-label">Project name</label>
          <select className="inp" value={form.project} onChange={(e) => set('project', e.target.value)}>
            {PROJECTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Task name</label>
        <input className="inp" value={form.task} onChange={(e) => set('task', e.target.value)} placeholder="e.g. Invoice reconciliation overdue 2 days" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Escalation category</label>
          <select className="inp" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {ESC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="inp" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Escalation description</label>
        <textarea className="inp" style={{ height: '70px' }} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the blocker, risk or issue in detail…"></textarea>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label">Date &amp; time</label>
          <input className="inp" type="datetime-local" value={form.datetime} onChange={(e) => set('datetime', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Assigned to (owner)</label>
          <input className="inp" value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="e.g. Riya Kapoor" />
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <button className="btn-escalate" onClick={submit} disabled={saving}>
          <i className="fas fa-triangle-exclamation"></i> {saving ? 'Submitting…' : 'Submit escalation'}
        </button>
      </div>
    </Modal>
  );
};

export default EscalateModal;
