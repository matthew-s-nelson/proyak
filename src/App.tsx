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
import SetupProfile from './components/SetupProfile'

function HomePage() {
  return (
    <>
      <Hero />
      <UpdatesSection />
      <MeritScore />
    </>
  )
}

function App() {
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
  return (
    <Router>
      <div className="App">
        <Header />

        <main>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/candidates" element={<CandidateList />} />
              <Route path="/testing" element={<VectorTesting />} />
              <Route path="/register" element={<Register />} />
              <Route path="/setup-profile" element={<SetupProfile />} />
              <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
