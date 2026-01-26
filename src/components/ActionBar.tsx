'use client';

import { useState } from 'react';
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
        min-w-[70px] px-3 py-2 rounded-xl
        transition-all duration-200
        ${isDisabled 
          ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60' 
          : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-stone-800 dark:text-stone-200 hover:shadow-lg hover:scale-105 active:scale-95 border border-amber-300 dark:border-amber-700'
        }
      `}
      title={ability?.description}
    >
      <span className="text-xl">{action.icon}</span>
      <span className="text-xs font-medium mt-0.5 whitespace-nowrap">{action.label}</span>
      
      {/* Cooldown indicator */}
      {isOnCooldown && ability && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-stone-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {ability.currentCooldown}
        </div>
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
  
  const quickActions = getQuickActions(character);
  const isDisabled = disabled || !isPlayerTurn;

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
  };

  // Get ability for action if it's an ability type
  const getAbilityForAction = (action: QuickAction): Ability | undefined => {
    if (action.type === 'ability' && action.abilityId) {
      return character.abilities.find(a => a.id === action.abilityId);
    }
    return undefined;
  };

  return (
    <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 p-3 space-y-3">
      {/* Turn status */}
      {!isPlayerTurn && (
        <div className="text-center text-sm text-stone-500 dark:text-stone-400 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
          ⏳ Waiting for enemies...
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
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
            min-w-[70px] px-3 py-2 rounded-xl
            transition-all duration-200
            ${isDisabled 
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60' 
              : showCustomInput
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-700'
            }
          `}
        >
          <span className="text-xl">💬</span>
          <span className="text-xs font-medium mt-0.5">Custom</span>
        </button>
      </div>

      {/* Custom action input */}
      {showCustomInput && isPlayerTurn && (
        <div className="flex gap-2 animate-fade-in">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your action..."
            className="flex-1 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customInput.trim()}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
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
    <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 p-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ⚔️
        </button>
      </div>
    </div>
  );
}
