'use client';

import { DiceRoll } from '@/types/game';
import { DiceRoller } from './DiceRoller';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoll: (roll: DiceRoll) => void;
}

export function DiceRollerModal({ isOpen, onClose, onRoll }: DiceRollerModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[var(--ink)]/70 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 animate-bounce-in">
        <div className="card-elevated flourish-corner relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[var(--gold)]/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎲</span>
              <div>
                <h2 className="font-['Cinzel_Decorative'] text-xl font-bold text-[var(--burgundy)]">
                  Dice Chamber
                </h2>
                <p className="text-xs font-['IM_Fell_English'] italic text-[var(--ink-light)]">
                  Cast your fortune upon the winds
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--parchment-dark)] rounded-lg transition-colors touch-target"
              aria-label="Close dice roller"
            >
              <span className="text-xl text-[var(--ink-light)]">✕</span>
            </button>
          </div>
          
          {/* Dice Roller Content */}
          <DiceRoller onRoll={onRoll} />
        </div>
      </div>
    </>
  );
}
