import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RecentApplications from './RecentApplications';
import type { RecentApplication } from './RecentApplications';

interface JobPosting {
  id: string;
  title: string;
  location: string;
  work_type: string;
  employment_type: string;
  status: string;
  created_at: string;
  description?: string;
}

const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJobAndApplications(jobId);
    }
  }, [jobId]);

  const loadJobAndApplications = async (jobId: string) => {
    try {
      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) {
        console.error('Error loading job:', jobError);
      } else {
        setJob(jobData);
      }

      // Load all applications for this job
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          job_postings!inner (
            title
          ),
          candidate_profiles (
            id,
            user_id
          )
        `)
        .eq('job_posting_id', jobId)
        .order('applied_at', { ascending: false });

      if (appsError) {
        console.error('Error loading applications:', appsError);
      } else {
        setApplications(appsData || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/recruiter-dashboard');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner">Loading applications...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Job not found</p>
        <button
          onClick={handleBackClick}
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
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'closed': return '#6b7280';
      case 'draft': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#059669',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            padding: '0.5rem 0'
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Job Details Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Briefcase size={32} />
                {job.title}
              </h1>
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                fontSize: '0.95rem',
                color: '#6b7280',
                flexWrap: 'wrap'
              }}>
                {job.location && <span>📍 {job.location}</span>}
                {job.work_type && <span style={{ textTransform: 'capitalize' }}>{job.work_type}</span>}
                {job.employment_type && <span style={{ textTransform: 'capitalize' }}>{job.employment_type}</span>}
                <span>
                  Posted {new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <span style={{
              padding: '0.5rem 1rem',
              backgroundColor: getStatusColor(job.status) + '20',
              color: getStatusColor(job.status),
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {job.status}
            </span>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Total Applications: {applications.length}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {applications.filter(app => app.status === 'pending').length} pending • {' '}
              {applications.filter(app => app.status === 'reviewing').length} reviewing • {' '}
              {applications.filter(app => app.status === 'accepted').length} accepted • {' '}
              {applications.filter(app => app.status === 'rejected').length} rejected
            </div>
          </div>
        </div>

        {/* Applications List */}
        <RecentApplications 
          applications={applications}
          title={`Applications for ${job.title}`}
        />
      </div>
    </div>
  );
};

export default JobApplicationsPage;
