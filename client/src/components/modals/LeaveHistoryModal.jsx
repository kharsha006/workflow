import React from 'react';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { HR_LEAVE_HISTORY } from '../../data/prototypeData';

// HR leave-history modal (mirrors prototype openLeaveHistoryModal)
const LeaveHistoryModal = ({ isOpen, onClose, name }) => {
  const { addToast } = useToast();
  if (!isOpen || !name) return null;

  const data = HR_LEAVE_HISTORY[name] || { total: 24, taken: 0, available: 24, history: [] };
  const pct = Math.round((data.taken / data.total) * 100);
  const history = data.history.filter((h) => h.type !== 'Annual leave');

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="500px" title={`${name} — Leave History`} subtitle="Sick & personal leave record · 2026">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827' }}>{data.total}</div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Total</div>
        </div>
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#991B1B' }}>{data.taken}</div>
          <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '2px' }}>Used</div>
        </div>
        <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#065F46' }}>{data.available}</div>
          <div style={{ fontSize: '11px', color: '#065F46', marginTop: '2px' }}>Remaining</div>
        </div>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
          <span>Leave used</span><span style={{ fontWeight: 600 }}>{pct}% used</span>
        </div>
        <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#EF4444', borderRadius: '3px', width: pct + '%', transition: 'width 0.4s ease' }}></div>
        </div>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '10px 0' }}>Leave history (sick & personal)</div>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#9CA3AF', fontSize: '13px' }}>No sick or personal leave taken this year.</div>
      ) : history.map((h, i) => {
        const sick = h.type === 'Sick leave';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', border: '1px solid #F3F4F6', borderRadius: '9px', marginBottom: '8px', background: '#fff' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', minWidth: '90px' }}>{h.date}</div>
            <span style={{ padding: '3px 10px', background: sick ? '#FEF3C7' : '#F5F3FF', color: sick ? '#92400E' : '#5B21B6', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{h.type}</span>
            <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#111827' }}>{h.days} day{h.days > 1 ? 's' : ''}</div>
            <span style={{ padding: '3px 10px', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>Approved</span>
          </div>
        );
      })}
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={() => addToast('Leave report exported.', 'success')}><i className="fas fa-download"></i> Export</Button>
      </div>
    </Modal>
  );
};

export default LeaveHistoryModal;
