import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, MapPin, DollarSign, Building2 } from 'lucide-react';

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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    loadJobs();
    loadAppliedJobs();
  }, [user]);

  // Clear resume when job selection changes
  useEffect(() => {
    setResumeFile(null);
    setUploadError('');
  }, [selectedJob]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (!file) {
      setResumeFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      setResumeFile(null);
      return;
    }

    // Validate file size (e.g., max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 1MB');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;

    if (!resumeFile) {
      setUploadError('Please upload your resume to apply');
      return;
    }
    
    setApplying(jobId);
    setUploadError('');
    
    try {
      // Upload resume to Supabase Storage
      const fileName = `${user.id}/${jobId}/${Date.now()}_${resumeFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);

      if (uploadError) throw uploadError;

      // Create application with resume URL
      const { error } = await supabase
        .from('applications')
        .insert({
          job_posting_id: jobId,
          applicant_id: user.id,
          status: 'reviewing',
          resume_url: uploadData.path
        });

      if (error) throw error;

      // Update applied jobs list
      setAppliedJobs(prev => new Set([...prev, jobId]));
      setResumeFile(null);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert('Failed to submit application');
    } finally {
      setApplying(null);
    }
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
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '2rem',
              maxHeight: 'calc(100vh - 4rem)',
              overflowY: 'auto'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  {selectedJob.title}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#6b7280',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}>
                  <Building2 size={18} />
                  <span style={{ fontWeight: '600' }}>
                    {selectedJob.business_profiles?.company_name || 'Company'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  {selectedJob.location && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <MapPin size={16} />
                      <span>{selectedJob.location}</span>
                    </div>
                  )}
                  {(selectedJob.salary_min || selectedJob.salary_max) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <DollarSign size={16} />
                      <span>{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Job Description
                </h3>
                <p style={{
                  color: '#4b5563',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedJob.description}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Job Details
                </h3>
                <div style={{
                  display: 'grid',
                  gap: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  {selectedJob.work_type && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Work Type: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedJob.work_type}
                      </span>
                    </div>
                  )}
                  {selectedJob.employment_type && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Employment: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedJob.employment_type}
                      </span>
                    </div>
                  )}
                  {selectedJob.experience_level && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Experience: </span>
                      <span style={{ color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedJob.experience_level}
                      </span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#6b7280' }}>Posted: </span>
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>
                      {new Date(selectedJob.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resume Upload Section */}
              {!appliedJobs.has(selectedJob.id) && (
                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>
                    Upload Resume
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '1rem'
                  }}>
                    Please upload your resume (PDF only, max 1MB)
                  </p>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        backgroundColor: '#f9fafb',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                    />
                    {resumeFile && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>
                          ✓ {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setResumeFile(null);
                            setUploadError('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16a34a',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            padding: '0 0.5rem'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {uploadError && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#dc2626'
                      }}>
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <button
                onClick={() => handleApply(selectedJob.id)}
                disabled={appliedJobs.has(selectedJob.id) || applying === selectedJob.id}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: appliedJobs.has(selectedJob.id) 
                    ? '#d1d5db' 
                    : applying === selectedJob.id
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: appliedJobs.has(selectedJob.id) || applying === selectedJob.id 
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!appliedJobs.has(selectedJob.id) && applying !== selectedJob.id) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!appliedJobs.has(selectedJob.id) && applying !== selectedJob.id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {appliedJobs.has(selectedJob.id) 
                  ? 'Already Applied' 
                  : applying === selectedJob.id
                  ? 'Submitting...'
                  : 'Apply Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;