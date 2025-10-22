import React from 'react';
import { X } from 'lucide-react';
import type { RecentApplication } from './RecentApplications';

interface ApplicationDetailsModalProps {
  application: RecentApplication | null;
  onClose: () => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  onClose
}) => {
  if (!application) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={24} color="#6b7280" />
        </button>

        {/* Modal Content */}
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1.5rem',
          paddingRight: '2rem'
        }}>
          Application Details
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Job Title */}
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Job Title
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {application.job_postings?.title || 'N/A'}
            </div>
          </div>

          {/* Application ID */}
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Application ID
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#374151',
              fontFamily: 'monospace',
              backgroundColor: '#f3f4f6',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              {application.id}
            </div>
          </div>

          {/* Status */}
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Status
            </div>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {application.status}
            </span>
          </div>

          {/* Applied Date */}
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Applied Date
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#374151'
            }}>
              {new Date(application.applied_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {/* User ID */}
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Applicant ID
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#374151',
              fontFamily: 'monospace',
              backgroundColor: '#f3f4f6',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              {application.profiles?.user_id || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
