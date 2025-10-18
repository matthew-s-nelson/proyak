import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSection: React.FC = () => {
  const { user, signOut } = useAuth();

  // Get user's name from metadata, or extract from email, or fallback to email
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Check if name is in user metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Extract name from email (part before @)
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailName
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'User';
  };

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