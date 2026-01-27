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
      px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-3 text-sm font-['Cinzel'] font-bold
      transition-all duration-300 animate-candlelight border-2
      ${isPlayerTurn 
        ? 'bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-dark)] text-[var(--ink)] border-[var(--gold-light)] ring-2 ring-[var(--gold)]/30' 
        : 'bg-gradient-to-r from-[var(--burgundy-dark)] via-[var(--burgundy)] to-[var(--burgundy-dark)] text-[var(--parchment)] border-[var(--burgundy-light)] ring-2 ring-[var(--burgundy)]/30'
      }
    `}>
      <span className={`text-xl ${isPlayerTurn ? 'animate-bounce-soft' : ''}`}>{current.portrait}</span>
      <span className="whitespace-nowrap tracking-wide">
        {isPlayerTurn ? '✦ Your Turn' : `${current.name}'s Turn`}
      </span>
      <span className="text-xs opacity-80 bg-[var(--ink)]/20 px-2 py-0.5 rounded-full">
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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
      {encounter.turnOrder.map((id, index) => {
        const entity = getEntityInfo(id);
        if (!entity) return null;
        
        const isCurrent = id === encounter.currentTurn;
        const hpPercent = Math.max(0, Math.min(100, (entity.hp.current / entity.hp.max) * 100));
        
        return (
          <div
            key={id}
            className={`
              relative flex flex-col items-center px-3 py-2 rounded-lg min-w-[70px]
              transition-all duration-300 ease-out border
              ${isCurrent 
                ? 'bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/10 border-[var(--gold)] scale-110 shadow-md z-10' 
                : 'bg-[var(--parchment)] border-[var(--gold)]/30 hover:bg-[var(--parchment-light)] hover:border-[var(--gold)]/50'
              }
              ${entity.isDefeated ? 'opacity-40 grayscale scale-90' : ''}
            `}
            style={{ 
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {/* Portrait */}
            <span className={`text-2xl ${isCurrent && !entity.isDefeated ? 'animate-bounce-soft' : ''}`}>
              {entity.isDefeated ? '💀' : entity.portrait}
            </span>
            
            {/* Name */}
            <span className="text-[10px] font-['Cinzel'] font-semibold truncate max-w-[55px] text-[var(--ink-light)] mt-0.5">
              {entity.isPlayer ? 'Hero' : entity.name.split(' ')[0]}
            </span>
            
            {/* Mini HP bar */}
            <div className="w-full h-1.5 bg-[var(--parchment-dark)] border border-[var(--gold)]/30 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[var(--burgundy-light)] to-[var(--burgundy)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            
            {/* Current turn indicator */}
            {isCurrent && !entity.isDefeated && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className="text-[var(--gold)] text-sm animate-bounce-soft drop-shadow-md">▼</span>
              </div>
            )}
            
            {/* Player indicator - wax seal style */}
            {entity.isPlayer && !entity.isDefeated && (
              <div className="absolute -top-1 -right-1 wax-seal w-5 h-5 text-[8px]">
                P
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
