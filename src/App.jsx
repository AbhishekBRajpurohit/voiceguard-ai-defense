// src/App.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import VideoBackground from './components/VideoBackground';
import Home from './pages/Home';
import LiveCheck from './pages/LiveCheck';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import { X, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center flex flex-col items-center gap-3">
          <AlertTriangle className="text-amber-400" size={32} />
          <h3 className="text-base font-bold text-white">Component Reload Needed</h3>
          <p className="text-xs text-zinc-400 max-w-sm">A minor render issue occurred. Click below to reload the view.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
          >
            Reset View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);

  const handleNavSelect = (key) => {
    setActiveTab(key);
    if (key !== 'home') {
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  };

  const getModalTitle = () => {
    switch (activeTab) {
      case 'live': return { badge: "PLAYGROUND & ENGINE PIPELINE", title: "VoiceGuard Live Inspection Playground" };
      case 'dashboard': return { badge: "EXECUTIVE DASHBOARD", title: "System Health & Audit Log History" };
      case 'about': return { badge: "TECHNICAL SPECIFICATION", title: "Architecture & Acoustic Detection Algorithms" };
      case 'contact': return { badge: "DEVELOPER ACCESS", title: "Enterprise API Integration & Contact" };
      case 'signin': return { badge: "SECURE ACCESS", title: "Carrier Portal Sign In" };
      default: return { badge: "SOLUTION-2 PLATFORM", title: "Voice Clone Detection & Privacy Architecture" };
    }
  };

  const modalMeta = getModalTitle();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      {/* Video Background */}
      <VideoBackground />

      {/* Page Container */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-screen p-4 md:p-7 overflow-hidden">
        {/* Header / Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={handleNavSelect} />

        {/* Single Viewport Hero Center */}
        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-[900px] w-full py-2">
          <h1 className="headline anim text-white text-3xl md:text-7xl font-display mb-4">
            <span className="block">Intelligence</span>
            <span className="block">Designed To Evolve</span>
          </h1>

          <p className="subhead anim text-zinc-300 text-sm md:text-base max-w-[500px] opacity-80 leading-relaxed mb-8" style={{ '--d': '0.18s' }}>
            Build applications that reason, adapt and collaborate using a modular AI platform designed for production.
          </p>

          <div className="cta-wrap anim" style={{ '--d': '0.3s' }}>
            <button
              onClick={() => handleNavSelect('live')}
              className="bg-white text-black font-semibold text-xs md:text-sm px-6 py-3 rounded-full shadow-[0_0_22px_rgba(255,255,255,0.32)] hover:scale-105 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </main>
      </div>

      {/* React Page Modals System */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full ${activeTab === 'signin' ? 'max-w-md' : 'max-w-[1120px]'} max-h-[92vh] bg-[#121319] border border-white/12 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <div>
                <span className="inline-block bg-white/8 border border-white/15 text-zinc-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  {modalMeta.badge}
                </span>
                <h2 className="text-lg font-semibold text-white tracking-tight">{modalMeta.title}</h2>
              </div>
              <button
                onClick={() => { setModalOpen(false); setActiveTab('home'); }}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 grid place-items-center hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <ErrorBoundary>
                {activeTab === 'live' && <LiveCheck />}
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'about' && <About />}
                {activeTab === 'contact' && <Contact />}
                {activeTab === 'signin' && <SignIn closeModal={() => { setModalOpen(false); setActiveTab('home'); }} />}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
