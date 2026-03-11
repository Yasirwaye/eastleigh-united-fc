import React from 'react';

const Footer = () => {
  const socialLinks = [
    { name: 'TikTok', url: 'https://www.tiktok.com' },
    { name: 'Instagram', url: 'https://www.instagram.com' },
    { name: 'Facebook', url: 'https://www.facebook.com' },
    { name: 'Twitter', url: 'https://www.twitter.com' },
    { name: 'YouTube', url: 'https://www.youtube.com' },
  ];

  return (
    <footer className="bg-[#050810] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                 <img 
                src="/images/image.png" 
                alt="Eastleigh United FC" 
                className="w-10 h-10 object-contain"
              />
              </div>
              <span className="font-display font-bold text-xl">EASTLEIGH FC ACADEMY</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Developing elite football talent since 2020.
              Professional pathways for players aged 10-18.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#highlights" className="hover:text-cyan-400 transition-colors">Highlights</a></li>
              <li><a href="#squads" className="hover:text-cyan-400 transition-colors">Squads</a></li>
              <li><a href="#apply" className="hover:text-cyan-400 transition-colors">Apply Now</a></li>
              <li><a href="#testimonials" className="hover:text-cyan-400 transition-colors">Testimonials</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="glass px-3 py-2 rounded-lg text-sm hover:bg-cyan-400/20 hover:text-cyan-400 transition-all"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 Eastleigh United FC Academy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;