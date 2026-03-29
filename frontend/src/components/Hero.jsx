import React from 'react';
import { ChevronRight, Play, Trophy } from 'lucide-react';

const Hero = ({ scrollToSection }) => {
  return (
    <section id="welcome" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-cyan-400">Now Enrolling Ages 10-18</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Forge Your <br />
              <span className="gradient-text">Football Destiny</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Elite Football Academy develops world-class talent through professional coaching,
              state-of-the-art facilities, and a proven pathway to professional football for
              players aged 10-18.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection('apply')}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-[#0a0e1a] font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* <button
                onClick={() => scrollToSection('highlights')}
                className="glass px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Highlights</span>
              </button> */}
            </div>

            <div className="flex items-center space-x-8 mt-12">
              <div>
                <div className="font-display text-3xl font-bold text-cyan-400">500+</div>
                <div className="text-sm text-gray-400">Graduates</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div>
                <div className="font-display text-3xl font-bold text-cyan-400">50+</div>
                <div className="text-sm text-gray-400">Pro Contracts</div>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div>
                <div className="font-display text-3xl font-bold text-cyan-400">15</div>
                <div className="text-sm text-gray-400">Years Excellence</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
              <img
              // change image here.
                // src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                src="images/team.png"
                alt="Academy Team"
                className="w-full h-auto rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold">National Champions 2023</div>
                      <div className="text-sm text-gray-400">U18 Category</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;