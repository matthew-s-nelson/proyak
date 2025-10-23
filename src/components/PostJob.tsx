import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Plus, CheckCircle } from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  work_type: string;
  employment_type: string;
  salary_min: string;
  salary_max: string;
  experience_level: string;
  required_skills: string[];
}

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    work_type: '',
    employment_type: '',
    salary_min: '',
    salary_max: '',
    experience_level: '',
    required_skills: []
  });

  // Get business_id on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('=== DEBUGGING POST JOB ACCESS ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);
      console.log('User metadata:', user.user_metadata);
      console.log('User type:', user.user_metadata?.user_type);

      try {
        // Try recruiter profile first
        console.log('\n--- Checking recruiter_profiles table ---');
        const { data: recruiterData, error: recruiterError } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .eq('user_id', user.id);

        console.log('Recruiter query result:', { recruiterData, recruiterError });

        if (recruiterError) {
          console.error('Recruiter query error:', recruiterError);
        }

        if (recruiterData && recruiterData.length > 0) {
          console.log('✓ Found recruiter profile!');
          console.log('Business ID from recruiter:', recruiterData[0].business_id);
          setBusinessId(recruiterData[0].business_id);
          return;
        }

        // If not a recruiter, try business profile
        console.log('\n--- Checking business_profiles table ---');
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id);

        console.log('Business query result:', { businessData, businessError });

        if (businessError) {
          console.error('Business query error:', businessError);
        }

        if (businessData && businessData.length > 0) {
          console.log('✓ Found business profile!');
          console.log('Business ID:', businessData[0].id);
          setBusinessId(businessData[0].id);
          return;
        }

        // Neither found - show detailed error
        console.error('\n❌ NO PROFILE FOUND');
        console.error('User is not in recruiter_profiles OR business_profiles tables');
        console.error('This could mean:');
        console.error('1. The profile was not created during registration');
        console.error('2. The user_id does not match');
        console.error('3. The tables do not exist or have different names');
        
        setError(`No business profile found for user. User type: ${user.user_metadata?.user_type || 'unknown'}. Check console for details.`);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('An error occurred while loading your profile');
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessId) {
      setError('Business ID not found. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('Submitting job with business_id:', businessId);
    console.log('Form data:', formData);

    try {
      const jobData = {
        business_id: businessId,
        created_by: user?.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        work_type: formData.work_type,
        employment_type: formData.employment_type,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills,
        status: 'active'
      };

      console.log('Prepared job data:', jobData);

      const { data, error: insertError } = await supabase
        .from('job_postings')
        .insert(jobData)
        .select()
        .single();

      console.log('Insert result:', { data, insertError });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      console.log('Job posted successfully:', data);
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        const userType = user?.user_metadata?.user_type;
        if (userType === 'business') {
          navigate('/business-dashboard', { replace: true });
          // Force a page reload to refresh the data
          window.location.reload();
        } else if (userType === 'recruiter') {
          navigate('/recruiter-dashboard', { replace: true });
          // Force a page reload to refresh the data
          window.location.reload();
        } else {
          navigate('/', { replace: true });
        }
      }, 1500); // Reduced from 2000 to 1500ms for faster redirect

    } catch (err: unknown) {
      console.error('Error posting job:', err);
      setError(err instanceof Error ? err.message : 'Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '2rem' }}>
            Job Posted Successfully!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Your job posting is now live and visible to candidates.
          </p>
          <div className="loading-spinner" style={{ margin: '0 auto' }}>
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  // Landing page (before showing form)
  if (!showForm) {
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
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '800px',
          width: '100%',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '3rem 2rem',
            textAlign: 'center'
          }}>
            <Briefcase size={64} style={{ margin: '0 auto 1rem' }} />
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 1rem 0'
            }}>
              Post a New Job
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: 0.95,
              margin: 0,
              lineHeight: '1.6'
            }}>
              Reach qualified candidates and grow your team with Proyak's talent network
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '3rem 2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem'
                }}>
                  ⚡
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  Quick & Easy
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Post jobs in minutes with our simple form
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem'
                }}>
                  🎯
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  Quality Matches
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Connect with verified, qualified candidates
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem'
                }}>
                  💰
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  Free to Post
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  No hidden fees or charges to post jobs
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '14px'
              }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>⚠️ Access Error</strong>
                {error}
                <details style={{ marginTop: '1rem', fontSize: '13px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                    Troubleshooting Information
                  </summary>
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.75rem',
                    backgroundColor: '#fef2f2',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    <div><strong>User ID:</strong> {user?.id}</div>
                    <div><strong>Email:</strong> {user?.email}</div>
                    <div><strong>User Type:</strong> {user?.user_metadata?.user_type || 'Not set'}</div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong>Next Steps:</strong>
                      <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                        <li>Check the browser console for detailed logs</li>
                        <li>Verify you registered as a business or recruiter</li>
                        <li>Check if your profile exists in the database</li>
                      </ol>
                    </div>
                  </div>
                </details>
              </div>
            )}

            <button
              onClick={() => setShowForm(true)}
              disabled={!businessId}
              style={{
                width: '100%',
                background: !businessId ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '1.25rem 2rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: !businessId ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: !businessId ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (businessId) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (businessId) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              <Plus size={24} />
              Create Job Posting
            </button>

            {!businessId && (
              <p style={{
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Loading your profile...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Job posting form
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Back button */}
        <button
          onClick={() => setShowForm(false)}
          style={{
            marginBottom: '1.5rem',
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Post a New Job
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280' }}>
            Fill out the details below to create a new job posting
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Job Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Senior Software Engineer"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe the role, responsibilities, and requirements..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Remote, San Francisco, CA"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Work Type & Employment Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Work Type *
              </label>
              <select
                name="work_type"
                value={formData.work_type}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select...</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Employment Type *
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select...</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Min Salary (USD)
              </label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="80000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Max Salary (USD)
              </label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="120000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Experience Level */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Experience Level *
            </label>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Select...</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior Level (6-10 years)</option>
              <option value="lead">Lead/Principal (10+ years)</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                padding: '0.875rem 1.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#374151'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.875rem 2rem',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Posting...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;