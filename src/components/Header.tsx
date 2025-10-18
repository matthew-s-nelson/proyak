import React from 'react';
import { NavLink } from 'react-router-dom'
import logoImage from '/logo.png';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <nav className="container">
        <NavLink to="/" className="logo">
          <img src={logoImage} alt="Proyak Logo" />
        </NavLink>
        <ul className="nav-links">
          <li><NavLink to="/features">Features</NavLink></li>
          <li><NavLink to="/how-it-works">How It Works</NavLink></li>
          {user && (
            <>
              <li><NavLink to="/employer">Employer Dashboard</NavLink></li>
              <li><NavLink to="/candidates">Candidates</NavLink></li>
            </>
          )}
          {!user && (
            <>
              <li><NavLink to="/login">Login</NavLink></li>
              <li><NavLink to="/register">Register</NavLink></li>
            </>
          )}
          <li><NavLink to="/testing">Vector Testing</NavLink></li>
        </ul>
        {user ? (
          <div className="auth-section">
            <span>Welcome, {user.email}</span>
            <button onClick={signOut} className="cta-button">Sign Out</button>
          </div>
        ) : (
          <NavLink to="/login" className="cta-button">Login</NavLink>
        )}
      </nav>
    </header>
  );
};

export default Header;
