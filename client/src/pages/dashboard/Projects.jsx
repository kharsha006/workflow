import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import NewProjectModal from '../../components/modals/NewProjectModal';

export const projectStatusVariant = (s) =>
  s === 'At risk' ? 'warning' : s === 'In progress' ? 'info' : 'success';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/projects');
      setProjects(data);
    } catch (error) {
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin"></i> Loading...</div>;
  }

  return (
    <div className="view active" id="view-projects">
      <div className="section-hdr" style={{ marginBottom: '20px' }}>
        <div>
          <div className="section-title" style={{ fontSize: '18px' }}>All projects</div>
          <div className="section-sub">{projects.length} active projects across teams</div>
        </div>
        <Button variant="primary" size="sm" icon="plus" onClick={() => setShowNew(true)}>New project</Button>
      </div>

      <div className="projects-grid">
        {projects.map((p) => (
          <div key={p._id} className="project-card" style={{ paddingLeft: '22px' }}
            onClick={() => navigate(`/dashboard/projects/${p._id}`)}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: p.barColor, borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)' }}></div>
            <div className="proj-icon" style={{ background: p.iconBg, color: p.iconColor }}>
              <i className={`fas ${p.icon}`}></i>
            </div>
            <div className="proj-name">{p.name}</div>
            <div className="proj-desc">{p.description}</div>
            <div className="proj-meta">
              <span>{p.members?.length || 0} members</span>
              <span className="proj-pct">{p.progress}%</span>
            </div>
            <div className="progress"><div className="progress-fill" style={{ width: p.progress + '%', background: p.barColor }}></div></div>
            <div className="proj-footer">
              <Badge variant={projectStatusVariant(p.status)}>{p.status}</Badge>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Due </span>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{p.dueDate}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <div className="av-stack">
                {p.members?.slice(0, 3).map((m) => (
                  <Avatar key={m._id} initials={m.avatar?.initials} bg={m.avatar?.bg} color={m.avatar?.color} size="sm" />
                ))}
                {p.members?.length > 3 && (
                  <Avatar initials={`+${p.members.length - 3}`} bg="var(--bg2)" color="var(--text2)" size="sm" />
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Updated {p.updated}</span>
            </div>
          </div>
        ))}
      </div>

      <NewProjectModal isOpen={showNew} onClose={() => setShowNew(false)} onCreated={fetchProjects} />
    </div>
  );
};

export default Projects;
