import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Presentational shell. Auth/role guarding is handled by RoleProtected,
// which only renders this once access has been granted.
const Layout = () => {
  return (
    <div className="page active" id="page-dashboard">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
