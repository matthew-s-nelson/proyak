import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SetupProfile: React.FC = () => {
  const { user } = useAuth();

  // Get user's name from metadata, or extract from email, or fallback to 'User'
  const getUserName = () => {
    if (!user) return 'User';
    
    // Check if name is in user metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Extract name from email (part before @)
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#666',
          margin: '0 0 1rem 0'
        }}>
          Hello {getUserName()}!
        </h2>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#333',
          margin: 0
        }}>
          Welcome to Proyak!
        </h1>
      </div>
    </div>
  );
};

export default SetupProfile;