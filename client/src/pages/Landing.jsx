import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${encodeURIComponent(role)}`);
  };

  return (
    <div className="page active" id="page-landing">
      <div className="landing-logo-wrap">
        <div className="landing-logo-icon">W</div>
        <span className="landing-logo-text">WorkFlow</span>
      </div>
      <p className="landing-tagline">AI-powered workforce management platform</p>

      <div className="role-card-wrap">
        <div className="role-card" onClick={() => handleRoleSelect('Founding Team')}>
          <div className="role-icon-wrap" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <i className="fas fa-crown"></i>
          </div>
          <div>
            <div className="role-card-title">Founding Team</div>
            <div className="role-card-desc">Company-wide oversight, all projects and team analytics</div>
          </div>
          <div className="role-card-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect('Employee')}>
          <div className="role-icon-wrap" style={{ background: '#D1FAE5', color: '#065F46' }}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div>
            <div className="role-card-title">Employee</div>
            <div className="role-card-desc">My tasks, work logs and productivity tracking</div>
          </div>
          <div className="role-card-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect('Intern')}>
          <div className="role-icon-wrap" style={{ background: '#FEF3C7', color: '#92400E' }}>
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div>
            <div className="role-card-title">Intern</div>
            <div className="role-card-desc">Assigned projects, mentors and learning milestones</div>
          </div>
          <div className="role-card-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect('HR')}>
          <div className="role-icon-wrap" style={{ background: '#FCE7F3', color: '#9D174D' }}>
            <i className="fas fa-people-group"></i>
          </div>
          <div>
            <div className="role-card-title">HR</div>
            <div className="role-card-desc">People operations, hiring, compliance and policies</div>
          </div>
          <div className="role-card-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '36px' }}>
        © 2026 WorkFlow Inc. · All rights reserved
      </p>
    </div>
  );
};

export default Landing;
