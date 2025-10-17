import React from 'react';

const SetupProfile: React.FC = () => {
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