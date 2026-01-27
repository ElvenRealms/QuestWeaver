'use client';

import { useEffect, useState } from 'react';
import { GameStatus } from '@/types/game';

interface VictoryDefeatScreenProps {
  status: GameStatus;
  onRestart: () => void;
}

export function VictoryDefeatScreen({ status, onRestart }: VictoryDefeatScreenProps) {
  const [show, setShow] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (status === 'victory' || status === 'defeat') {
      // Delay showing for dramatic effect
      const showTimer = setTimeout(() => setShow(true), 500);
      const contentTimer = setTimeout(() => setShowContent(true), 1000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(contentTimer);
      };
    } else {
      setShow(false);
      setShowContent(false);
    }
  }, [status]);

  if (!show || (status !== 'victory' && status !== 'defeat')) {
    return null;
  }

  const isVictory = status === 'victory';

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center p-4
      transition-all duration-700
      ${show ? 'opacity-100' : 'opacity-0'}
    `}>
      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 backdrop-blur-md transition-all duration-1000
          ${isVictory 
            ? 'bg-gradient-to-b from-[#C9A227]/40 via-[#7B2D3A]/30 to-[#1A1612]/80' 
            : 'bg-gradient-to-b from-[#2C1810]/60 via-[#5C1F2A]/40 to-[#1A1612]/90'
          }
        `}
      />
      
      {/* Radial glow effect */}
      {isVictory && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-radial from-[var(--gold)]/20 via-transparent to-transparent animate-pulse-soft" />
        </div>
      )}
      
      {/* Content card */}
      <div className={`
        relative z-10 w-full max-w-md
        ${showContent ? 'animate-victory' : 'opacity-0 scale-50'}
      `}>
        {/* Decorative corner flourishes */}
        <div className="card-elevated flourish-corner p-8 text-center">
          {/* Main icon */}
          <div className={`
            text-8xl mb-6 drop-shadow-2xl
            ${isVictory ? 'animate-float' : 'animate-defeat opacity-70'}
          `}>
            {isVictory ? '👑' : '💀'}
          </div>
          
          {/* Title */}
          <h1 className={`
            font-['Cinzel_Decorative'] text-4xl font-bold mb-4 tracking-wider
            ${isVictory 
              ? 'text-[var(--gold)] animate-gold-shimmer' 
              : 'text-[var(--burgundy)]'
            }
          `}>
            {isVictory ? 'VICTORIOUS' : 'FALLEN'}
          </h1>
          
          {/* Decorative divider */}
          <div className="divider-ornate my-6">
            <span className="text-sm">{isVictory ? '✦' : '†'}</span>
          </div>
          
          {/* Subtitle */}
          <p className={`
            font-['IM_Fell_English'] text-xl italic mb-8 leading-relaxed
            ${isVictory ? 'text-[var(--ink)]' : 'text-[var(--ink-light)]'}
          `}>
            {isVictory 
              ? 'Your legend grows. The realm whispers your name with reverence.' 
              : 'The darkness claims another soul. Yet death is not the end for the worthy...'}
          </p>
          
          {/* Stats/flourish for victory */}
          {isVictory && (
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="wax-seal w-12 h-12 text-lg mx-auto mb-2">✓</div>
                <p className="text-xs font-['Cinzel'] text-[var(--ink-light)] uppercase tracking-widest">Quest</p>
                <p className="font-['Cinzel'] font-bold text-[var(--gold)]">Complete</p>
              </div>
              <div className="text-center">
                <div className="wax-seal w-12 h-12 text-lg mx-auto mb-2">⚔</div>
                <p className="text-xs font-['Cinzel'] text-[var(--ink-light)] uppercase tracking-widest">Foes</p>
                <p className="font-['Cinzel'] font-bold text-[var(--gold)]">Vanquished</p>
              </div>
            </div>
          )}
          
          {/* Restart button */}
          <button
            onClick={onRestart}
            className={`
              btn-primary px-8 py-4 text-lg
              ${isVictory 
                ? 'hover:animate-glow-pulse' 
                : 'bg-gradient-to-br from-[var(--ink-light)] to-[var(--ink)] hover:from-[var(--burgundy)] hover:to-[var(--burgundy-dark)]'
              }
            `}
          >
            <span className="flex items-center justify-center gap-3">
              <span>{isVictory ? '📜' : '🔄'}</span>
              <span className="font-['Cinzel'] tracking-wider">
                {isVictory ? 'Begin New Chronicle' : 'Rise Again'}
              </span>
            </span>
          </button>
          
          {/* Bottom flourish */}
          <div className="mt-8 text-2xl text-[var(--gold)] opacity-40">
            ❦
          </div>
        </div>
      </div>
      
      {/* Animated particles for victory */}
      {isVictory && showContent && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${3 + (i % 2)}s`,
                opacity: 0.6,
              }}
            >
              ✦
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
