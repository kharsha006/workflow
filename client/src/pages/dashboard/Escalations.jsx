import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EscalateModal from '../../components/modals/EscalateModal';
import EscalationDetailModal from '../../components/modals/EscalationDetailModal';
import {
  ESC_PRI_CFG, ESC_PRI_RANK, ESC_STATUSES, ESC_STATUS_BADGE,
  escCounts, escTrend, escTimeAgo, isOpenEsc,
} from '../../data/escalations';

const Recent = ({ list, onOpen }) => {
  if (!list.length) return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: '13px' }}>No escalations yet.</div>;
  return list.slice(0, 5).map((e, i) => {
    const pc = ESC_PRI_CFG[e.priority] || ESC_PRI_CFG.medium;
    return (
      <div key={e._id} onClick={() => onOpen(e)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: i === Math.min(list.length, 5) - 1 ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}>
        <div className="esc-pri-dot" style={{ background: pc.dot }}></div>
        <Avatar initials={e.avatar?.initials} bg={e.avatar?.bg} color={e.avatar?.color} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="truncate" style={{ fontSize: '12px', fontWeight: 600 }}>{e.member}</div>
          <div className="truncate" style={{ fontSize: '11px', color: 'var(--text2)' }}>{e.category} · {e.project}</div>
        </div>
        <Badge variant={ESC_STATUS_BADGE[e.status] || 'neutral'} className="">{e.status}</Badge>
        <span style={{ fontSize: '10px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{escTimeAgo(e.createdAt)}</span>
      </div>
    );
  });
};

const Escalations = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const canManage = user?.role === 'Founding Team' || user?.role === 'HR';

  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRaise, setShowRaise] = useState(false);
  const [detail, setDetail] = useState(null);

  // filters
  const [fPri, setFPri] = useState('all');
  const [fStatus, setFStatus] = useState(location.state?.statusFilter || 'all');
  const [fEmp, setFEmp] = useState('all');
  const [fProj, setFProj] = useState('all');
  const [fDate, setFDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [q, setQ] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/api/escalations');
      setEscalations(data || []);
    } catch {
      addToast('Failed to load escalations', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // apply incoming quick-filter from overview navigation
  useEffect(() => {
    if (location.state?.priorityFilter) setFPri(location.state.priorityFilter);
    if (location.state?.statusFilter) setFStatus(location.state.statusFilter);
  }, [location.state]);

  const counts = escCounts(escalations);
  const trend = escTrend(escalations);
  const maxTrend = Math.max(1, ...trend.map((d) => d.count));
  const recent = useMemo(() => [...escalations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [escalations]);

  const employees = [...new Set(escalations.map((e) => e.member).filter(Boolean))].sort();
  const projects = [...new Set(escalations.map((e) => e.project).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    let list = escalations.filter((e) => {
      if (fPri !== 'all' && e.priority !== fPri) return false;
      if (fStatus !== 'all' && e.status !== fStatus) return false;
      if (fEmp !== 'all' && e.member !== fEmp) return false;
      if (fProj !== 'all' && e.project !== fProj) return false;
      if (fDate) {
        const d = new Date(e.createdAt);
        const ymd = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (ymd !== fDate) return false;
      }
      if (q) {
        const hay = `${e.member} ${e.category} ${e.project} ${e.task} ${e.description} ${e.escId} ${e.owner} ${e.status}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    list = list.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'priority') return (ESC_PRI_RANK[a.priority] - ESC_PRI_RANK[b.priority]) || (new Date(b.createdAt) - new Date(a.createdAt));
      if (sort === 'status') return ESC_STATUSES.indexOf(a.status) - ESC_STATUSES.indexOf(b.status) || (new Date(b.createdAt) - new Date(a.createdAt));
      return 0;
    });
    return list;
  }, [escalations, fPri, fStatus, fEmp, fProj, fDate, q, sort]);

  const applyUpdate = (updated) => {
    setEscalations((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
    setDetail((d) => (d && d._id === updated._id ? updated : d));
  };

  const resetFilters = () => { setFPri('all'); setFStatus('all'); setFEmp('all'); setFProj('all'); setFDate(''); setSort('newest'); setQ(''); };

  const inlineStatus = async (e, status) => {
    try {
      const { data } = await api.patch(`/api/escalations/${e._id}`, { status });
      applyUpdate(data);
      addToast(`Escalation ${e.escId} → ${status}`, 'success');
    } catch (err) {
      addToast('Failed to update', 'error');
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading escalations...</div>;

  const STAT_CARDS = [
    { label: 'Total open', value: counts.open, accent: 'var(--danger)', icon: 'fa-folder-open', sub: 'Awaiting resolution' },
    { label: 'Critical', value: counts.critical, accent: '#DC2626', icon: 'fa-fire', sub: 'Immediate action' },
    { label: 'In progress', value: counts.inprogress, accent: 'var(--warning)', icon: 'fa-spinner', sub: 'Being worked on' },
    { label: 'Resolved', value: counts.resolved, accent: 'var(--success)', icon: 'fa-circle-check', sub: 'Closed out' },
  ];

  return (
    <div className="view active" id="view-escalations">
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="section-title" style={{ fontSize: '18px' }}>Escalation Center</div>
            <Badge variant="danger">{counts.open} open</Badge>
          </div>
          <div className="section-sub">Every escalation raised across the workforce, in real time</div>
        </div>
        <button className="btn-escalate" onClick={() => setShowRaise(true)}><i className="fas fa-triangle-exclamation"></i> Raise escalation</button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        {STAT_CARDS.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-card-accent" style={{ background: c.accent }}></div>
            <div className="stat-label"><i className={`fas ${c.icon}`} style={{ color: c.accent }}></i> {c.label}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-delta delta-neutral">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: '16px', gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Escalation trend</div><Badge variant="neutral">Last 7 days</Badge></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '8px 0 0' }}>
            {trend.map((d, i) => (
              <div key={i} className="esc-trend-bar">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text2)' }}>{d.count}</div>
                <div className="esc-trend-col" style={{ height: Math.max(3, Math.round((d.count / maxTrend) * 100)) + 'px', background: d.count ? 'var(--danger)' : 'var(--border)' }} title={`${d.count} on ${d.label}`}></div>
                <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Recently raised</div></div>
          <Recent list={recent} onOpen={setDetail} />
        </div>
      </div>

      {/* Filter / search / sort */}
      <div className="card">
        <div className="esc-filter-bar">
          <div className="esc-search"><i className="fas fa-magnifying-glass" style={{ color: 'var(--text3)', fontSize: '12px' }}></i><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by member, task, project…" /></div>
          <select className="esc-select" value={fPri} onChange={(e) => setFPri(e.target.value)}>
            <option value="all">All priorities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <select className="esc-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="all">All statuses</option>{ESC_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="esc-select" value={fEmp} onChange={(e) => setFEmp(e.target.value)}>
            <option value="all">All employees</option>{employees.map((n) => <option key={n}>{n}</option>)}
          </select>
          <select className="esc-select" value={fProj} onChange={(e) => setFProj(e.target.value)}>
            <option value="all">All projects</option>{projects.map((n) => <option key={n}>{n}</option>)}
          </select>
          <input type="date" className="esc-select" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          <select className="esc-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Priority (high→low)</option><option value="status">Status</option>
          </select>
          <Button variant="secondary" size="sm" onClick={resetFilters}><i className="fas fa-rotate-left"></i> Reset</Button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '12px' }}>
          {filtered.length} escalation{filtered.length === 1 ? '' : 's'} shown · {escalations.length} total
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text3)', fontSize: '13px' }}>
            <i className="fas fa-circle-check" style={{ fontSize: '26px', display: 'block', marginBottom: '10px', color: 'var(--success)' }}></i>
            No escalations match these filters.
          </div>
        ) : filtered.map((e) => {
          const pc = ESC_PRI_CFG[e.priority] || ESC_PRI_CFG.medium;
          return (
            <div key={e._id} className="esc-row" onClick={() => setDetail(e)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Avatar initials={e.avatar?.initials} bg={e.avatar?.bg} color={e.avatar?.color} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <span className="esc-pri-dot" style={{ background: pc.dot }}></span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: pc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{pc.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{e.escId}</span>
                    <Badge variant={ESC_STATUS_BADGE[e.status] || 'neutral'} className="">{e.status}</Badge>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: 'auto' }}>⏱ {escTimeAgo(e.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{e.member} · {e.category}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}><i className="fas fa-folder" style={{ marginRight: '4px', color: 'var(--text3)' }}></i>{e.project} · {e.task}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.5, marginBottom: '10px' }}>{e.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }} onClick={(ev) => ev.stopPropagation()}>
                    <span style={{ fontSize: '11px', color: 'var(--text2)' }}><i className="fas fa-user" style={{ marginRight: '4px' }}></i>Owner: <strong>{e.owner}</strong></span>
                    {canManage && (
                      <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Status: <select className="esc-status-select" value={e.status} onChange={(ev) => inlineStatus(e, ev.target.value)}>{ESC_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                      </label>
                    )}
                    <button onClick={() => setDetail(e)} style={{ marginLeft: 'auto', padding: '4px 12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 500, color: 'var(--brand)' }}>View details <i className="fas fa-arrow-right" style={{ fontSize: '9px' }}></i></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EscalateModal isOpen={showRaise} onClose={() => setShowRaise(false)} onCreated={load} />
      <EscalationDetailModal isOpen={!!detail} onClose={() => setDetail(null)} escalation={detail} canManage={canManage} onUpdated={applyUpdate} />
    </div>
  );
};

export default Escalations;
