import React, { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';

const Navbar = ({ activeSection, scrollToSection, onAdminClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'highlights', label: 'Highlights' },
    { id: 'spotlight', label: 'Spotlight' },
    { id: 'training', label: 'Training' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'squads', label: 'Squads' },
    { id: 'testimonials', label: 'Testimonials' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-strong py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToSection('welcome')}
          >
           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/images/image.png" 
                alt="Eastleigh United FC" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="font-display font-bold text-xl tracking-wide hidden sm:block">EASTLEIGH UNITED FC</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`nav-link text-sm font-medium transition-colors ${activeSection === item.id ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('apply')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105"
            >
              Apply Now
            </button>
            <button
              onClick={onAdminClick}
              className="text-gray-400 hover:text-white transition-colors"
              title="Admin Panel"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-strong mt-4 mx-4 rounded-2xl p-6 animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id);
                  setIsOpen(false);
                }}
                className="text-left text-gray-300 hover:text-cyan-400 font-medium py-2"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                scrollToSection('apply');
                setIsOpen(false);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 rounded-full font-semibold text-center mt-4"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;