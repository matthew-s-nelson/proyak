import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'


import UpdatesSection from './components/UpdatesSection'
import Footer from './components/Footer'
import EmployerDashboard from './components/EmployerDashboard'
import CandidateList from './components/CandidateList'
import JobListings from './components/JobListings'
import './App.css'
import VectorTesting from './components/VectorTesting'
import RegisterTypeSelector from './components/auth/RegisterTypeSelector'
import RegisterIndividual from './components/auth/RegisterIndividual'
import RegisterBusiness from './components/auth/RegisterBusiness'
import RegisterRecruiter from './components/auth/RegisterRecruiter'
import Login from './components/auth/Login'
import IndividualProfileSetup from './components/auth/IndividualProfileSetup'
import IndividualDashboard from './components/IndividualDashboard'
import RecruiterDashboard from './components/RecruiterDashboard'
import PostJob from './components/PostJob'
import SetupProfile from './components/SetupProfile'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function HomePage() {
  return (
    <>
      <Hero />
      <UpdatesSection />

    </>
  )
}

function AppContent() {
  const { loading } = useAuth()

  useEffect(() => {
    const setMainPadding = () => {
      const header = document.querySelector('.header') as HTMLElement | null;
      const main = document.querySelector('main') as HTMLElement | null;
      
      if (header && main) {
        setTimeout(() => {
          const height = header.getBoundingClientRect().height;
          main.style.paddingTop = Math.max(height, 80) + 'px';
        }, 100);
      }
    };

    setMainPadding();
    window.addEventListener('resize', setMainPadding);
    window.addEventListener('load', setMainPadding);
    
    return () => {
      window.removeEventListener('resize', setMainPadding);
      window.removeEventListener('load', setMainPadding);
    };
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <Router>
      <div className="App">
        <Header />

        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />

            
            {/* Registration Routes */}
            <Route path="/register" element={<RegisterTypeSelector />} />
            <Route path="/register-individual" element={<RegisterIndividual />} />
            <Route path="/register-business" element={<RegisterBusiness />} />
            <Route path="/register-recruiter" element={<RegisterRecruiter />} />
            
            {/* Login Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected: Profile Setup Routes */}
            <Route 
              path="/individual-profile-setup" 
              element={
                <ProtectedRoute>
                  <IndividualProfileSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business-profile-setup" 
              element={
                <ProtectedRoute>
                  <SetupProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/setup-profile" 
              element={
                <ProtectedRoute>
                  <SetupProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected: Dashboard Routes */}
            <Route 
              path="/employer" 
              element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/business-dashboard" 
              element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter-dashboard" 
              element={
                <ProtectedRoute>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/individual-dashboard" 
              element={
                <ProtectedRoute>
                  <IndividualDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected: Job-related Routes */}
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <JobListings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-job" 
              element={
                <ProtectedRoute>
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidates" 
              element={
                <ProtectedRoute>
                  <CandidateList />
                </ProtectedRoute>
              } 
            />
            
            {/* Testing Route */}
            <Route path="/testing" element={<VectorTesting />} />
            
            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App