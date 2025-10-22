import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, DollarSign, Building2 } from 'lucide-react';
import FileUpload from './shared/FileUpload';

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
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  // Clear resume and cover letter when job changes
  useEffect(() => {
    setResumeFile(null);
    setCoverLetterFile(null);
  }, [job.id]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min/1000).toFixed(0)}k - $${(max/1000).toFixed(0)}k`;
    if (min) return `From $${(min/1000).toFixed(0)}k`;
    return `Up to $${(max!/1000).toFixed(0)}k`;
  };

  const handleApplyClick = async () => {
    if (!user) return;

    if (!resumeFile) {
      alert('Please upload your resume to apply');
      return;
    }

    try {
      // Upload resume to Supabase Storage
      const resumeFileName = `${user.id}/${job.id}/${Date.now()}_${resumeFile.name}`;
      const { data: resumeUploadData, error: resumeUploadError } = await supabase.storage
        .from('resumes')
        .upload(resumeFileName, resumeFile);

      if (resumeUploadError) throw resumeUploadError;

      // Upload cover letter if provided
      let coverLetterPath: string | null = null;
      if (coverLetterFile) {
        const coverLetterFileName = `${user.id}/${job.id}/${Date.now()}_${coverLetterFile.name}`;
        const { data: coverLetterUploadData, error: coverLetterUploadError } = await supabase.storage
          .from('cover-letters')
          .upload(coverLetterFileName, coverLetterFile);

        if (coverLetterUploadError) throw coverLetterUploadError;
        coverLetterPath = coverLetterUploadData.path;
      }

      // Get candidate profile ID
      const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
      if (candidateError) throw candidateError;
      
      // Create application with resume URL and optional cover letter URL
      const { error } = await supabase
        .from('applications')
        .insert({
          job_posting_id: job.id,
          applicant_id: user.id,
          candidate_id: candidateProfile.id,
          status: 'reviewing',
          resume_url: resumeUploadData.path,
          cover_letter_url: coverLetterPath
        });

      if (error) throw error;

      setResumeFile(null);
      setCoverLetterFile(null);
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

      {/* Resume Upload */}
      {!isApplied && (
        <FileUpload
          label="Upload Resume"
          description="Please upload your resume (PDF only, max 1MB)"
          file={resumeFile}
          onFileChange={setResumeFile}
          required
        />
      )}

      {/* Cover Letter Upload */}
      {!isApplied && (
        <FileUpload
          label="Upload Cover Letter"
          description="Add a cover letter to strengthen your application (PDF only, max 1MB)"
          file={coverLetterFile}
          onFileChange={setCoverLetterFile}
        />
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
