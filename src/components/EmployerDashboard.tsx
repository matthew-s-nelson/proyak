import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import EmployerDashboardView from './EmployerDashboardView';
import type { JobPosting } from './EmployerDashboardView';
import type { RecentApplication } from './RecentApplications';

interface BusinessProfile {
  id: string;
  company_name: string;
  location: string;
  industry: string;
  user_id: string;
}

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const type = user.user_metadata?.user_type;
      loadDashboardData(type);
    }
  }, [user]);

  const loadDashboardData = async (type: 'recruiter' | 'business') => {
    try {
      let businessId: string | null = null;
      let companyInfo: BusinessProfile | null = null;

      if (type === 'recruiter') {
        // Load recruiter profile with business info
        const { data: recruiterData, error: recruiterError } = await supabase
          .from('recruiter_profiles')
          .select(`
            *,
            business_profiles (
              id,
              company_name,
              location,
              industry,
              user_id
            )
          `)
          .eq('user_id', user?.id)
          .single();

        if (recruiterError) {
          console.error('Error loading recruiter profile:', recruiterError);
        } else if (recruiterData) {
          businessId = recruiterData.business_id;
          companyInfo = recruiterData.business_profiles as BusinessProfile;
          setBusinessProfile(companyInfo);
        }
      } else if (type === 'business') {
        // Load business profile directly by user_id
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (businessError) {
          console.error('Error loading business profile:', businessError);
        } else if (businessData) {
          businessId = businessData.id;
          companyInfo = businessData as BusinessProfile;
          setBusinessProfile(companyInfo);
        }
      }

      // Load job postings for this business
      if (businessId) {
        const { data: jobsData, error: jobsError } = await supabase
          .from('job_postings')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Error loading jobs:', jobsError);
        } else {
          // Get application counts for each job
          const jobsWithCounts = await Promise.all(
            (jobsData || []).map(async (job) => {
              const { count } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('job_posting_id', job.id);
              
              return {
                ...job,
                _count: { applications: count || 0 }
              };
            })
          );
          setJobPostings(jobsWithCounts);
        }

        // Load recent applications
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select(`
            *,
            job_postings!inner (
              title,
              business_id
            ),
            profiles (
              user_id
            )
          `)
          .eq('job_postings.business_id', businessId)
          .order('applied_at', { ascending: false })
          .limit(5);

        if (appsError) {
          console.error('Error loading applications:', appsError);
        } else {
          setRecentApplications(appsData || []);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const companyName = businessProfile?.company_name || 'Your Company';
  const totalApplications = recentApplications.length;
  const activeJobs = jobPostings.filter(j => j.status === 'active').length;

  return (
    <EmployerDashboardView
      userName={userName}
      companyName={companyName}
      totalJobs={jobPostings.length}
      activeJobs={activeJobs}
      totalApplications={totalApplications}
      jobPostings={jobPostings}
      recentApplications={recentApplications}
      loading={loading}
    />
  );
};

export default EmployerDashboard;
