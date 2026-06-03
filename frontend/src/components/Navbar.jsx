import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../utils/auth';
import '../styles/navbar.css';

const Navbar = () => {
  const user = auth.getCurrentUser();

  return (
    <nav className="navbar glass-card">
      <div className="nav-container">
        <Link to="/" className="logo">
          CFL <span>ADMIN</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;