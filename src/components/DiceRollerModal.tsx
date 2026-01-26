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
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-bounce-in">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <h2 className="font-bold text-lg flex items-center gap-2">
              🎲 Dice Roller
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Dice roller content */}
          <div className="p-4">
            <DiceRoller onRoll={onRoll} />
          </div>
        </div>
      </div>
    </>
  );
}
