import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Briefcase, Building2 } from 'lucide-react';

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

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load business profile
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error loading business profile:', businessError);
      } else {
        setBusinessProfile(businessData);
      }

      // Load candidate profiles
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
        .limit(6); // Show top 6 candidates on dashboard

      if (candidatesError) throw candidatesError;

      setCandidates(candidatesData || []);
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
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Stats Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#667eea'
              }}>
                {candidates.length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                Total Candidates
              </div>
            </div>
          </div>
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
                  {/* Icon */}
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

                  {/* Specialty */}
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

                  {/* Location */}
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

                  {/* Tags */}
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

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      className="btn-small"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#667eea',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      className="btn-small secondary"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#e6eefc',
                        color: '#0f2a63',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
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
    </section>
  );
};

export default EmployerDashboard;