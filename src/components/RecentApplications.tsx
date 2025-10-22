import React from 'react';
import { Users } from 'lucide-react';

export interface RecentApplication {
  id: string;
  status: string;
  applied_at: string;
  profiles: {
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
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
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
    </div>
  );
};

export default RecentApplications;
