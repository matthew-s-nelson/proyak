import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSection: React.FC = () => {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="auth-section" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button onClick={signOut} className="cta-button" style={{
          background: '#dc2626',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background 0.3s'
        }}>
          Sign Out
        </button>
      </div>
    );
  }

  return <NavLink to="/login" className="cta-button">Login</NavLink>;
};

export default AuthSection;