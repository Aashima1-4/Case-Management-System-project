import React from 'react';
import '../styles/hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content container">
        <h1 className="hero-title">
          Cyber Forensic <span>Laboratory</span> Administration
        </h1>
        <p className="hero-subtitle">
          Secure, automated, and centralized management for forensic case tracking and digital evidence processing.
        </p>
        <div className="hero-stats">
          <div className="stat-card glass-card">
            <h3>500+</h3>
            <p>Cases Managed</p>
          </div>
          <div className="stat-card glass-card">
            <h3>99.9%</h3>
            <p>System Uptime</p>
          </div>
          <div className="stat-card glass-card">
            <h3>24/7</h3>
            <p>Active Support</p>
          </div>
        </div>
      </div>
      <div className="hero-glow"></div>
    </section>
  );
};

export default Hero;
