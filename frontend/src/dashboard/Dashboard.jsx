import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { ROLES } from '../utils/permissions';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [stats, setStats] = useState({ total: 0, pending: 0, reported: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const { cases } = await storage.getCases({ limit: 500 });
      setStats({
        total: cases.length,
        pending: cases.filter((c) => !c.isLACompleted || c.evidenceStatus === 'Under Examination').length,
        reported: cases.filter((c) => c.evidenceStatus === 'Reported' || c.evidenceStatus === 'Collected').length,
      });
    };
    loadStats();
  }, []);

  const quickActions = [
    { name: 'Track Case', path: '/case-tracking', roles: [ROLES.ADMIN, ROLES.SA, ROLES.SSA, ROLES.LA, ROLES.RECEIVING, ROLES.ADMINISTRATION] },
    { name: 'View My Allotted Cases', path: '/case-tracking?view=allotted', roles: [ROLES.SSO] },
    { name: 'Upload Evidence', path: '/upload', roles: [ROLES.ADMIN, ROLES.SA, ROLES.SSA, ROLES.SSO] },
    { name: 'View Analytics', path: '/analytics', roles: [ROLES.ADMIN, ROLES.ADMINISTRATION] },
  ];

  const allowedActions = quickActions.filter((action) => action.roles.includes(user?.role));

  const statCards = [
    { label: 'Total Cases', value: String(stats.total), color: 'var(--accent-cyan)' },
    { label: 'In Progress', value: String(stats.pending), color: '#ffcc00' },
    { label: 'Reported / Collected', value: String(stats.reported), color: '#00ff88' },
  ];

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card glass-card">
            <span className="stat-label">{stat.label}</span>
            <div className="stat-value-row">
              <h2 style={{ color: stat.color }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <section className="quick-actions glass-card">
          <h3>Quick <span>Actions</span></h3>
          <div className="actions-grid">
            {allowedActions.map((action, i) => (
              <button
                key={i}
                type="button"
                className="action-btn glass-card"
                onClick={() => navigate(action.path)}
              >
                {action.name}
              </button>
            ))}
          </div>
        </section>

        <section className="recent-activity glass-card">
          <h3>Your <span>Role</span></h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-info">
                <p>Signed in as <strong>{user?.role}</strong></p>
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
