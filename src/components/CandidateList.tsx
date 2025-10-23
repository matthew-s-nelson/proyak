import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, MapPin, Briefcase } from 'lucide-react';

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
  profiles: {
    user_id: string;
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

      console.log('Attempting to load candidates...');

      // First, let's check if the table exists and has data
      const { data: testData, error: testError } = await supabase
        .from('candidate_profiles')
        .select('*')
        .limit(1);

      console.log('Test query result:', { testData, testError });

      // Fetch candidate profiles with their specialty
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

      console.log('Full query result:', { data, fetchError });

      if (fetchError) {
        console.error('Fetch error details:', fetchError);
        throw fetchError;
      }

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
        justifyContent: 'center'
      }}>
        <div className="loading-spinner">Loading candidates...</div>
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
        padding: '2rem'
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
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <div style={{
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#991b1b'
          }}>
            <strong>Troubleshooting tips:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Check browser console for detailed error logs</li>
              <li>Verify the candidate_profiles table exists in your database</li>
              <li>Ensure your Supabase connection is configured correctly</li>
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <User size={30} color="white" />
                </div>

                {/* Specialty */}
                {candidate.specialties && (
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
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
                    gap: '0.5rem',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
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
                  marginTop: '1rem'
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
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {candidate.bio}
                  </p>
                )}

                {/* Action Button */}
                <button style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.625rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <User size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              No candidates yet
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Candidates will appear here once they create their profiles
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CandidateList;