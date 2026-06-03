import React from 'react';
import '../styles/features.css';

const Features = () => {
  const features = [
    { title: 'Case Tracking', desc: 'Real-time monitoring of forensic case lifecycles.' },
    { title: 'Evidence Repository', desc: 'Secure database for digital evidence metadata.' },
    { title: 'Data Analytics', desc: 'Insightful visualizations of laboratory performance.' },
    { title: 'Role Access', desc: 'Granular permissions for different lab personnel.' },
  ];

  return (
    <section className="features container">
      <h2 className="section-title">Core Modules</h2>
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card glass-card">
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
