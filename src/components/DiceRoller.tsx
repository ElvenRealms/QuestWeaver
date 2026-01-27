'use client';

import { useState, useCallback, useEffect } from 'react';
import { DiceRoll } from '@/types/game';
import { rollDice, formatRollResult, isCriticalSuccess, isCriticalFailure } from '@/lib/dice';

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void;
  defaultDice?: string;
}

const DICE_OPTIONS = [
  { notation: '1d4', label: 'D4', sides: 4, color: 'from-purple-500 to-purple-700' },
  { notation: '1d6', label: 'D6', sides: 6, color: 'from-blue-500 to-blue-700' },
  { notation: '1d8', label: 'D8', sides: 8, color: 'from-green-500 to-green-700' },
  { notation: '1d10', label: 'D10', sides: 10, color: 'from-yellow-500 to-yellow-700' },
  { notation: '1d12', label: 'D12', sides: 12, color: 'from-orange-500 to-orange-700' },
  { notation: '1d20', label: 'D20', sides: 20, color: 'from-red-500 to-red-700' },
  { notation: '1d100', label: 'D100', sides: 100, color: 'from-pink-500 to-pink-700' },
];

function RollingDice({ sides, isRolling }: { sides: number; isRolling: boolean }) {
  const [displayNumber, setDisplayNumber] = useState(sides);
  
  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * sides) + 1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRolling, sides]);
  
  return (
    <div className={`
      w-24 h-24 flex items-center justify-center
      bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800
      rounded-xl shadow-lg border-2 border-stone-300 dark:border-stone-600
      font-mono text-4xl font-black text-stone-700 dark:text-stone-200
      ${isRolling ? 'animate-dice-roll' : ''}
    `}>
      {isRolling ? displayNumber : '?'}
    </div>
  );
}

export function DiceRoller({ onRoll, defaultDice = '1d20' }: DiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState(defaultDice);
  const [modifier, setModifier] = useState(0);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  const handleRoll = useCallback(() => {
    setIsRolling(true);
    setShowResult(false);
    setShakeScreen(false);
    
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
      
      // Shake on crit or fail
      if (isCriticalSuccess(roll) || isCriticalFailure(roll)) {
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);
      }
      
      onRoll?.(roll);
    }, animationDuration);
  }, [selectedDice, modifier, onRoll]);

  const selectedOption = DICE_OPTIONS.find(d => d.notation === selectedDice) || DICE_OPTIONS[5];
  const isCrit = lastRoll && isCriticalSuccess(lastRoll);
  const isFail = lastRoll && isCriticalFailure(lastRoll);

  return (
    <div className={`
      bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-5 space-y-5
      ${shakeScreen ? 'animate-shake-intense' : ''}
    `}>
      {/* Dice selection grid */}
      <div className="flex flex-wrap justify-center gap-2">
        {DICE_OPTIONS.map((dice) => (
          <button
            key={dice.notation}
            onClick={() => {
              setSelectedDice(dice.notation);
              setShowResult(false);
            }}
            className={`
              min-w-[52px] min-h-[52px] px-3 py-2 rounded-xl font-bold text-sm
              transition-all duration-200 touch-target
              ${selectedDice === dice.notation
                ? `bg-gradient-to-br ${dice.color} text-white shadow-lg scale-110 ring-2 ring-white/30`
                : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:scale-105 hover:bg-stone-200 dark:hover:bg-stone-600'
              }
            `}
          >
            {dice.label}
          </button>
        ))}
      </div>

      {/* Modifier controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setModifier(m => m - 1)}
          className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-2xl hover:bg-stone-200 dark:hover:bg-stone-600 transition-all duration-200 hover:scale-110 active:scale-95 touch-target flex items-center justify-center"
        >
          −
        </button>
        <div className="text-center min-w-[90px]">
          <span className={`
            text-3xl font-mono font-black 
            ${modifier > 0 ? 'text-green-600 dark:text-green-400' : modifier < 0 ? 'text-red-600 dark:text-red-400' : 'text-stone-800 dark:text-stone-200'}
          `}>
            {modifier >= 0 ? '+' : ''}{modifier}
          </span>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">modifier</p>
        </div>
        <button
          onClick={() => setModifier(m => m + 1)}
          className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-2xl hover:bg-stone-200 dark:hover:bg-stone-600 transition-all duration-200 hover:scale-110 active:scale-95 touch-target flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className={`
          w-full py-5 rounded-2xl font-bold text-xl text-white
          bg-gradient-to-br ${selectedOption.color}
          hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
          touch-target min-h-[60px]
          ${isRolling ? 'animate-pulse' : ''}
        `}
      >
        {isRolling ? (
          <span className="inline-flex items-center gap-3">
            <span className="animate-dice-bounce inline-block">🎲</span>
            Rolling...
          </span>
        ) : (
          <span className="inline-flex items-center gap-3">
            🎲 Roll {selectedDice}{modifier !== 0 ? `${modifier >= 0 ? '+' : ''}${modifier}` : ''}
          </span>
        )}
      </button>

      {/* Result display */}
      {showResult && lastRoll && (
        <div className={`
          text-center p-5 rounded-2xl transition-all duration-300
          ${isCrit 
            ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 ring-4 ring-yellow-400 animate-glow-pulse' 
            : isFail 
              ? 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 ring-4 ring-red-400' 
              : 'bg-stone-100 dark:bg-stone-700/80'
          }
          animate-bounce-in
        `}>
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-2 font-medium">
            {lastRoll.dice}
          </div>
          <div className={`
            text-6xl font-black font-mono dice-result
            ${isCrit ? 'text-yellow-600 dark:text-yellow-400' :
              isFail ? 'text-red-600 dark:text-red-400' :
              'text-stone-800 dark:text-stone-200'
            }
          `}>
            {lastRoll.modifiedTotal ?? lastRoll.total}
          </div>
          {lastRoll.results.length > 1 && (
            <div className="text-sm text-stone-500 dark:text-stone-400 mt-2 font-mono">
              [{lastRoll.results.join(' + ')}] = {lastRoll.total}
              {lastRoll.modifier && ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}`}
            </div>
          )}
          {isCrit && (
            <div className="text-yellow-600 dark:text-yellow-400 font-black mt-3 text-lg animate-pulse tracking-wide">
              ✨ CRITICAL SUCCESS! ✨
            </div>
          )}
          {isFail && (
            <div className="text-red-600 dark:text-red-400 font-black mt-3 text-lg tracking-wide">
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
        px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 
        text-purple-700 dark:text-purple-300 font-semibold text-sm
        hover:bg-purple-200 dark:hover:bg-purple-900/50
        hover:scale-105 active:scale-95
        transition-all duration-200 touch-target min-h-[44px]
        ${isRolling ? 'animate-pulse' : ''}
      `}
    >
      <span className={isRolling ? 'animate-dice-roll inline-block' : ''}>🎲</span>
      {' '}
      {label || notation}
    </button>
  );
}
