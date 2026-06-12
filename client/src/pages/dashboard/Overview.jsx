import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmployeeOverview from '../employee/EmployeeOverview';
import EscalateModal from '../../components/modals/EscalateModal';
import EscalationDetailModal from '../../components/modals/EscalationDetailModal';

const Overview = () => {
  const { user } = useAuth();

  if (user?.role === 'Employee' || user?.role === 'Intern') {
    return <EmployeeOverview />;
  }
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [showRaise, setShowRaise] = useState(false);
  const [escDetail, setEscDetail] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => { fetchMeta(); loadEsc(); fetchAttendance(); fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/api/leaves');
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) { /* ignore */ }
  };

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/api/attendance?date=${today}`);
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) { /* ignore */ }
  };

  const fetchMeta = async () => {
    try {
      const [p, u] = await Promise.all([
        api.get('/api/projects').catch(() => ({ data: [] })),
        api.get('/api/users').catch(() => ({ data: [] })),
      ]);
      setProjects(p.data || []);
      setPeople(u.data || []);
    } catch (err) { /* ignore */ }
  };

  const loadEsc = async () => {
    try {
      const { data } = await api.get('/api/escalations');
      setEscalations(data || []);
    } catch (err) { /* ignore */ }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const approvedLeavesToday = leaves.filter(l => 
    l.status === 'Approved' && 
    l.startDate <= todayStr && 
    l.endDate >= todayStr
  );

  const onLeaveIds = new Set(approvedLeavesToday.map(l => (l.employee?._id || l.employee).toString()));
  const presentEmployees = people.filter(p => !onLeaveIds.has(p._id.toString()));

  const teamInsights = [
    { team: "Frontend Team", summary: "Made excellent progress on the new Dashboard UI. All critical bugs resolved." },
    { team: "Backend Team", summary: "Database schema updated for attendance module. API optimization in progress." },
    { team: "Design Team", summary: "Finalized the new mobile app wireframes. Pending review from stakeholders." }
  ];

  return (
    <div className="view active" id="view-overview">
      {/* Greeting */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
            Good morning, {user?.name?.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}{people.length} people · {projects.length} active projects
          </div>
        </div>
        <button className="btn-escalate btn-sm" onClick={() => setShowRaise(true)}>
          <i className="fas fa-triangle-exclamation"></i> Raise escalation
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="stat-card" onClick={() => navigate('/dashboard/projects')} style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--brand)' }}></div>
          <div className="stat-label">
            <i className="fas fa-folder" style={{ color: 'var(--brand)' }}></i> Active projects
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-delta delta-up"><i className="fas fa-arrow-trend-up"></i> +1 this month</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/dashboard/team')} style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--success)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <div className="stat-card-accent" style={{ background: 'var(--success)' }}></div>
          <div className="stat-label">
            <i className="fas fa-users" style={{ color: 'var(--success)' }}></i> Team members
            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text3)' }}></i>
          </div>
          <div className="stat-value">{people.length}</div>
          <div className="stat-delta delta-neutral">across all projects</div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-hdr" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontSize: '16px' }}>Today's Attendance</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '10px' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i> Coming ({presentEmployees.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {presentEmployees.map(emp => (
                <div key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '6px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <Avatar initials={emp.avatar?.initials} bg={emp.avatar?.bg} size="sm" />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{emp.name}</span>
                </div>
              ))}
              {presentEmployees.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>No data</span>}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '10px' }}>
              <i className="fas fa-plane-departure" style={{ marginRight: '6px' }}></i> On Leave / WFH ({approvedLeavesToday.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {approvedLeavesToday.map(leave => (
                <div key={leave._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '6px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} title={leave.type}>
                  <Avatar initials={leave.employee?.avatar?.initials} bg={leave.employee?.avatar?.bg} size="sm" />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{leave.employee?.name}</span>
                  <Badge variant={leave.type === 'Work from Home' ? 'info' : 'danger'}>{leave.type === 'Work from Home' ? 'WFH' : 'Leave'}</Badge>
                </div>
              ))}
              {approvedLeavesToday.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>No data</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 6PM AI Insights */}
      <div className="card" style={{ marginBottom: '24px', borderTop: '3px solid var(--brand)' }}>
        <div className="section-hdr" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-wand-magic-sparkles" style={{ color: 'var(--brand)' }}></i>
            <div className="section-title" style={{ fontSize: '16px' }}>6PM AI Insights</div>
            <Badge variant="brand">Daily Summary</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teamInsights.map((insight, idx) => (
            <div key={idx} style={{ background: 'var(--bg)', padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text1)', marginBottom: '4px' }}>{insight.team}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>{insight.summary}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard additions: Inventory & Projects */}
      <div className="two-col" style={{ marginBottom: '24px', gridTemplateColumns: '1fr 1fr', gap: '24px', display: 'grid' }}>
        
        {/* Active Projects */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '15px' }}><i className="fas fa-folder-open" style={{ color: 'var(--brand)', marginRight: '8px' }}></i>Active Projects</div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/projects')}>View All</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.slice(0, 4).map(p => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: p.iconBg || 'var(--bg)', color: p.iconColor || 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                  <i className={`fas ${p.icon || 'fa-folder'}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text1)' }} className="truncate">{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Due: {p.dueDate || 'N/A'}</div>
                </div>
                <Badge variant={p.status === 'At risk' ? 'danger' : p.status === 'On track' ? 'success' : 'info'}>{p.status}</Badge>
              </div>
            ))}
            {projects.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>No active projects</div>}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="card">
          <div className="section-hdr" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '15px' }}><i className="fas fa-boxes-stacked" style={{ color: 'var(--warning)', marginRight: '8px' }}></i>Inventory Overview</div>
            <Badge variant="warning">6 Assets</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>3</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>Assigned</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--brand)' }}>2</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>Available</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-wrench" style={{ color: '#DC2626' }}></i>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B' }}>In Repair</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>1 item</span>
          </div>
        </div>

      </div>

      <EscalateModal isOpen={showRaise} onClose={() => setShowRaise(false)} onCreated={loadEsc} />
      <EscalationDetailModal
        isOpen={!!escDetail}
        onClose={() => setEscDetail(null)}
        escalation={escDetail}
        canManage={user?.role === 'Founding Team' || user?.role === 'HR'}
        onUpdated={(u) => { setEscalations((prev) => prev.map((e) => (e._id === u._id ? u : e))); setEscDetail(u); }}
      />
    </div>
  );
};

export default Overview;
