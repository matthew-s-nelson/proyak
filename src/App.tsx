import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import UpdatesSection from './components/UpdatesSection'
import Footer from './components/Footer'
import EmployerDashboard from './components/EmployerDashboard'
import MeritScore from './components/MeritScore'
import CandidateList from './components/CandidateList'
import './App.css'
import VectorTesting from './components/VectorTesting'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import SetupProfile from './components/SetupProfile'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function HomePage() {
  return (
    <>
      <Hero />
      <UpdatesSection />
      <MeritScore />
    </>
  )
}

function AppContent() {
  const { loading } = useAuth()

  useEffect(() => {
    const setBodyPadding = () => {
      const header = document.querySelector('.header') as HTMLElement | null;
      const height = header ? header.getBoundingClientRect().height : 0;
      // set padding on body so fixed header doesn't overlap content
      document.body.style.paddingTop = height + 'px';
    };

    setBodyPadding();
    window.addEventListener('resize', setBodyPadding);
    return () => window.removeEventListener('resize', setBodyPadding);
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
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route 
              path="/employer" 
              element={
                <ProtectedRoute>
                  <EmployerDashboard />
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
            <Route path="/testing" element={<VectorTesting />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/setup-profile" 
              element={
                <ProtectedRoute>
                  <SetupProfile />
                </ProtectedRoute>
              } 
            />
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
