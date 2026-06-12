import React from 'react';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{value}</div>
  </div>
);

// HR leave approval modal (mirrors prototype showLeaveModal / hrLeaveAction)
const LeaveApprovalModal = ({ isOpen, onClose, leave }) => {
  const { addToast } = useToast();
  if (!isOpen || !leave) return null;

  const act = (action) => {
    onClose();
    addToast(
      action === 'approve' ? 'Leave request approved and employee notified.' : 'Leave request rejected and employee notified.',
      action === 'approve' ? 'success' : 'error'
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px" title="Leave Request" subtitle={`${leave.name} · ${leave.type}`}>
      <div style={{ background: '#F9FAFB', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Field label="Employee" value={leave.name} />
          <Field label="Leave type" value={leave.type} />
          <Field label="Dates" value={leave.dates} />
          <Field label="Duration" value={leave.days} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Comment (optional)</label>
        <textarea className="inp" placeholder="Add a note for the employee…" style={{ height: '70px' }}></textarea>
      </div>
      <div className="modal-footer">
        <Button variant="danger" size="sm" onClick={() => act('reject')}><i className="fas fa-xmark"></i> Reject</Button>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={() => act('approve')} style={{ background: '#10B981', borderColor: '#10B981' }}><i className="fas fa-check"></i> Approve</Button>
      </div>
    </Modal>
  );
};

export default LeaveApprovalModal;
