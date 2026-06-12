import React, { useState } from 'react';
import Avatar from './Avatar';
import Badge from './Badge';
import { LEAVE_DATA, keyFromInitials } from '../../data/prototypeData';

// Maps a member's work status to a badge variant (mirrors prototype statusClass)
const statusVariant = (s) => {
  if (s === 'Overdue task') return 'danger';
  if (s === 'Blocked') return 'warning';
  if (s === 'In review') return 'info';
  return 'success';
};

/**
 * Employee card used on Team and Project Detail screens.
 * Matches the prototype's buildEmpCard, including the collapsible
 * "Leave summary" toggle.
 *
 *  - member: User doc (name, designation, department, avatar, workStats,
 *            workStatus, leaveBalance, upcomingLeave, status)
 *  - leaves: that member's leave requests (for the history list)
 *  - onOpen: callback when the card header is clicked
 */
const EmpCard = ({ member, onOpen }) => {
  const [open, setOpen] = useState(false);
  const lv = member.leaveBalance || { total: 24, taken: 0, available: 24 };
  const isOnLeave = member.status === 'on-leave';

  const availColor = isOnLeave ? 'var(--danger)' : 'var(--success)';
  const availBg = isOnLeave ? 'var(--danger-bg)' : 'var(--success-bg)';
  const availText = isOnLeave ? 'On Leave Today' : 'Available Today';
  const availIcon = isOnLeave ? 'fa-umbrella-beach' : 'fa-circle-check';

  // Per-member leave history from the prototype dataset; sick & personal only
  // (annual leave is excluded in the card, matching the prototype).
  const key = keyFromInitials(member.avatar?.initials);
  const history = (LEAVE_DATA[key] || []).filter((h) => h.type !== 'Annual leave');

  return (
    <div className="emp-card" style={{ cursor: 'default' }}>
      <div className="emp-card-top" onClick={onOpen} style={{ cursor: 'pointer' }}>
        <Avatar initials={member.avatar?.initials} bg={member.avatar?.bg} color={member.avatar?.color} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="emp-card-name truncate">{member.name}</div>
          <div className="emp-card-role">{member.designation}</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '1px' }}>{member.department}</div>
        </div>
      </div>

      <div className="emp-card-stats" style={{ marginBottom: '10px' }}>
        <div className="emp-stat"><div className="emp-stat-val">{member.workStats?.activeTasks ?? 0}</div><div className="emp-stat-lbl">Active tasks</div></div>
        <div className="emp-stat"><div className="emp-stat-val">{member.workStats?.completed ?? 0}</div><div className="emp-stat-lbl">Completed</div></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        {member.workStatus && <Badge variant={statusVariant(member.workStatus)}>{member.workStatus}</Badge>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '20px', background: availBg, fontSize: '11px', fontWeight: 600, color: availColor }}>
          <i className={`fas ${availIcon}`} style={{ fontSize: '10px' }}></i> {availText}
        </div>
      </div>

      {/* Leave summary toggle */}
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '7px 10px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 500, color: 'var(--text2)', border: '1px solid var(--border)' }}>
        <span><i className="fas fa-calendar-days" style={{ marginRight: '6px', color: 'var(--brand)' }}></i>Leave summary</span>
        <i className={`fas fa-chevron-down chevron-toggle ${open ? 'open' : ''}`} style={{ fontSize: '10px' }}></i>
      </div>

      {open && (
        <div style={{ marginTop: '8px', animation: 'fadeIn 0.15s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '10px' }}>
            <div style={{ background: 'var(--bg)', borderRadius: '7px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{lv.total}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 500 }}>Total</div>
            </div>
            <div style={{ background: 'var(--danger-bg)', borderRadius: '7px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger-text)' }}>{lv.taken}</div>
              <div style={{ fontSize: '10px', color: 'var(--danger-text)', fontWeight: 500 }}>Used</div>
            </div>
            <div style={{ background: 'var(--success-bg)', borderRadius: '7px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success-text)' }}>{lv.available}</div>
              <div style={{ fontSize: '10px', color: 'var(--success-text)', fontWeight: 500 }}>Left</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '8px' }}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--brand)', marginTop: '1px' }}></i>
            <span><strong style={{ color: 'var(--text)' }}>Upcoming:</strong> {member.upcomingLeave || 'None scheduled'}</span>
          </div>
          {history.length ? (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', fontSize: '11px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ minWidth: '60px', color: 'var(--text2)' }}>{h.date}</span>
                  <span style={{ flex: 1, color: 'var(--text)' }}>{h.type}</span>
                  <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>{h.days}d</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--text3)', padding: '4px 0' }}>No sick or personal leave history.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmpCard;
