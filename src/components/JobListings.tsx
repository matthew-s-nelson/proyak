import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, MapPin, DollarSign, Building2 } from 'lucide-react';
import JobDetailsPanel from './JobDetailsPanel';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  work_type: string;
  employment_type: string;
  salary_min: number;
  salary_max: number;
  experience_level: string;
  created_at: string;
  business_profiles: {
    company_name: string;
    industry: string;
  };
}

const JobListings: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadJobs();
    loadAppliedJobs();
  }, [user]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          business_profiles (
            company_name,
            industry
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('job_posting_id')
        .eq('applicant_id', user.id);

      if (error) throw error;
      
      const appliedIds = new Set(data?.map(app => app.job_posting_id) || []);
      setAppliedJobs(appliedIds);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  const handleApply = (jobId: string) => {
    setAppliedJobs(prev => new Set([...prev, jobId]));
    setApplying(null);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min/1000).toFixed(0)}k - $${(max/1000).toFixed(0)}k`;
    if (min) return `From $${(min/1000).toFixed(0)}k`;
    return `Up to $${(max!/1000).toFixed(0)}k`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div className="container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Available Jobs
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280'
          }}>
            Browse and apply to {jobs.length} open position{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Job Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedJob ? '1fr 1fr' : '1fr',
          gap: '2rem'
        }}>
          {/* Job List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: selectedJob?.id === job.id 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  border: selectedJob?.id === job.id 
                    ? '2px solid #667eea' 
                    : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedJob?.id !== job.id) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedJob?.id !== job.id) {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '0.5rem'
                    }}>
                      {job.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem'
                    }}>
                      <Building2 size={16} />
                      <span style={{ fontWeight: '600' }}>
                        {job.business_profiles?.company_name || 'Company'}
                      </span>
                      {job.business_profiles?.industry && (
                        <>
                          <span>•</span>
                          <span>{job.business_profiles.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {appliedJobs.has(job.id) && (
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Applied
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {job.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <DollarSign size={16} />
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </div>
                  )}
                  {job.work_type && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {job.work_type}
                    </span>
                  )}
                  {job.employment_type && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {job.employment_type}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center'
              }}>
                <Briefcase size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                  No jobs available at the moment
                </p>
              </div>
            )}
          </div>

          {/* Job Details Panel */}
          {selectedJob && (
            <JobDetailsPanel
              job={selectedJob}
              isApplied={appliedJobs.has(selectedJob.id)}
              isApplying={applying === selectedJob.id}
              onApply={handleApply}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;