'use client';

import { useState, useCallback, useEffect } from 'react';
import { DiceRoll } from '@/types/game';
import { rollDice, formatRollResult, isCriticalSuccess, isCriticalFailure } from '@/lib/dice';

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void;
  defaultDice?: string;
}

const DICE_OPTIONS = [
  { notation: '1d4', label: 'D4', sides: 4 },
  { notation: '1d6', label: 'D6', sides: 6 },
  { notation: '1d8', label: 'D8', sides: 8 },
  { notation: '1d10', label: 'D10', sides: 10 },
  { notation: '1d12', label: 'D12', sides: 12 },
  { notation: '1d20', label: 'D20', sides: 20 },
  { notation: '1d100', label: 'D100', sides: 100 },
];

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
    <div className={`space-y-5 ${shakeScreen ? 'animate-shake' : ''}`}>
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
              min-w-[52px] min-h-[52px] px-3 py-2 rounded-lg font-['Cinzel'] font-bold text-sm
              transition-all duration-200 touch-target border-2
              ${selectedDice === dice.notation
                ? 'bg-gradient-to-br from-[var(--burgundy)] to-[var(--burgundy-dark)] text-[var(--parchment)] shadow-lg scale-110 border-[var(--gold)]'
                : 'bg-[var(--parchment-light)] border-[var(--gold)]/30 text-[var(--ink)] hover:scale-105 hover:bg-[var(--parchment)] hover:border-[var(--gold)]/60'
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
          className="w-12 h-12 rounded-lg bg-[var(--parchment-light)] border-2 border-[var(--gold)]/30 text-[var(--ink)] font-bold text-2xl hover:bg-[var(--parchment)] hover:border-[var(--gold)] transition-all duration-200 hover:scale-110 active:scale-95 touch-target flex items-center justify-center"
        >
          −
        </button>
        <div className="text-center min-w-[90px]">
          <span className={`
            text-3xl font-['Cinzel_Decorative'] font-bold
            ${modifier > 0 ? 'text-[var(--heal)]' : modifier < 0 ? 'text-[var(--damage)]' : 'text-[var(--ink)]'}
          `}>
            {modifier >= 0 ? '+' : ''}{modifier}
          </span>
          <p className="text-xs text-[var(--ink-light)] font-['IM_Fell_English'] italic mt-1">modifier</p>
        </div>
        <button
          onClick={() => setModifier(m => m + 1)}
          className="w-12 h-12 rounded-lg bg-[var(--parchment-light)] border-2 border-[var(--gold)]/30 text-[var(--ink)] font-bold text-2xl hover:bg-[var(--parchment)] hover:border-[var(--gold)] transition-all duration-200 hover:scale-110 active:scale-95 touch-target flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Roll button */}
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className={`
          w-full py-5 rounded-lg font-['Cinzel'] font-bold text-xl
          btn-primary
          hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
          touch-target min-h-[60px]
          ${isRolling ? 'animate-pulse-soft' : ''}
        `}
      >
        {isRolling ? (
          <span className="inline-flex items-center gap-3">
            <span className="animate-dice-roll inline-block">🎲</span>
            Casting the bones...
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
          text-center p-5 rounded-lg transition-all duration-300 border-2
          ${isCrit 
            ? 'bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/10 border-[var(--gold)] animate-glow-pulse' 
            : isFail 
              ? 'bg-gradient-to-br from-[var(--damage)]/20 to-[var(--damage)]/10 border-[var(--damage)]' 
              : 'bg-[var(--parchment-light)] border-[var(--gold)]/30'
          }
          animate-bounce-in
        `}>
          <div className="text-sm text-[var(--ink-light)] mb-2 font-['Cinzel'] font-medium">
            {lastRoll.dice}
          </div>
          <div className={`
            text-6xl font-['Cinzel_Decorative'] font-bold dice-result
            ${isCrit ? 'dice-crit' :
              isFail ? 'dice-fumble' :
              'text-[var(--burgundy)]'
            }
          `}>
            {lastRoll.modifiedTotal ?? lastRoll.total}
          </div>
          {lastRoll.results.length > 1 && (
            <div className="text-sm text-[var(--ink-light)] mt-2 font-['Crimson_Text']">
              [{lastRoll.results.join(' + ')}] = {lastRoll.total}
              {lastRoll.modifier && ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}`}
            </div>
          )}
          {isCrit && (
            <div className="text-[var(--gold)] font-['Cinzel'] font-bold mt-3 text-lg animate-pulse-soft tracking-widest">
              ✦ CRITICAL SUCCESS ✦
            </div>
          )}
          {isFail && (
            <div className="text-[var(--damage)] font-['Cinzel'] font-bold mt-3 text-lg tracking-widest">
              ☠ Critical Failure
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
        px-4 py-2 rounded-lg border-2 border-[var(--copper)] bg-[var(--parchment-light)]
        text-[var(--copper)] font-['Cinzel'] font-semibold text-sm
        hover:bg-[var(--parchment)] hover:border-[var(--gold)]
        hover:scale-105 active:scale-95
        transition-all duration-200 touch-target min-h-[44px]
        ${isRolling ? 'animate-pulse-soft' : ''}
      `}
    >
      <span className={isRolling ? 'animate-dice-roll inline-block' : ''}>🎲</span>
      {' '}
      {label || notation}
    </button>
  );
}
