import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Business {
  id: string;
  company_name: string;
  location?: string;
  industry?: string;
}

const RegisterRecruiter: React.FC = () => {
  const [step, setStep] = useState<'search' | 'register'>('search');
  const [businessSearch, setBusinessSearch] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Search for existing businesses
  const handleBusinessSearch = async () => {
    setSearchAttempted(true);
    if (!businessSearch.trim()) {
      setError('Please enter a company name to search');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase
        .from('business_profiles')
        .select('id, company_name, location, industry')
        .ilike('company_name', `%${businessSearch}%`)
        .limit(10);

      if (searchError) throw searchError;
      setBusinesses(data || []);
    } catch (err) {
      console.error('Error searching businesses:', err);
      setError('Failed to search for businesses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setStep('register');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.email.trim() || !formData.password || !formData.jobTitle.trim()) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!selectedBusiness) {
      setError('Please select a business to link to');
      setIsLoading(false);
      return;
    }

    try {
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/#/recruiter-dashboard`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            user_type: 'recruiter',
            job_title: formData.jobTitle,
            business_id: selectedBusiness.id,
            company_name: selectedBusiness.company_name
          },
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create recruiter profile linked to business
        const { error: profileError } = await supabase
          .from('recruiter_profiles')
          .insert({
            user_id: data.user.id,
            business_id: selectedBusiness.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            job_title: formData.jobTitle,
            email: formData.email
          });

        if (profileError) {
          console.error('Error creating recruiter profile:', profileError);
          throw new Error('Failed to create recruiter profile');
        }

        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '2rem' }}>
            Registration Successful!
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '0.5rem' }}>
            Your recruiter account for <strong>{selectedBusiness?.company_name}</strong> has been created!
          </p>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Please check your email for a confirmation link to activate your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          padding: '2.5rem 2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0'
          }}>
            Recruiter Registration
          </h1>
          <p style={{
            fontSize: '1rem',
            opacity: 0.95,
            margin: 0,
            lineHeight: '1.5'
          }}>
            {step === 'search' 
              ? 'First, find and select your company to link your account'
              : 'Now create your personal recruiter account'
            }
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.875rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Step 1: Search for Business */}
          {step === 'search' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Search for Your Company
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBusinessSearch()}
                    placeholder="Enter company name..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    onClick={handleBusinessSearch}
                    disabled={isSearching}
                    style={{
                      background: isSearching ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: isSearching ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Business Results */}
              {searchAttempted && (
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {businesses.length > 0 ? (
                    businesses.map((business) => (
                      <div
                        key={business.id}
                        onClick={() => handleSelectBusiness(business)}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1f2937', 
                          marginBottom: '0.25rem',
                          fontSize: '15px'
                        }}>
                          {business.company_name}
                        </div>
                        {(business.location || business.industry) && (
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {[business.industry, business.location].filter(Boolean).join(' • ')}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      padding: '2rem', 
                      textAlign: 'center', 
                      color: '#6b7280' 
                    }}>
                      <p style={{ marginBottom: '1rem', fontSize: '15px' }}>
                        No businesses found matching "{businessSearch}"
                      </p>
                      <p style={{ fontSize: '14px', marginBottom: '1rem' }}>
                        Can't find your company? They need to register first.
                      </p>
                      <a
                        href="/#/register-business"
                        style={{
                          color: '#10b981',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        Register New Business →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Register Recruiter */}
          {step === 'register' && selectedBusiness && (
            <form onSubmit={handleSubmit}>
              {/* Selected Business Display */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#059669', 
                  fontWeight: '600', 
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Selected Company:
                </div>
                <div style={{ 
                  fontSize: '17px', 
                  color: '#1f2937', 
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  {selectedBusiness.company_name}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('search');
                    setSelectedBusiness(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Change company
                </button>
              </div>

              {/* Name Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <label htmlFor="firstName" style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Job Title */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="jobTitle" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Talent Acquisition Manager"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@company.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="password" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="confirmPassword" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                  marginBottom: 0
                }}>
                  Minimum 6 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Footer Links */}
          {!success && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 0.5rem 0' }}>
                Already have an account?{' '}
                <a href="/#/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>
                  Sign in
                </a>
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Need to register a different way?{' '}
                <a href="/#/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>
                  Back to options
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterRecruiter;