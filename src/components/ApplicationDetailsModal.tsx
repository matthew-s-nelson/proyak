import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { RecentApplication } from './RecentApplications';
import { supabase } from '../lib/supabase';

interface CandidateProfile {
  id: string;
  user_id: string;
  specialties: {
    id: string;
    name: string | null;
  } | null;
  work_type: string | null;
  employment_type: string | null;
  location: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
}

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface CandidateDetails {
  candidate_profile: CandidateProfile;
  user: UserData;
}

interface ApplicationDetailsModalProps {
  application: RecentApplication | null;
  onClose: () => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  onClose
}) => {
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);
  const [coverLetterSignedUrl, setCoverLetterSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!application?.candidate_profiles?.id) {
      setCandidateProfile(null);
      setUserData(null);
      return;
    }

    const fetchCandidateDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-candidate-details', {
          body: {
            candidate_profile_id: application.candidate_profiles.id
          }
        });

        if (error) {
          console.error('Error fetching candidate details:', error);
        } else if (data) {
          const candidateDetails = data as CandidateDetails;
          // Handle the case where specialties is returned as an array
          const profileData = candidateDetails.candidate_profile;
          setCandidateProfile({
            ...profileData,
            specialties: Array.isArray(profileData.specialties) 
              ? profileData.specialties[0] 
              : profileData.specialties
          });
          setUserData(candidateDetails.user);

          const { data: docData, error: docError } = await supabase.functions.invoke('get-document-urls', {
            body: {
              resume_url: application.resume_url,
              cover_letter_url: application.cover_letter_url
            }
          });

          if (docError) {
            console.error('Error fetching document URLs:', docError);
          } else if (docData) {
            setResumeSignedUrl(docData.resume_signed_url || null);
            setCoverLetterSignedUrl(docData.cover_letter_signed_url || null);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [application?.candidate_profiles?.id]);

  if (!application) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={24} color="#6b7280" />
        </button>

        {/* Modal Content */}
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1.5rem',
          paddingRight: '2rem'
        }}>
          Application Details
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Job Title - Full Width */}
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Job Title
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {application.job_postings?.title || 'N/A'}
            </div>
          </div>

          {/* Two Column Grid for Status and Applied Date */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            {/* Status */}
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Status
              </div>
              <span style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {application.status}
              </span>
            </div>

            {/* Applied Date */}
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Applied Date
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#374151'
              }}>
                {new Date(application.applied_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Candidate Profile Section */}
          {loading && (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Loading candidate profile...
            </div>
          )}

          {!loading && candidateProfile && (
            <>
              <div style={{
                borderTop: '2px solid #e5e7eb',
                margin: '1rem 0',
                paddingTop: '1rem'
              }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  Candidate Profile
                </h4>
              </div>

              {/* Two Column Grid for Candidate Name and Email */}
              {userData && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem'
                }}>
                  {/* Candidate Name */}
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Name
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {userData.full_name || 'N/A'}
                    </div>
                  </div>

                  {/* Candidate Email */}
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Email
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#374151',
                      wordBreak: 'break-word'
                    }}>
                      {userData.email}
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Grid for Specialty, Work Type, Employment Type, Location */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem'
              }}>
                {/* Specialty */}
                {candidateProfile.specialties && (
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Specialty
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#374151'
                    }}>
                      {candidateProfile.specialties?.name || 'N/A'}
                    </div>
                  </div>
                )}

                {/* Work Type */}
                {candidateProfile.work_type && (
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Work Type
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#374151',
                      textTransform: 'capitalize'
                    }}>
                      {candidateProfile.work_type}
                    </div>
                  </div>
                )}

                {/* Employment Type */}
                {candidateProfile.employment_type && (
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Employment Type
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#374151',
                      textTransform: 'capitalize'
                    }}>
                      {candidateProfile.employment_type}
                    </div>
                  </div>
                )}

                {/* Location */}
                {candidateProfile.location && (
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Location
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#374151'
                    }}>
                      {candidateProfile.location}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio - Collapsible - Full Width */}
              {candidateProfile.bio && (
                <div>
                  <button
                    onClick={() => setShowBio(!showBio)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <span>Bio</span>
                    {showBio ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {showBio && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      color: '#374151',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {candidateProfile.bio}
                    </div>
                  )}
                </div>
              )}

              {/* Resume */}
              {resumeSignedUrl && (
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setShowResume(!showResume)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <span>Resume</span>
                    {showResume ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {showResume && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <iframe
                        src={resumeSignedUrl}
                        style={{
                          width: '100%',
                          height: '600px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                        title="Resume"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter */}
              {coverLetterSignedUrl && (
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setShowCoverLetter(!showCoverLetter)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <span>Cover Letter</span>
                    {showCoverLetter ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {showCoverLetter && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <iframe
                        src={coverLetterSignedUrl}
                        style={{
                          width: '100%',
                          height: '600px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                        title="Cover Letter"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
