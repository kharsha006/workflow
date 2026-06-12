import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmpCard from '../../components/common/EmpCard';
import ProjectTaskModal from '../../components/modals/ProjectTaskModal';
import { projectStatusVariant } from './Projects';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [leavesByUser, setLeavesByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [p, l] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get('/api/leaves').catch(() => ({ data: [] })),
        ]);
        setProject(p.data);
        const grouped = {};
        (l.data || []).forEach((lv) => {
          const eid = lv.employee?._id || lv.employee;
          (grouped[eid] = grouped[eid] || []).push(lv);
        });
        setLeavesByUser(grouped);
      } catch (err) {
        addToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading...</div>;
  if (!project) return <div style={{ padding: '24px' }}>Project not found</div>;

  const tasksCompleted = Math.round(project.progress * 0.5);
  const openTasks = Math.round((100 - project.progress) * 0.3);

  return (
    <div className="view active" id="view-project-detail">
      <button className="back-btn" onClick={() => navigate('/dashboard/projects')}>
        <i className="fas fa-arrow-left"></i> Back to projects
      </button>

      <div className="emp-profile-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: project.iconBg, color: project.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              <i className={`fas ${project.icon}`}></i>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '20px', fontWeight: 700 }}>{project.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '3px' }}>{project.description}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <Badge variant={projectStatusVariant(project.status)}>{project.status}</Badge>
                <Badge variant="neutral"><i className="fas fa-users" style={{ fontSize: '10px' }}></i> {project.members?.length} members</Badge>
                <Badge variant="neutral"><i className="fas fa-calendar" style={{ fontSize: '10px' }}></i> Due {project.dueDate}</Badge>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '32px', fontWeight: 800, color: 'var(--brand)' }}>{project.progress}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>complete</div>
            <div className="progress" style={{ width: '120px', marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: project.progress + '%', background: project.barColor }}></div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div className="emp-stat"><div className="emp-stat-val">{project.members?.length}</div><div className="emp-stat-lbl">Team members</div></div>
          <div className="emp-stat"><div className="emp-stat-val">{tasksCompleted}</div><div className="emp-stat-lbl">Tasks completed</div></div>
          <div className="emp-stat"><div className="emp-stat-val">{openTasks}</div><div className="emp-stat-lbl">Open tasks</div></div>
        </div>
      </div>

      <div className="section-hdr" style={{ marginBottom: '14px' }}>
        <div>
          <div className="section-title">Team members</div>
          <div className="section-sub">{project.members?.length || 0} members assigned</div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={() => setShowAssign(true)}>Assign task</Button>
      </div>

      <div className="emp-grid">
        {project.members?.map((m) => (
          <EmpCard key={m._id} member={m} leaves={leavesByUser[m._id]} onOpen={() => navigate(`/dashboard/team/${m._id}`)} />
        ))}
      </div>

      <ProjectTaskModal isOpen={showAssign} onClose={() => setShowAssign(false)} project={project} />
    </div>
  );
};

export default ProjectDetail;
