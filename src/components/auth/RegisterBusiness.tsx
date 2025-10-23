import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const RegisterBusiness: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!formData.companyName.trim() || !formData.contactName.trim() || 
        !formData.email.trim() || !formData.password) {
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

    console.log('=== BUSINESS REGISTRATION START ===');
    console.log('Company Name:', formData.companyName);
    console.log('Contact Name:', formData.contactName);
    console.log('Email:', formData.email);

    try {
      // Step 1: Create auth user
      console.log('\n--- Creating auth user ---');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/#/business-dashboard`,
          data: {
            company_name: formData.companyName,
            contact_name: formData.contactName,
            full_name: formData.contactName,
            user_type: 'business'
          },
        }
      });

      console.log('Auth signup result:', { data, signUpError });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('User creation failed - no user returned');
      }

      console.log('✓ User created with ID:', data.user.id);

      // Step 2: Wait a moment for the user to be fully created
      console.log('\n--- Waiting for user creation to complete ---');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create business profile
      console.log('\n--- Creating business profile ---');
      
      const businessProfileData = {
        user_id: data.user.id,
        company_name: formData.companyName,
        location: '', // Will be filled in profile setup
        industry: ''  // Will be filled in profile setup
      };

      console.log('Inserting business profile:', businessProfileData);

      const { data: profileData, error: profileError } = await supabase
        .from('business_profiles')
        .insert(businessProfileData)
        .select()
        .single();

      console.log('Business profile insert result:', { profileData, profileError });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        // Don't throw - the user account was created successfully
        console.warn('User account created but profile creation failed. User can create profile manually.');
      } else {
        console.log('✓ Business profile created successfully!');
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '2rem' }}>Registration Successful!</h2>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Please check your email for a confirmation link to activate your business account.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
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
      background: 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
          color: 'white',
          padding: '2.5rem 2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0'
          }}>
            Business Registration
          </h1>
          <p style={{
            fontSize: '1rem',
            opacity: 0.95,
            margin: 0,
            lineHeight: '1.5'
          }}>
            Register your business to start posting jobs and discovering talent
          </p>
        </div>

        {/* Form */}
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

          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="companyName" style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Your Company Inc."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Contact Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="contactName" style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Contact Person Name
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="John Smith"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
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
                Business Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="contact@company.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
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
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
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
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
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
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #0f2a63 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.4)'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Register Business'}
            </button>
          </form>

          {/* Footer Links */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 0.5rem 0' }}>
              Already have an account?{' '}
              <a href="/#/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                Sign in
              </a>
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Want to register as an individual?{' '}
              <a href="/#/register-individual" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                Click here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterBusiness;