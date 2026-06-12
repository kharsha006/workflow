import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import EmpCard from '../../components/common/EmpCard';
import InviteModal from '../../components/modals/InviteModal';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [leavesByUser, setLeavesByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [u, l] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/leaves').catch(() => ({ data: [] })),
        ]);
        setMembers((u.data || []).filter((m) => m.role === 'Employee'));
        const grouped = {};
        (l.data || []).forEach((lv) => {
          const eid = lv.employee?._id || lv.employee;
          (grouped[eid] = grouped[eid] || []).push(lv);
        });
        setLeavesByUser(grouped);
      } catch (err) {
        addToast('Failed to load team', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading...</div>;

  return (
    <div className="view active" id="view-team">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>Team</div>
          <div className="section-sub">All members across projects</div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={() => setShowInvite(true)}>Invite member</Button>
      </div>

      <div className="emp-grid">
        {members.map((m) => (
          <EmpCard key={m._id} member={m} leaves={leavesByUser[m._id]} onOpen={() => navigate(`/dashboard/team/${m._id}`)} />
        ))}
      </div>

      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
};

export default Team;
