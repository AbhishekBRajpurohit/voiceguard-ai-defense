// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'live', label: 'Product' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (key) => {
    setActiveTab(key);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="w-full max-w-[720px] flex items-center justify-between md:justify-center gap-4 md:gap-7 shrink-0 z-10 animate-slideDown">
        {/* Logo Button */}
        <button 
          onClick={() => handleNavClick('home')}
          className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white shadow-md grid place-items-center hover:scale-105 transition-transform cursor-pointer"
        >
          <img src="/assets/logo.webp" alt="VoiceGuard Logo" className="w-[72%] h-[72%] object-contain rounded-full" />
        </button>

        {/* Desktop Nav Pill */}
        <nav className="hidden md:flex h-11 md:h-12 max-w-[480px] flex-1 bg-white rounded-full shadow-md items-center justify-around px-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`relative font-medium text-xs md:text-sm text-[#2e2e2e] transition-opacity px-3 py-2.5 cursor-pointer ${activeTab === item.key ? 'opacity-100 active' : 'opacity-50 hover:opacity-75'}`}
            >
              {item.label}
              {activeTab === item.key && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.75 h-0.75 rounded-full bg-black shadow-[-5px_0_0_#000,5px_0_0_#000]"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Sign In Button */}
        <button 
          onClick={() => handleNavClick('signin')}
          className="hidden md:block h-11 md:h-12 px-5 md:px-6 rounded-full bg-[#28282a] text-[#c8c8c8] font-medium text-xs md:text-sm shadow-md hover:bg-[#323234] hover:text-white transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          Sign In
        </button>

        {/* Mobile Burger Button */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-11 h-11 rounded-full bg-[#28282a] text-white flex items-center justify-center cursor-pointer"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"></div>
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm bg-white rounded-3xl p-5 shadow-2xl z-50 flex flex-col items-center gap-3">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`font-medium text-base text-[#2e2e2e] cursor-pointer ${activeTab === item.key ? 'opacity-100 font-semibold' : 'opacity-60'}`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('signin')}
              className="w-full h-12 rounded-full bg-[#28282a] text-white font-semibold text-sm mt-2 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </>
      )}
    </>
  );
}
