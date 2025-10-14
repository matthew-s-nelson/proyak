import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import UpdatesSection from './components/UpdatesSection'
import Footer from './components/Footer'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import './App.css'

function App() {
  useSmoothScroll();

  return (
    <div className="App">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <UpdatesSection />
      <Footer />
    </div>
  )
}

export default App
