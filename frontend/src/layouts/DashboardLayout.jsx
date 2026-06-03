import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import { MENU_ITEMS } from '../utils/permissions';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const filteredMenu = MENU_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="dashboard-container">
      <aside className="sidebar glass-card">
        <div className="sidebar-header">
          <h2>CFL PKL</h2>
          <span className="role-badge">{user.role}</span>
        </div>
        <nav className="sidebar-nav">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar glass-card">
          <div className="user-info">
            <span>
              Welcome, <strong>{user.fullName || user.email}</strong>
            </span>
          </div>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
