'use client';

import { useState, useEffect } from 'react';
import { GameStatus } from '@/types/game';

interface VictoryDefeatScreenProps {
  status: GameStatus;
  onRestart: () => void;
}

function Confetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  return (
    <span 
      className="absolute text-4xl opacity-0"
      style={{
        animation: `float-up 3s ease-out ${delay}s forwards`,
        left: `${20 + Math.random() * 60}%`,
        bottom: '20%',
      }}
    >
      {emoji}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
          }
          100% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}

export function VictoryDefeatScreen({ status, onRestart }: VictoryDefeatScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (status === 'victory' || status === 'defeat') {
      // Stagger the reveal animations
      const contentTimer = setTimeout(() => setShowContent(true), 200);
      const statsTimer = setTimeout(() => setShowStats(true), 800);
      const buttonTimer = setTimeout(() => setShowButton(true), 1200);
      
      return () => {
        clearTimeout(contentTimer);
        clearTimeout(statsTimer);
        clearTimeout(buttonTimer);
      };
    } else {
      setShowContent(false);
      setShowStats(false);
      setShowButton(false);
    }
  }, [status]);

  if (status !== 'victory' && status !== 'defeat') return null;

  const isVictory = status === 'victory';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with animation */}
      <div 
        className={`
          absolute inset-0 transition-all duration-700
          ${isVictory 
            ? 'bg-gradient-to-br from-yellow-500/95 via-amber-500/95 to-orange-600/95' 
            : 'bg-gradient-to-br from-red-900/95 via-stone-900/95 to-black/95'
          }
        `} 
      />
      
      {/* Victory confetti */}
      {isVictory && <Confetti />}
      
      {/* Floating emojis */}
      {isVictory && (
        <>
          <FloatingEmoji emoji="⭐" delay={0.5} />
          <FloatingEmoji emoji="✨" delay={0.8} />
          <FloatingEmoji emoji="🎉" delay={1.1} />
          <FloatingEmoji emoji="💎" delay={1.4} />
          <FloatingEmoji emoji="🏆" delay={1.7} />
        </>
      )}
      
      {/* Content */}
      <div className="relative text-center max-w-md mx-auto">
        {/* Main icon with animation */}
        <div 
          className={`
            text-9xl mb-6 
            ${showContent ? (isVictory ? 'animate-victory' : 'animate-defeat') : 'opacity-0 scale-0'}
          `}
        >
          {isVictory ? '🏆' : '💀'}
        </div>
        
        {/* Title with gradient text */}
        <h1 
          className={`
            text-5xl font-black mb-3 tracking-tight
            transition-all duration-500
            ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            ${isVictory 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-white to-yellow-100' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-red-100 to-red-200'
            }
          `}
        >
          {isVictory ? 'VICTORY!' : 'DEFEATED'}
        </h1>
        
        {/* Subtitle */}
        <p 
          className={`
            text-lg mb-8 max-w-sm mx-auto leading-relaxed
            transition-all duration-500 delay-200
            ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            ${isVictory ? 'text-amber-100' : 'text-stone-300'}
          `}
        >
          {isVictory 
            ? 'The enemies have fallen before your might! Your legend grows ever stronger.' 
            : 'You have fallen in battle... But every hero can rise again to face their destiny.'}
        </p>
        
        {/* Stats panel */}
        <div 
          className={`
            grid grid-cols-2 gap-4 mb-8 p-5 rounded-2xl max-w-xs mx-auto
            transition-all duration-500
            ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            ${isVictory 
              ? 'bg-white/15 backdrop-blur-sm border border-white/20' 
              : 'bg-black/30 backdrop-blur-sm border border-white/10'
            }
          `}
        >
          <div className="text-center">
            <div className={`text-3xl font-black ${isVictory ? 'text-white' : 'text-red-100'}`}>
              3
            </div>
            <div className={`text-xs font-medium ${isVictory ? 'text-amber-200' : 'text-stone-400'}`}>
              Enemies Slain
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-black ${isVictory ? 'text-white' : 'text-red-100'}`}>
              7
            </div>
            <div className={`text-xs font-medium ${isVictory ? 'text-amber-200' : 'text-stone-400'}`}>
              Rounds Survived
            </div>
          </div>
        </div>
        
        {/* Action button */}
        <button
          onClick={onRestart}
          className={`
            px-10 py-4 rounded-2xl font-bold text-lg
            transition-all duration-300
            ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            ${isVictory 
              ? 'bg-white text-amber-700 hover:bg-amber-50 hover:scale-105 active:scale-95 shadow-xl shadow-black/20' 
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 hover:scale-105 active:scale-95 shadow-xl shadow-black/30'
            }
          `}
        >
          {isVictory ? '⚔️ Continue Adventure' : '🔄 Rise Again'}
        </button>
        
        {/* Decorative elements for victory */}
        {isVictory && (
          <div className="absolute -inset-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 text-4xl opacity-30 animate-float" style={{ animationDelay: '0s' }}>⭐</div>
            <div className="absolute top-1/4 right-0 text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-1/4 left-0 text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>💫</div>
            <div className="absolute bottom-0 right-1/4 text-4xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>
          </div>
        )}
      </div>
    </div>
  );
}
