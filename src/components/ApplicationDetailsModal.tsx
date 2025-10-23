import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { RecentApplication } from './RecentApplications';
import { supabase } from '../lib/supabase';
import GradientBubble from './shared/GradientBubble';

interface CandidateProfile {
  id: string;
  user_id: string;
  specialties: {
    id: string;
    name: string | null;
  } | null;
  interests?: Array<{
    id: string;
    name: string | null;
  }>;
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
  interests: Array<{
    id: string;
    name: string | null;
  }>;
}

interface ApplicationDetailsModalProps {
  application: RecentApplication | null;
  onClose: () => void;
}

const H4: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 style={{
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem'
  }}>
    {children}
  </h4>
);

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, isOpen, onToggle, children }) => (
  <div style={{ marginTop: '1rem' }}>
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.875rem 1rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.9375rem',
        fontWeight: '500',
        color: '#374151'
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
      <span><b>{title}</b></span>
      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
    
    {isOpen && (
      <div style={{ marginTop: '0.75rem' }}>
        {children}
      </div>
    )}
  </div>
);

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
              : profileData.specialties,
            interests: candidateDetails.interests || []
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
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '3rem 2rem',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
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
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X size={24} color="white" />
          </button>

          <h3 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem',
            paddingRight: '2rem',
            textAlign: 'center'
          }}>
            Application Details
          </h3>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 200px)',
          overflow: 'auto'
        }}>
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
              {/* Section Divider */}
              <div style={{
                borderTop: '1px solid #e5e7eb',
                marginTop: '0.5rem',
                marginBottom: '1.5rem'
              }}></div>

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

              {/* Two Column Layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginTop: '1rem'
              }}>
                {/* Left Column */}
                <div>
                  {/* Scheduling Label */}
                  <H4>
                    Scheduling
                  </H4>

                  {/* Employment Type as a tag */}
                  {candidateProfile.employment_type && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <GradientBubble>
                        {candidateProfile.employment_type}
                      </GradientBubble>
                    </div>
                  )}

                  {/* Work Type Label */}
                  <H4>
                    Work Type
                  </H4>

                  {/* Work Type as a tag */}
                  {candidateProfile.work_type && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <GradientBubble>
                        {candidateProfile.work_type}
                      </GradientBubble>
                    </div>
                  )}

                  {/* Location */}
                  {candidateProfile.location && (
                    <div style={{ marginBottom: '1.5rem' }}>
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

                {/* Right Column - Specialties and Interests */}
                <div>
                  {/* Specialties Section Header */}
                  <H4>
                    Specialties
                  </H4>

                  {/* Specialty as a tag */}
                  {candidateProfile.specialties && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <GradientBubble>
                        {candidateProfile.specialties?.name || 'N/A'}
                      </GradientBubble>
                    </div>
                  )}

                  {/* Interests Section */}
                  {candidateProfile.interests && candidateProfile.interests.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem'
                      }}>
                        Interests
                      </h4>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        {candidateProfile.interests.map((interest: any) => (
                          <GradientBubble key={interest.id}>
                            {interest.name}
                          </GradientBubble>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio - Collapsible - Full Width */}
              {candidateProfile.bio && (
                <CollapsibleSection
                  title="Candidate Bio"
                  isOpen={showBio}
                  onToggle={() => setShowBio(!showBio)}
                >
                  <div style={{
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
                </CollapsibleSection>
              )}

              {/* Resume */}
              {resumeSignedUrl && (
                <CollapsibleSection
                  title="Resume"
                  isOpen={showResume}
                  onToggle={() => setShowResume(!showResume)}
                >
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
                </CollapsibleSection>
              )}

              {/* Cover Letter */}
              {coverLetterSignedUrl && (
                <CollapsibleSection
                  title="Cover Letter"
                  isOpen={showCoverLetter}
                  onToggle={() => setShowCoverLetter(!showCoverLetter)}
                >
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
                </CollapsibleSection>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
