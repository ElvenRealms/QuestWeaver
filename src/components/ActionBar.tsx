'use client';

import { useState, useRef, useEffect } from 'react';
import { QuickAction, Character, Ability } from '@/types/game';
import { getQuickActions } from '@/data/mockData';

interface ActionBarProps {
  character: Character;
  isPlayerTurn: boolean;
  onAction: (action: QuickAction) => void;
  onCustomAction: (text: string) => void;
  disabled?: boolean;
}

function ActionButton({ 
  action, 
  onClick, 
  disabled,
  ability
}: { 
  action: QuickAction; 
  onClick: () => void; 
  disabled: boolean;
  ability?: Ability;
}) {
  const isOnCooldown = ability && ability.currentCooldown > 0;
  const isDisabled = disabled || action.disabled || isOnCooldown;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative flex flex-col items-center justify-center
        min-w-[76px] min-h-[72px] px-3 py-3 rounded-2xl
        transition-all duration-200 touch-target
        ${isDisabled 
          ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-50' 
          : 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-amber-900/40 text-stone-800 dark:text-stone-200 hover:shadow-lg hover:scale-105 active:scale-95 border-2 border-amber-300 dark:border-amber-700 shadow-md'
        }
      `}
      title={ability?.description}
    >
      <span className={`text-2xl ${!isDisabled ? 'group-hover:scale-110' : ''}`}>{action.icon}</span>
      <span className="text-xs font-semibold mt-1 whitespace-nowrap">{action.label}</span>
      
      {/* Cooldown indicator */}
      {isOnCooldown && ability && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-stone-700 dark:bg-stone-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white dark:border-stone-900">
          {ability.currentCooldown}
        </div>
      )}
      
      {/* Ready indicator for abilities */}
      {ability && !isOnCooldown && !disabled && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-md border-2 border-white dark:border-stone-900 animate-pulse" />
      )}
    </button>
  );
}

export function ActionBar({ 
  character, 
  isPlayerTurn, 
  onAction, 
  onCustomAction,
  disabled = false 
}: ActionBarProps) {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const quickActions = getQuickActions(character);
  const isDisabled = disabled || !isPlayerTurn;

  // Focus input when opened
  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onCustomAction(customInput.trim());
      setCustomInput('');
      setShowCustomInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
    if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomInput('');
    }
  };

  // Get ability for action if it's an ability type
  const getAbilityForAction = (action: QuickAction): Ability | undefined => {
    if (action.type === 'ability' && action.abilityId) {
      return character.abilities.find(a => a.id === action.abilityId);
    }
    return undefined;
  };

  return (
    <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-700 p-4 space-y-3 shadow-lg">
      {/* Turn status indicator */}
      {!isPlayerTurn && (
        <div className="text-center text-sm text-stone-500 dark:text-stone-400 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center gap-2 animate-pulse-soft">
          <span className="text-lg">⏳</span>
          <span className="font-medium">Waiting for enemies...</span>
        </div>
      )}

      {/* Quick actions carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide scroll-smooth">
        {quickActions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            onClick={() => onAction(action)}
            disabled={isDisabled}
            ability={getAbilityForAction(action)}
          />
        ))}
        
        {/* Custom action toggle */}
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={isDisabled}
          className={`
            flex flex-col items-center justify-center
            min-w-[76px] min-h-[72px] px-3 py-3 rounded-2xl
            transition-all duration-200 touch-target
            ${isDisabled 
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-50' 
              : showCustomInput
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105 border-2 border-blue-400'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 hover:shadow-lg hover:scale-105 active:scale-95 border-2 border-blue-300 dark:border-blue-700 shadow-md'
            }
          `}
        >
          <span className="text-2xl">{showCustomInput ? '✏️' : '💬'}</span>
          <span className="text-xs font-semibold mt-1">Custom</span>
        </button>
      </div>

      {/* Custom action input */}
      {showCustomInput && isPlayerTurn && (
        <div className="flex gap-3 animate-fade-in">
          <input
            ref={inputRef}
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your action..."
            className="flex-1 px-5 py-4 rounded-2xl border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base touch-target"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customInput.trim()}
            className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 touch-target min-w-[72px]"
          >
            <span className="text-lg">⚔️</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Simplified action bar for non-combat situations
export function SimpleActionInput({ 
  onSubmit, 
  placeholder = "What do you do?",
  disabled = false 
}: { 
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-700 p-4 shadow-lg">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-5 py-4 rounded-2xl border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 text-base touch-target"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 touch-target"
        >
          ⚔️
        </button>
      </div>
    </div>
  );
}
