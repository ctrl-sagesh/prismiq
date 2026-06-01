'use client';

import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [phase, setPhase] = useState(0); // 0=mount, 1=animate-in, 2=ready, 3=exit
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 4,
    }))
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    setPhase(3);
    setTimeout(onEnter, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: '#07070f' }}
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            top: '-20%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            animation: 'welcomePulse 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            bottom: '-15%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
            animation: 'welcomePulse 8s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(192,38,211,0.08) 0%, transparent 70%)',
            animation: 'welcomePulse 7s ease-in-out infinite 1s',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-violet-400/20"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.x + '%',
              top: p.y + '%',
              animation: `welcomeFloat ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* P Logo */}
        <div
          className={`mb-8 transition-all duration-1000 ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <span className="text-4xl font-bold text-white">P</span>
          </div>
        </div>

        {/* Welcome text */}
        <h1
          className={`text-2xl sm:text-3xl font-medium text-white/50 mb-2 transition-all duration-1000 delay-200 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Welcome to
        </h1>

        {/* Flying Prismiq text */}
        <div className="overflow-hidden mb-6 w-full max-w-lg">
          <h2
            className={`text-6xl sm:text-8xl font-bold transition-all duration-1000 delay-500 ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 25%, #f472b6 50%, #a78bfa 75%, #c084fc 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: phase >= 1 ? 'welcomeFlyIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards, welcomeShimmer 3s ease-in-out infinite 1.5s' : 'none',
            }}
          >
            Prismiq
          </h2>
        </div>

        {/* Tagline */}
        <p
          className={`text-white/40 text-lg sm:text-xl max-w-md mb-4 transition-all duration-1000 delay-700 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Understand anything in seconds.
        </p>

        {/* Feature pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-10 transition-all duration-1000 delay-900 ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {['YouTube', 'Websites', 'PDFs', 'Images'].map((f, i) => (
            <span
              key={f}
              className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/40 text-sm backdrop-blur-sm"
              style={{
                animation: phase >= 2 ? `welcomeFadeUp 0.5s ease forwards ${i * 0.1}s` : 'none',
                opacity: phase >= 2 ? 1 : 0.5,
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Get Started button */}
        <button
          onClick={handleEnter}
          className={`group relative px-10 py-4 rounded-2xl font-semibold text-lg text-white overflow-hidden transition-all duration-1000 delay-1000 cursor-pointer ${
            phase >= 2
              ? 'opacity-100 translate-y-0 hover:scale-105 active:scale-95'
              : 'opacity-0 translate-y-6'
          }`}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
            boxShadow: '0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(236,72,153,0.15)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #9333ea, #db2777)' }}
          />
        </button>

        {/* Subtle hint */}
        <p
          className={`mt-6 text-white/15 text-xs transition-all duration-1000 delay-1000 ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Free to try · No account needed
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes welcomePulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes welcomeFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        @keyframes welcomeFlyIn {
          0% { transform: translateX(-120%); opacity: 0; }
          60% { transform: translateX(5%); opacity: 1; }
          80% { transform: translateX(-2%); }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes welcomeShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes welcomeFadeUp {
          0% { transform: translateY(10px); opacity: 0.5; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
