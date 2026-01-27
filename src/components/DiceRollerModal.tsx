'use client';

import { DiceRoller } from './DiceRoller';
import { DiceRoll } from '@/types/game';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoll?: (roll: DiceRoll) => void;
}

export function DiceRollerModal({ isOpen, onClose, onRoll }: DiceRollerModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-bounce-in">
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-700">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white">
            <h2 className="font-bold text-xl flex items-center gap-3">
              <span className="text-2xl animate-dice-bounce">🎲</span>
              <span>Dice Roller</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
              aria-label="Close dice roller"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
          
          {/* Dice roller content */}
          <div className="p-5">
            <DiceRoller onRoll={onRoll} />
          </div>
          
          {/* Footer hint */}
          <div className="px-5 pb-4 text-center">
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Tip: Roll D20 + modifier for attacks and skill checks
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
