import React, { useState } from 'react';
import { Users } from 'lucide-react';
import ApplicationDetailsModal from './ApplicationDetailsModal';

export interface RecentApplication {
  id: string;
  status: string;
  applied_at: string;
  candidate_profiles: {
    id: string;
    user_id: string;
  };
  job_postings: {
    title: string;
  };
}

interface RecentApplicationsProps {
  applications: RecentApplication[];
  title?: string;
}

const RecentApplications: React.FC<RecentApplicationsProps> = ({
  applications,
  title = 'Recent Applications'
}) => {
  const [selectedApplication, setSelectedApplication] = useState<RecentApplication | null>(null);

  const handleApplicationClick = (app: RecentApplication) => {
    setSelectedApplication(app);
  };

  const closeModal = () => {
    setSelectedApplication(null);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1.5rem'
      }}>
        {title}
      </h2>

      {applications.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => handleApplicationClick(app)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div>
                <div style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  {app.job_postings?.title || 'Job Title'}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Applied {new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <span style={{
                padding: '0.375rem 0.875rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: '#6b7280'
        }}>
          <Users size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem' }}>
            No applications yet
          </p>
        </div>
      )}

      {/* Application Details Modal */}
      <ApplicationDetailsModal 
        application={selectedApplication}
        onClose={closeModal}
      />
    </div>
  );
};

export default RecentApplications;
