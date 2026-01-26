'use client';

import { useState, useCallback } from 'react';
import { DiceRoll } from '@/types/game';
import { rollDice, formatRollResult, isCriticalSuccess, isCriticalFailure } from '@/lib/dice';

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void;
  defaultDice?: string;
}

const DICE_OPTIONS = [
  { notation: '1d4', label: 'D4', color: 'from-purple-500 to-purple-700' },
  { notation: '1d6', label: 'D6', color: 'from-blue-500 to-blue-700' },
  { notation: '1d8', label: 'D8', color: 'from-green-500 to-green-700' },
  { notation: '1d10', label: 'D10', color: 'from-yellow-500 to-yellow-700' },
  { notation: '1d12', label: 'D12', color: 'from-orange-500 to-orange-700' },
  { notation: '1d20', label: 'D20', color: 'from-red-500 to-red-700' },
  { notation: '1d100', label: 'D100', color: 'from-pink-500 to-pink-700' },
];

export function DiceRoller({ onRoll, defaultDice = '1d20' }: DiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState(defaultDice);
  const [modifier, setModifier] = useState(0);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleRoll = useCallback(() => {
    setIsRolling(true);
    setShowResult(false);
    
    // Simulate rolling animation
    const animationDuration = 800;
    const notation = modifier !== 0 
      ? `${selectedDice}${modifier >= 0 ? '+' : ''}${modifier}`
      : selectedDice;
    
    setTimeout(() => {
      const roll = rollDice(notation);
      setLastRoll(roll);
      setIsRolling(false);
      setShowResult(true);
      onRoll?.(roll);
    }, animationDuration);
  }, [selectedDice, modifier, onRoll]);

  const selectedOption = DICE_OPTIONS.find(d => d.notation === selectedDice) || DICE_OPTIONS[5];
  const isCrit = lastRoll && isCriticalSuccess(lastRoll);
  const isFail = lastRoll && isCriticalFailure(lastRoll);

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg p-4 space-y-4">
      {/* Dice selection */}
      <div className="flex flex-wrap justify-center gap-2">
        {DICE_OPTIONS.map((dice) => (
          <button
            key={dice.notation}
            onClick={() => setSelectedDice(dice.notation)}
            className={`
              px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200
              ${selectedDice === dice.notation
                ? `bg-gradient-to-br ${dice.color} text-white shadow-lg scale-110`
                : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:scale-105'
              }
            `}
          >
            {dice.label}
          </button>
        ))}
      </div>

      {/* Modifier input */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setModifier(m => m - 1)}
          className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xl hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
        >
          −
        </button>
        <div className="text-center min-w-[80px]">
          <span className="text-2xl font-mono font-bold text-stone-800 dark:text-stone-200">
            {modifier >= 0 ? '+' : ''}{modifier}
          </span>
          <p className="text-xs text-stone-500">modifier</p>
        </div>
        <button
          onClick={() => setModifier(m => m + 1)}
          className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xl hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
        >
          +
        </button>
      </div>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className={`
          w-full py-4 rounded-xl font-bold text-lg text-white
          bg-gradient-to-br ${selectedOption.color}
          hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200 disabled:opacity-50
          ${isRolling ? 'animate-pulse' : ''}
        `}
      >
        {isRolling ? (
          <span className="inline-flex items-center gap-2">
            <span className="animate-bounce">🎲</span>
            Rolling...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            🎲 Roll {selectedDice}{modifier !== 0 ? `${modifier >= 0 ? '+' : ''}${modifier}` : ''}
          </span>
        )}
      </button>

      {/* Result display */}
      {showResult && lastRoll && (
        <div className={`
          text-center p-4 rounded-xl animate-fade-in
          ${isCrit ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400' :
            isFail ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-400' :
            'bg-stone-100 dark:bg-stone-700'
          }
        `}>
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">
            {lastRoll.dice}
          </div>
          <div className={`
            text-4xl font-bold font-mono
            ${isCrit ? 'text-yellow-600 dark:text-yellow-400' :
              isFail ? 'text-red-600 dark:text-red-400' :
              'text-stone-800 dark:text-stone-200'
            }
          `}>
            {lastRoll.modifiedTotal ?? lastRoll.total}
          </div>
          {lastRoll.results.length > 1 && (
            <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              [{lastRoll.results.join(' + ')}] = {lastRoll.total}
            </div>
          )}
          {isCrit && (
            <div className="text-yellow-600 dark:text-yellow-400 font-bold mt-2 animate-pulse">
              ✨ CRITICAL SUCCESS! ✨
            </div>
          )}
          {isFail && (
            <div className="text-red-600 dark:text-red-400 font-bold mt-2">
              💀 Critical Failure!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline dice roller for quick rolls
export function QuickDiceButton({ 
  notation, 
  label,
  onRoll 
}: { 
  notation: string; 
  label?: string;
  onRoll?: (roll: DiceRoll) => void;
}) {
  const [isRolling, setIsRolling] = useState(false);

  const handleClick = () => {
    setIsRolling(true);
    setTimeout(() => {
      const roll = rollDice(notation);
      setIsRolling(false);
      onRoll?.(roll);
    }, 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRolling}
      className={`
        px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 
        text-purple-700 dark:text-purple-300 font-medium text-sm
        hover:bg-purple-200 dark:hover:bg-purple-900/50
        transition-all duration-200
        ${isRolling ? 'animate-pulse' : ''}
      `}
    >
      🎲 {label || notation}
    </button>
  );
}
