import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, DollarSign, Building2 } from 'lucide-react';

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

interface JobDetailsPanelProps {
  job: JobPosting;
  isApplied: boolean;
  isApplying: boolean;
  onApply: (jobId: string) => void;
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
  job,
  isApplied,
  isApplying,
  onApply
}) => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  // Clear resume when job changes
  useEffect(() => {
    setResumeFile(null);
    setUploadError('');
  }, [job.id]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min/1000).toFixed(0)}k - $${(max/1000).toFixed(0)}k`;
    if (min) return `From $${(min/1000).toFixed(0)}k`;
    return `Up to $${(max!/1000).toFixed(0)}k`;
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

  const handleApplyClick = async () => {
    if (!user) return;

    if (!resumeFile) {
      setUploadError('Please upload your resume to apply');
      return;
    }

    setUploadError('');

    try {
      // Upload resume to Supabase Storage
      const fileName = `${user.id}/${job.id}/${Date.now()}_${resumeFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);

      if (uploadError) throw uploadError;

      // Create application with resume URL
      const { error } = await supabase
        .from('applications')
        .insert({
          job_posting_id: job.id,
          applicant_id: user.id,
          status: 'reviewing',
          resume_url: uploadData.path
        });

      if (error) throw error;

      setResumeFile(null);
      onApply(job.id);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert('Failed to submit application');
    }
  };

  return (
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
          {job.title}
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
            {job.business_profiles?.company_name || 'Company'}
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {job.location && (
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
              <span>{job.location}</span>
            </div>
          )}
          {(job.salary_min || job.salary_max) && (
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
              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
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
          {job.description}
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
          {job.work_type && (
            <div>
              <span style={{ color: '#6b7280' }}>Work Type: </span>
              <span style={{ color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                {job.work_type}
              </span>
            </div>
          )}
          {job.employment_type && (
            <div>
              <span style={{ color: '#6b7280' }}>Employment: </span>
              <span style={{ color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                {job.employment_type}
              </span>
            </div>
          )}
          {job.experience_level && (
            <div>
              <span style={{ color: '#6b7280' }}>Experience: </span>
              <span style={{ color: '#1f2937', fontWeight: '600', textTransform: 'capitalize' }}>
                {job.experience_level}
              </span>
            </div>
          )}
          <div>
            <span style={{ color: '#6b7280' }}>Posted: </span>
            <span style={{ color: '#1f2937', fontWeight: '600' }}>
              {new Date(job.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Resume Upload Section */}
      {!isApplied && (
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
        onClick={handleApplyClick}
        disabled={isApplied || isApplying}
        style={{
          width: '100%',
          padding: '1rem',
          background: isApplied 
            ? '#d1d5db' 
            : isApplying
            ? '#9ca3af'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isApplied || isApplying 
            ? 'not-allowed' 
            : 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isApplied && !isApplying) {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isApplied && !isApplying) {
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isApplied 
          ? 'Already Applied' 
          : isApplying
          ? 'Submitting...'
          : 'Apply Now'}
      </button>
    </div>
  );
};

export default JobDetailsPanel;
