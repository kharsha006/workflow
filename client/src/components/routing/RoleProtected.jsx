import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Layout from '../layout/Layout';

// Home route for a given role. HR has its own dashboard tree under /hr,
// everyone else uses the shared /dashboard tree.
export const roleHome = (role) => (role === 'HR' ? '/hr' : '/dashboard');

// Guards a route tree: requires an authenticated user whose role is allowed.
// Renders the given shell (defaults to the founding Layout) when access is granted.
const RoleProtected = ({ allowedRoles, shell: Shell = Layout }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--brand)' }}></i>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Shell />;
};

export default RoleProtected;
