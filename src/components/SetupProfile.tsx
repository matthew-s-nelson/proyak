import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SpecialtySearch from './specialty/SpecialtySearch';
import InterestSearch from './interest/InterestSearch';
import { supabase } from '../lib/supabase';

interface Specialty {
  id: number;
  name: string;
}

interface Interest {
  id: number;
  name: string;
}

const WorkType = {
  REMOTE: 0,
  ONSITE: 1,
  HYBRID: 2,
} as const;

const EmploymentType = {
  FULL_TIME: 0,
  PART_TIME: 1,
} as const;

type WorkTypeValue = typeof WorkType[keyof typeof WorkType];
type EmploymentTypeValue = typeof EmploymentType[keyof typeof EmploymentType];

const SetupProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [workType, setWorkType] = useState<WorkTypeValue>(WorkType.REMOTE);
  const [employmentType, setEmploymentType] = useState<EmploymentTypeValue>(EmploymentType.FULL_TIME);
  const [bio, setBio] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const getUserName = () => {
    if (!user) return 'User';
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  const handleSpecialtySelect = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
  };

  const handleInterestSelect = (interest: Interest) => {
    // Add interest if not already selected
    if (!selectedInterests.some(i => i.id === interest.id)) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const removeInterest = (interestId: number) => {
    setSelectedInterests(selectedInterests.filter(i => i.id !== interestId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedSpecialty) {
      setError('Please select a specialty');
      return;
    }
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save profile data to Supabase
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user?.id,
          specialty_id: selectedSpecialty.id,
          interest_ids: selectedInterests.map(i => i.id),
          work_type: workType,
          employment_type: employmentType,
          bio: bio.trim() || null,
          location: location.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      // Navigate to dashboard or home
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1rem'
    }}>
      {/* Header Section */}
      <div style={{
        textAlign: 'center',
        color: 'white',
        marginBottom: '2rem',
        padding: '2rem 1rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '600',
          margin: '0 0 1.5rem 0'
        }}>
          Welcome {getUserName()}! Tell us about yourself
        </h1>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '700px',
          margin: '0 auto',
          opacity: 0.95
        }}>
          Employee/company fit is a two way street. That's why we want to hear about you! What type of 
          worker are you, where do you see yourself ending up, what environments do you thrive in: all of 
          these answers will help us pair you with compatible companies.
        </p>
      </div>
      {/* Form Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxWidth: '700px',
        width: '100%',
        margin: '0 auto'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Location */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#333',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Location
            </h3>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
              }}
            />
          </div>
          {/* Work Type Preferences Section */}
          <h2 style={{
            fontSize: '1.5rem',
            color: '#333',
            margin: '0 0 1.5rem 0',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            Work Type Preferences
          </h2>

          {/* Scheduling */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#333',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Scheduling
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {[
                { value: EmploymentType.FULL_TIME, label: 'Full-time' },
                { value: EmploymentType.PART_TIME, label: 'Part-time' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEmploymentType(option.value)}
                  style={{
                    padding: '0.65rem 1.5rem',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: employmentType === option.value ? '#667eea' : '#e0e0e0',
                    color: employmentType === option.value ? 'white' : '#666',
                    fontWeight: '500'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Type */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#333',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Work Type
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {[
                { value: WorkType.ONSITE, label: 'On-site' },
                { value: WorkType.HYBRID, label: 'Hybrid' },
                { value: WorkType.REMOTE, label: 'Remote' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setWorkType(option.value)}
                  style={{
                    padding: '0.65rem 1.5rem',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: workType === option.value ? '#667eea' : '#e0e0e0',
                    color: workType === option.value ? 'white' : '#666',
                    fontWeight: '500'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specialty */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#333',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Specialty
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <SpecialtySearch
                onSpecialtySelect={handleSpecialtySelect}
                width="200px"
                placeholder="Law type"
              />
              {selectedSpecialty && (
                <span style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {selectedSpecialty.name}
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialty(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1.3rem',
                      padding: 0,
                      lineHeight: 1,
                      marginLeft: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Interests */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#333',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Interests
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <InterestSearch
                onInterestSelect={handleInterestSelect}
                width="200px"
                placeholder="Your interest"
              />
              {selectedInterests.map((interest) => (
                <span
                  key={interest.id}
                  style={{
                    padding: '0.65rem 1.5rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {interest.name}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1.3rem',
                      padding: 0,
                      lineHeight: 1,
                      marginLeft: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>


          {/* Bio */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#333',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              About You
            </h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself as a candidate..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
              marginTop: '1rem'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;