import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const UserDetailsModal = ({ isOpen, onClose, user, onApprove, onReject }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Account Registration">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar 
            initials={user.avatar?.initials || user.name.substring(0, 2).toUpperCase()} 
            bg={user.avatar?.bg || '#EEF2FF'} 
            color={user.avatar?.color || '#4F46E5'} 
            size="lg" 
          />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text1)' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text2)' }}>
              {user.email}
            </div>
          </div>
          <Badge variant="info" style={{ marginLeft: 'auto' }}>{user.role}</Badge>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</div>
            <div style={{ fontSize: '14px', color: 'var(--text1)', fontWeight: 500 }}>{user.mobileNumber || 'Not provided'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Date of Birth</div>
            <div style={{ fontSize: '14px', color: 'var(--text1)', fontWeight: 500 }}>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>PAN Card</div>
            <div style={{ fontSize: '14px', color: 'var(--text1)', fontWeight: 500, fontFamily: 'monospace' }}>{user.panDetails || 'Not provided'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Aadhar Card</div>
            <div style={{ fontSize: '14px', color: 'var(--text1)', fontWeight: 500, fontFamily: 'monospace' }}>{user.aadharCard || 'Not provided'}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => onReject(user._id)}>Reject Application</Button>
          <Button variant="primary" onClick={() => onApprove(user._id)}>Approve Account</Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
