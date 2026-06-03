import React, { useEffect, useState } from 'react';
import { storage } from '../utils/storage';

const Analytics = () => {
  const [byStatus, setByStatus] = useState({});
  const [byEvidence, setByEvidence] = useState({});

  useEffect(() => {
    const load = async () => {
      const { cases } = await storage.getCases({ limit: 500 });
      const statusCounts = {};
      const evidenceCounts = {};
      cases.forEach((c) => {
        const s = c.status || 'Registered';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
        const e = c.evidenceStatus || 'Not Started';
        evidenceCounts[e] = (evidenceCounts[e] || 0) + 1;
      });
      setByStatus(statusCounts);
      setByEvidence(evidenceCounts);
    };
    load();
  }, []);

  const renderChart = (title, data) => {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return (
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3>{title}</h3>
        <div
          className="chart-area"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem',
            height: '200px',
            marginTop: '2rem',
            borderBottom: '1px solid hsla(180, 100%, 50%, 0.2)',
          }}
        >
          {entries.map(([label, value]) => (
            <div
              key={label}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${(value / max) * 150}px`,
                  background: 'linear-gradient(to top, hsla(180, 100%, 50%, 0.1), hsl(var(--accent-cyan)))',
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {label} ({value})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Laboratory <span>Analytics</span></h2>
        <p>Visual overview of case distribution and operational efficiency.</p>
      </div>

      <div className="stats-grid" style={{ marginTop: '2rem' }}>
        {renderChart('Cases by Workflow Status', byStatus)}
        {renderChart('Cases by Evidence Status', byEvidence)}
      </div>
    </div>
  );
};

export default Analytics;
