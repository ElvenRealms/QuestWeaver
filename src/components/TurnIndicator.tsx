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
      px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium
      transition-all duration-300 animate-pulse-soft
      ${isPlayerTurn 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
        : 'bg-gradient-to-r from-red-600 to-red-800 text-white'
      }
    `}>
      <span className="text-lg">{current.portrait}</span>
      <span>
        {isPlayerTurn ? 'Your Turn!' : `${current.name}'s Turn`}
      </span>
      <span className="opacity-75 text-xs">
        Round {encounter.round}
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
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {encounter.turnOrder.map((id, index) => {
        const entity = getEntityInfo(id);
        if (!entity) return null;
        
        const isCurrent = id === encounter.currentTurn;
        const hpPercent = (entity.hp.current / entity.hp.max) * 100;
        
        return (
          <div
            key={id}
            className={`
              relative flex flex-col items-center px-2 py-1 rounded-lg min-w-[60px]
              transition-all duration-200
              ${isCurrent 
                ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500 scale-110' 
                : 'bg-stone-100 dark:bg-stone-800/50'
              }
              ${entity.isDefeated ? 'opacity-40 grayscale' : ''}
            `}
          >
            <span className="text-xl">{entity.portrait}</span>
            <span className="text-[10px] font-medium truncate max-w-[50px] text-stone-600 dark:text-stone-400">
              {entity.isPlayer ? 'You' : entity.name.split(' ')[0]}
            </span>
            {/* Mini HP bar */}
            <div className="w-full h-1 bg-stone-300 dark:bg-stone-600 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-green-500' : 
                  hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            {isCurrent && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <span className="text-amber-500 animate-bounce">▼</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
