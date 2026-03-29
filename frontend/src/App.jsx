import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import PlayerSpotlight from './components/PlayerSpotlight';
import Training from './components/Training';
import Facilities from './components/Facilities';
import Squads from './components/Squads';
import Testimonials from './components/Testimonials';
import ApplicationForm from './components/ApplicationForm';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

function App() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check for admin mode via URL hash
  useEffect(() => {
    if (window.location.hash === '#admin') {
      setShowAdmin(true);
    }
  }, []);

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection}
        onAdminClick={() => setShowAdmin(true)}
      />
      <Hero scrollToSection={scrollToSection} />
      {/* <Highlights /> */}
      <PlayerSpotlight />
      <Training />
      <Facilities />
      <Squads />
      <Testimonials />
      <ApplicationForm />
      <Footer />
    </div>
  );
}

export default App;