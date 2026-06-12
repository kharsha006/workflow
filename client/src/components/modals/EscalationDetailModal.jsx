import React from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { ESC_PRI_CFG, ESC_STATUSES, ESC_STATUS_BADGE, escFmt, escTimeAgo } from '../../data/escalations';

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ width: '120px', flexShrink: 0, fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: '13px', color: 'var(--text)', flex: 1 }}>{children}</div>
  </div>
);

// Escalation detail modal (mirrors prototype openEscDetail). Read-only for
// non-managers; Founding/HR can change status / resolve.
const EscalationDetailModal = ({ isOpen, onClose, escalation, canManage, onUpdated }) => {
  const { addToast } = useToast();
  if (!isOpen || !escalation) return null;

  const e = escalation;
  const pc = ESC_PRI_CFG[e.priority] || ESC_PRI_CFG.medium;
  const done = e.status === 'Resolved' || e.status === 'Closed';

  const update = async (status) => {
    try {
      const { data } = await api.patch(`/api/escalations/${e._id}`, { status });
      addToast(`Escalation ${e.escId} → ${status}`, 'success');
      onUpdated && onUpdated(data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="540px"
      title={<span>{e.member} <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 500 }}>{e.escId}</span></span>}
      subtitle={`${e.category} · raised ${escFmt(e.createdAt)}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: pc.bg, border: `1px solid ${pc.border}`, fontSize: '12px', fontWeight: 700, color: pc.color }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: pc.dot }}></span>{pc.label} priority
        </span>
        <Badge variant={ESC_STATUS_BADGE[e.status] || 'neutral'}>{e.status}</Badge>
        <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: 'auto' }}>⏱ {escTimeAgo(e.createdAt)}</span>
      </div>

      <Row label="Employee">{e.member}</Row>
      <Row label="Project">{e.project || '—'}</Row>
      <Row label="Task">{e.task}</Row>
      <Row label="Category">{e.category}</Row>
      <Row label="Owner">{e.owner}</Row>
      <Row label="Raised at">{escFmt(e.createdAt)}</Row>
      {e.attachment ? <Row label="Attachment"><i className="fas fa-paperclip" style={{ marginRight: '5px', color: 'var(--text3)' }}></i>{e.attachment}</Row> : null}

      <div style={{ padding: '12px 0 4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Description</div>
        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{e.description}</div>
      </div>

      {canManage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>Update status:</span>
          <select className="inp" style={{ maxWidth: '200px' }} value={e.status} onChange={(ev) => update(ev.target.value)}>
            {ESC_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {canManage && !done && (
          <button className="btn-escalate btn-outline" onClick={() => { update('Resolved'); }}>
            <i className="fas fa-circle-check"></i> Mark resolved
          </button>
        )}
      </div>
    </Modal>
  );
};

export default EscalationDetailModal;
