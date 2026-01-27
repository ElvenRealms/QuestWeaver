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
    <header className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-700 sticky top-0 z-30 shadow-sm">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Logo/Title */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-3xl drop-shadow-sm">🏰</span>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-stone-800 dark:text-stone-200 tracking-tight">
              QuestWeaver
            </h1>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 -mt-0.5 font-medium">
              AI Dungeon Master
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
        <div className="flex items-center gap-2 shrink-0">
          {/* Dice roller button */}
          <button
            onClick={onOpenDiceRoller}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-300 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center border border-purple-200 dark:border-purple-800"
            title="Open dice roller"
            aria-label="Open dice roller"
          >
            <span className="text-xl">🎲</span>
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
    </header>
  );
}
