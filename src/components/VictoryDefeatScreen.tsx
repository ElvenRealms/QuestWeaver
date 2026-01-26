'use client';

import { GameStatus } from '@/types/game';

interface VictoryDefeatScreenProps {
  status: GameStatus;
  onRestart: () => void;
}

export function VictoryDefeatScreen({ status, onRestart }: VictoryDefeatScreenProps) {
  if (status !== 'victory' && status !== 'defeat') return null;

  const isVictory = status === 'victory';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className={`
        absolute inset-0 
        ${isVictory 
          ? 'bg-gradient-to-br from-yellow-500/90 to-amber-600/90' 
          : 'bg-gradient-to-br from-red-900/90 to-stone-900/90'
        }
      `} />
      
      {/* Content */}
      <div className="relative text-center animate-bounce-in">
        {/* Icon */}
        <div className="text-8xl mb-4 animate-bounce">
          {isVictory ? '🏆' : '💀'}
        </div>
        
        {/* Title */}
        <h1 className={`
          text-4xl font-bold mb-2
          ${isVictory ? 'text-yellow-100' : 'text-red-200'}
        `}>
          {isVictory ? 'VICTORY!' : 'DEFEAT'}
        </h1>
        
        {/* Subtitle */}
        <p className={`
          text-lg mb-8 max-w-md mx-auto
          ${isVictory ? 'text-amber-100' : 'text-stone-300'}
        `}>
          {isVictory 
            ? 'The enemies have fallen! Your legend grows stronger.' 
            : 'You have fallen in battle. But every hero can rise again...'}
        </p>
        
        {/* Stats teaser (placeholder for future) */}
        <div className={`
          grid grid-cols-2 gap-4 mb-8 p-4 rounded-xl max-w-xs mx-auto
          ${isVictory ? 'bg-white/10' : 'bg-black/20'}
        `}>
          <div>
            <div className="text-2xl font-bold text-white">3</div>
            <div className={`text-xs ${isVictory ? 'text-amber-200' : 'text-stone-400'}`}>
              Enemies Defeated
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">7</div>
            <div className={`text-xs ${isVictory ? 'text-amber-200' : 'text-stone-400'}`}>
              Rounds Survived
            </div>
          </div>
        </div>
        
        {/* Action button */}
        <button
          onClick={onRestart}
          className={`
            px-8 py-4 rounded-xl font-bold text-lg
            transition-all duration-200 hover:scale-105 active:scale-95
            ${isVictory 
              ? 'bg-white text-amber-700 hover:bg-amber-50' 
              : 'bg-red-600 text-white hover:bg-red-500'
            }
          `}
        >
          {isVictory ? '⚔️ Continue Adventure' : '🔄 Try Again'}
        </button>
      </div>
    </div>
  );
}
