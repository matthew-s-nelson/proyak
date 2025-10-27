import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Briefcase, Building2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateDetailsModal from './CandidateDetailsModal';

interface CandidateProfile {
  id: string;
  user_id: string;
  bio: string | null;
  location: string | null;
  work_type: number;
  employment_type: number;
  created_at: string;
  specialties: {
    id: number;
    name: string;
  } | null;
}

interface BusinessProfile {
  id: string;
  company_name: string;
  location: string | null;
  industry: string | null;
}

interface JobPosting {
  id: string;
  title: string;
  location: string;
  work_type: string;
  employment_type: string;
  status: string;
  created_at: string;
  salary_min: number | null;
  salary_max: number | null;
}

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== LOADING BUSINESS DASHBOARD ===');
      console.log('User ID:', user?.id);

      // Load business profile
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      console.log('Business profile query:', { businessData, businessError });

      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error loading business profile:', businessError);
        setError('Failed to load business profile');
      } else if (businessData) {
        setBusinessProfile(businessData);
        console.log('✓ Business profile loaded:', businessData);

        // Load job postings for this business
        console.log('\n--- Loading job postings ---');
        console.log('Business ID:', businessData.id);
        
        const { data: jobsData, error: jobsError } = await supabase
          .from('job_postings')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        console.log('Jobs query result:', { jobsData, jobsError });

        if (jobsError) {
          console.error('❌ Error loading jobs:', jobsError);
          setError(`Failed to load jobs: ${jobsError.message}`);
        } else {
          console.log(`✓ Loaded ${jobsData?.length || 0} jobs`);
          setJobPostings(jobsData || []);
        }
      }

      // Load candidate profiles
      console.log('\n--- Loading candidates ---');
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidate_profiles')
        .select(`
          *,
          specialties (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      console.log('Candidates query result:', { candidatesData, candidatesError });

      if (candidatesError) {
        console.error('Error loading candidates:', candidatesError);
      } else {
        console.log(`✓ Loaded ${candidatesData?.length || 0} candidates`);
        setCandidates(candidatesData || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = (workType: number) => {
    switch (workType) {
      case 0: return 'Remote';
      case 1: return 'On-site';
      case 2: return 'Hybrid';
      default: return 'Not specified';
    }
  };

  const getEmploymentTypeLabel = (employmentType: number) => {
    switch (employmentType) {
      case 0: return 'Full-time';
      case 1: return 'Part-time';
      default: return 'Not specified';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'closed': return '#6b7280';
      case 'draft': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleCandidateClick = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
  };

  const handleContactCandidate = async (candidateId: string) => {
    try {
      // Fetch the candidate details to get their email
      const { data, error } = await supabase.functions.invoke('get-candidate-details', {
        body: {
          candidate_profile_id: candidateId
        }
      });

      if (error) {
        console.error('Error fetching candidate details:', error);
        alert('Unable to fetch candidate contact information');
        return;
      }

      if (data && data.user && data.user.email) {
        // Open default email client with candidate's email
        window.location.href = `mailto:${data.user.email}`;
      } else {
        alert('Email address not available for this candidate');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Unable to contact candidate');
    }
  };

  const closeCandidateModal = () => {
    setSelectedCandidateId(null);
  };

  if (loading) {
    return (
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner">Loading your dashboard...</div>
      </section>
    );
  }

  const companyName = businessProfile?.company_name || user?.user_metadata?.company_name || 'Your Company';

  return (
    <section style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Business Dashboard
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            <Building2 size={20} />
            <span>{companyName}</span>
          </div>
        </header>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #fecaca'
          }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Check the browser console for more details.
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#667eea'
            }}>
              {jobPostings.length}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              Total Job Postings
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#22c55e'
            }}>
              {jobPostings.filter(j => j.status === 'active').length}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              Active Jobs
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#3b82f6'
            }}>
              {candidates.length}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              Available Candidates
            </div>
          </div>
        </div>

        {/* Job Postings Section */}
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
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              Your Job Postings
            </h3>
            <button
              onClick={() => navigate('/post-job')}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                padding: '0.625rem 1.25rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={18} />
              Post New Job
            </button>
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
                  onClick={() => window.location.hash = `/job-applications/${job.id}`}
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
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {job.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        flexWrap: 'wrap'
                      }}>
                        {job.location && <span>📍 {job.location}</span>}
                        {job.work_type && (
                          <span style={{ textTransform: 'capitalize' }}>{job.work_type}</span>
                        )}
                        {job.employment_type && (
                          <span style={{ textTransform: 'capitalize' }}>{job.employment_type}</span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      backgroundColor: getStatusColor(job.status) + '20',
                      color: getStatusColor(job.status),
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
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
                      Posted {new Date(job.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {(job.salary_min || job.salary_max) && (
                      <span>
                        ${job.salary_min ? (job.salary_min/1000).toFixed(0) : '?'}k - 
                        ${job.salary_max ? (job.salary_max/1000).toFixed(0) : '?'}k
                      </span>
                    )}
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
              <p style={{
                fontSize: '1.125rem',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                No job postings yet
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Start by creating your first job posting to find qualified candidates
              </p>
              <button
                onClick={() => navigate('/post-job')}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Plus size={18} />
                Post Your First Job
              </button>
            </div>
          )}
        </div>

        {/* Candidates Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              Recent Candidates
            </h3>
            <a
              href="/#/candidates"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              View All →
            </a>
          </div>

          {candidates.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <User size={24} color="white" />
                  </div>

                  {candidate.specialties && (
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem'
                    }}>
                      {candidate.specialties.name}
                    </div>
                  )}

                  {candidate.location && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem'
                    }}>
                      <MapPin size={14} />
                      <span>{candidate.location}</span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      backgroundColor: '#ede9fe',
                      color: '#667eea',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Briefcase size={12} />
                      {getWorkTypeLabel(candidate.work_type)}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {getEmploymentTypeLabel(candidate.employment_type)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => handleCandidateClick(candidate.id)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#667eea',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#5568d3';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#667eea';
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleContactCandidate(candidate.id)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#e6eefc',
                        color: '#0f2a63',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#d1e0f7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#e6eefc';
                      }}
                    >
                      Contact
                    </button>
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
              <User size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{
                fontSize: '1.125rem',
                marginBottom: '0.5rem'
              }}>
                No candidates available yet
              </p>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Candidates will appear here once they create their profiles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      <CandidateDetailsModal 
        candidateProfileId={selectedCandidateId}
        onClose={closeCandidateModal}
      />
    </section>
  );
};

export default EmployerDashboard;