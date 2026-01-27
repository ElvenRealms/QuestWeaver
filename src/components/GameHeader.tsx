'use client';

import { Character, Encounter } from '@/types/game';
import { CharacterSheetToggle } from './CharacterSheet';
import { TurnIndicator, TurnOrder } from './TurnIndicator';

interface GameHeaderProps {
  character: Character;
  encounter: Encounter | null;
  isPlayerTurn: boolean;
  onOpenCharacterSheet: () => void;
  onOpenDiceRoller: () => void;
}

export function GameHeader({
  character,
  encounter,
  isPlayerTurn,
  onOpenCharacterSheet,
  onOpenDiceRoller,
}: GameHeaderProps) {
  return (
    <header className="glass sticky top-0 z-30 border-b-2 border-[var(--gold)]">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-60" />
      
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Logo/Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="wax-seal text-lg">Q</div>
          <div className="hidden sm:block">
            <h1 className="font-['Cinzel_Decorative'] text-xl font-bold text-[var(--burgundy)] tracking-wide">
              QuestWeaver
            </h1>
            <p className="text-[10px] text-[var(--ink-light)] font-['IM_Fell_English'] italic -mt-0.5">
              Chronicle Your Legend
            </p>
          </div>
        </div>

        {/* Turn indicator (centered) */}
        {encounter && (
          <div className="flex-1 flex justify-center px-2">
            <TurnIndicator 
              encounter={encounter} 
              character={character} 
              isPlayerTurn={isPlayerTurn} 
            />
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dice roller button */}
          <button
            onClick={onOpenDiceRoller}
            className="btn-icon group"
            title="Open dice roller"
            aria-label="Open dice roller"
          >
            <span className="text-xl group-hover:animate-dice-roll">🎲</span>
          </button>
          
          {/* Character sheet toggle */}
          <CharacterSheetToggle 
            character={character} 
            onClick={onOpenCharacterSheet} 
          />
        </div>
      </div>

      {/* Turn order bar (only in encounter) */}
      {encounter && (
        <div className="px-4 pb-3 -mt-1">
          <TurnOrder encounter={encounter} character={character} />
        </div>
      )}
      
      {/* Decorative bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--burgundy)] to-transparent opacity-30" />
    </header>
  );
}
