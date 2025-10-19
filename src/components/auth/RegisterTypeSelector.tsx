import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, UserPlus } from 'lucide-react';

const RegisterTypeSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            margin: '0 0 1rem 0'
          }}>
            Join Proyak
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.95,
            margin: 0
          }}>
            Choose how you'd like to get started
          </p>
        </div>

        {/* Registration Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Individual Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.3s, box-shadow 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={() => navigate('/register-individual')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <User size={40} color="white" />
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Job Seeker
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Looking for a job? Create your profile, showcase your skills, and get matched with opportunities that fit your experience.
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.875rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '250px'
            }}>
              Register as Job Seeker
            </button>
          </div>

          {/* Business Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.3s, box-shadow 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={() => navigate('/register-business')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <Building2 size={40} color="white" />
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              New Business
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Starting from scratch? Register your company first, then add recruiters who can post jobs and manage candidates.
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
              color: 'white',
              padding: '0.875rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '250px'
            }}>
              Register New Business
            </button>
          </div>

          {/* Recruiter Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.3s, box-shadow 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={() => navigate('/register-recruiter')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <UserPlus size={40} color="white" />
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Recruiter
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Your company already has an account? Create your recruiter profile and link it to your business to start hiring.
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              padding: '0.875rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '250px'
            }}>
              Register as Recruiter
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'white'
        }}>
          <p style={{
            fontSize: '1rem',
            opacity: 0.9
          }}>
            Already have an account?{' '}
            <a 
              href="/#/login" 
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                fontWeight: '600'
              }}
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterTypeSelector;