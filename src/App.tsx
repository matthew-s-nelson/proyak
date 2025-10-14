import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
    <BrowserRouter>
      <div className="App">
        <Header />

        <main>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/candidates" element={<CandidateList />} />
              <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
