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
    <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 sticky top-0 z-30">
      {/* Main header row */}
      <div className="flex items-center justify-between px-3 py-2 gap-2">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏰</span>
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-200 hidden sm:block">
            QuestWeaver
          </h1>
        </div>

        {/* Turn indicator */}
        {encounter && (
          <TurnIndicator 
            encounter={encounter} 
            character={character} 
            isPlayerTurn={isPlayerTurn} 
          />
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Dice roller button */}
          <button
            onClick={onOpenDiceRoller}
            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            title="Open dice roller"
          >
            🎲
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
        <div className="px-3 pb-2">
          <TurnOrder encounter={encounter} character={character} />
        </div>
      )}
    </header>
  );
}
