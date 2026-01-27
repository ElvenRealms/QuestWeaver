'use client';

import { Character, Enemy, Encounter } from '@/types/game';

interface TurnIndicatorProps {
  encounter: Encounter | null;
  character: Character;
  isPlayerTurn: boolean;
}

export function TurnIndicator({ encounter, character, isPlayerTurn }: TurnIndicatorProps) {
  if (!encounter) return null;

  const getCurrentEntity = () => {
    if (encounter.currentTurn === character.id) {
      return { name: character.name, portrait: character.portrait || '⚔️', isPlayer: true };
    }
    const enemy = encounter.enemies.find(e => e.id === encounter.currentTurn);
    if (enemy) {
      return { name: enemy.name, portrait: enemy.portrait || '👹', isPlayer: false };
    }
    return null;
  };

  const current = getCurrentEntity();
  if (!current) return null;

  return (
    <div className={`
      px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 text-sm font-bold
      transition-all duration-300 animate-turn-pulse
      ${isPlayerTurn 
        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-white ring-2 ring-amber-300/50' 
        : 'bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white ring-2 ring-red-400/50'
      }
    `}>
      <span className={`text-xl ${isPlayerTurn ? 'animate-bounce' : ''}`}>{current.portrait}</span>
      <span className="whitespace-nowrap">
        {isPlayerTurn ? '⚔️ Your Turn!' : `${current.name}'s Turn`}
      </span>
      <span className="text-xs opacity-80 bg-black/20 px-2 py-0.5 rounded-full">
        R{encounter.round}
      </span>
    </div>
  );
}

interface TurnOrderProps {
  encounter: Encounter | null;
  character: Character;
}

export function TurnOrder({ encounter, character }: TurnOrderProps) {
  if (!encounter) return null;

  const getEntityInfo = (id: string) => {
    if (id === character.id) {
      return { 
        name: character.name, 
        portrait: character.portrait || '⚔️', 
        hp: character.hp,
        isPlayer: true,
        isDefeated: character.hp.current <= 0
      };
    }
    const enemy = encounter.enemies.find(e => e.id === id);
    if (enemy) {
      return { 
        name: enemy.name, 
        portrait: enemy.portrait || '👹', 
        hp: enemy.hp,
        isPlayer: false,
        isDefeated: enemy.hp.current <= 0
      };
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
      {encounter.turnOrder.map((id, index) => {
        const entity = getEntityInfo(id);
        if (!entity) return null;
        
        const isCurrent = id === encounter.currentTurn;
        const hpPercent = Math.max(0, Math.min(100, (entity.hp.current / entity.hp.max) * 100));
        
        const getHpColor = () => {
          if (hpPercent > 50) return 'bg-green-500';
          if (hpPercent > 25) return 'bg-yellow-500';
          return 'bg-red-500';
        };
        
        return (
          <div
            key={id}
            className={`
              relative flex flex-col items-center px-3 py-2 rounded-xl min-w-[68px]
              transition-all duration-300 ease-out
              ${isCurrent 
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/40 ring-2 ring-amber-500 scale-110 shadow-md z-10' 
                : 'bg-stone-100/80 dark:bg-stone-800/60 hover:bg-stone-200 dark:hover:bg-stone-700'
              }
              ${entity.isDefeated ? 'opacity-40 grayscale scale-90' : ''}
            `}
            style={{ 
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {/* Portrait */}
            <span className={`text-2xl ${isCurrent && !entity.isDefeated ? 'animate-bounce' : ''}`}>
              {entity.isDefeated ? '💀' : entity.portrait}
            </span>
            
            {/* Name */}
            <span className="text-[10px] font-semibold truncate max-w-[55px] text-stone-600 dark:text-stone-400 mt-0.5">
              {entity.isPlayer ? 'You' : entity.name.split(' ')[0]}
            </span>
            
            {/* Mini HP bar */}
            <div className="w-full h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full mt-1.5 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${getHpColor()}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            
            {/* Current turn indicator */}
            {isCurrent && !entity.isDefeated && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className="text-amber-500 text-sm animate-bounce drop-shadow-md">▼</span>
              </div>
            )}
            
            {/* Player indicator */}
            {entity.isPlayer && !entity.isDefeated && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-stone-900">
                <span className="text-[8px] text-white font-bold">P</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
