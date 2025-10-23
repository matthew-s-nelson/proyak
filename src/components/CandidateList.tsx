import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, MapPin, Briefcase, RefreshCw } from 'lucide-react';

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

const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== LOADING CANDIDATE DIRECTORY ===');

      // First, check if candidate_profiles table exists and is accessible
      const { data: testData, error: testError } = await supabase
        .from('candidate_profiles')
        .select('id')
        .limit(1);

      console.log('Table accessibility test:', { testData, testError });

      if (testError) {
        console.error('❌ Table access error:', testError);
        throw new Error(`Cannot access candidate_profiles table: ${testError.message}`);
      }

      // Fetch candidate profiles with their specialty
      console.log('\n--- Fetching all candidates ---');
      const { data, error: fetchError } = await supabase
        .from('candidate_profiles')
        .select(`
          *,
          specialties (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Candidates query result:', { 
        count: data?.length || 0, 
        data, 
        fetchError 
      });

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }

      console.log(`✓ Successfully loaded ${data?.length || 0} candidates`);
      setCandidates(data || []);
    } catch (err) {
      console.error('Error loading candidates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
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
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#6b7280' }}>Loading candidates...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#dc2626'
          }}>
            Failed to load candidates
          </h3>
          <p style={{ 
            marginBottom: '1rem',
            color: '#991b1b',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            backgroundColor: '#fef2f2',
            padding: '0.75rem',
            borderRadius: '6px',
            wordBreak: 'break-word'
          }}>
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              loadCandidates();
            }}
            style={{
              background: '#dc2626',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <div style={{
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            padding: '1rem',
            borderRadius: '6px'
          }}>
            <strong>Troubleshooting:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
              <li>Check browser console for detailed error logs</li>
              <li>Verify the <code>candidate_profiles</code> table exists in Supabase</li>
              <li>Check Row Level Security (RLS) policies allow SELECT</li>
              <li>Ensure foreign key to <code>specialties</code> table is correct</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Candidate Directory
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280'
          }}>
            Browse {candidates.length} qualified candidate{candidates.length !== 1 ? 's' : ''}
          </p>
        </div>

        {candidates.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                {/* Candidate Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <User size={32} color="white" />
                </div>

                {/* Specialty */}
                {candidate.specialties ? (
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    {candidate.specialties.name}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#6b7280',
                    marginBottom: '0.75rem'
                  }}>
                    Candidate
                  </div>
                )}

                {/* Location */}
                {candidate.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem'
                  }}>
                    <MapPin size={16} />
                    <span>{candidate.location}</span>
                  </div>
                )}

                {/* Work Preferences */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#ede9fe',
                    color: '#667eea',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Briefcase size={14} />
                    {getWorkTypeLabel(candidate.work_type)}
                  </span>
                  <span style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#dbeafe',
                    color: '#2563eb',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {getEmploymentTypeLabel(candidate.employment_type)}
                  </span>
                </div>

                {/* Bio Preview */}
                {candidate.bio && (
                  <p style={{
                    marginTop: '1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {candidate.bio}
                  </p>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1.25rem'
                }}>
                  <button style={{
                    flex: 1,
                    padding: '0.625rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    View Profile
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '0.625rem',
                    background: '#f3f4f6',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <User size={64} color="#d1d5db" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              No candidates yet
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              Candidates will appear here once they create their profiles. Check back soon!
            </p>
          </div>
        )}

        {/* Debug Info (only visible in development) */}
        {candidates.length === 0 && (
          <div style={{
            marginTop: '2rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.875rem'
          }}>
            <strong style={{ color: '#92400e' }}>💡 Developer Note:</strong>
            <p style={{ color: '#78350f', margin: '0.5rem 0 0 0' }}>
              No candidates found in the database. To test this page, you need to:
            </p>
            <ol style={{ color: '#78350f', margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
              <li>Register as an individual user</li>
              <li>Complete the profile setup with specialty and interests</li>
              <li>The candidate will then appear in this directory</li>
            </ol>
          </div>
        )}
      </div>
    </section>
  );
};

export default CandidateList;