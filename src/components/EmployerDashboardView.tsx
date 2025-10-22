import React from 'react';
import { Building2, Briefcase, Users, Clock } from 'lucide-react';
import RecentApplications from './RecentApplications';
import type { RecentApplication } from './RecentApplications';

export interface JobPosting {
  id: string;
  title: string;
  location: string;
  work_type: string;
  employment_type: string;
  status: string;
  created_at: string;
  _count?: {
    applications: number;
  };
}

interface EmployerDashboardViewProps {
  userName: string;
  companyName: string;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  jobPostings: JobPosting[];
  recentApplications: RecentApplication[];
  loading: boolean;
}

const EmployerDashboardView: React.FC<EmployerDashboardViewProps> = ({
  userName,
  companyName,
  totalJobs,
  activeJobs,
  totalApplications,
  jobPostings,
  recentApplications,
  loading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'closed': return '#6b7280';
      case 'draft': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {userName}!
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Building2 size={20} />
            {companyName}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Briefcase size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                  {totalJobs}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Total Jobs
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                  {activeJobs}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Active Jobs
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                  {totalApplications}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Recent Applications
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Postings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              Your Job Postings
            </h2>
            <a href="#/post-job" style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              padding: '0.625rem 1.25rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
              + Post New Job
            </a>
          </div>

          {jobPostings.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {jobPostings.map((job) => (
                <div
                  key={job.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    transition: 'box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {job.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        {job.location && <span>📍 {job.location}</span>}
                        {job.work_type && <span style={{ textTransform: 'capitalize' }}>{job.work_type}</span>}
                        {job.employment_type && <span style={{ textTransform: 'capitalize' }}>{job.employment_type}</span>}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      backgroundColor: getStatusColor(job.status) + '20',
                      color: getStatusColor(job.status),
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <span>
                      {job._count?.applications || 0} applications
                    </span>
                    <span>
                      Posted {new Date(job.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <Briefcase size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                No job postings yet
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Start by creating your first job posting
              </p>
              <button 
                onClick={() => window.location.hash = '/post-job'}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Post Your First Job
              </button>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <RecentApplications applications={recentApplications} />
      </div>
    </div>
  );
};

export default EmployerDashboardView;
