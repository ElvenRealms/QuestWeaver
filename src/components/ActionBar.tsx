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
        group relative flex flex-col items-center justify-center
        min-w-[80px] min-h-[76px] px-3 py-3 rounded-lg
        transition-all duration-200 touch-target
        font-['Cinzel']
        ${isDisabled 
          ? 'bg-[var(--parchment-dark)] text-[var(--ink-light)] cursor-not-allowed opacity-40' 
          : 'card border-[var(--gold)] hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-98'
        }
      `}
      title={ability?.description}
    >
      <span className={`text-2xl transition-transform duration-200 ${!isDisabled ? 'group-hover:scale-110 group-hover:animate-bounce-soft' : ''}`}>
        {action.icon}
      </span>
      <span className="text-[11px] font-semibold mt-1.5 whitespace-nowrap tracking-wide">
        {action.label}
      </span>
      
      {/* Cooldown indicator - wax seal style */}
      {isOnCooldown && ability && (
        <div className="absolute -top-2 -right-2 wax-seal w-7 h-7 text-xs">
          {ability.currentCooldown}
        </div>
      )}
      
      {/* Ready indicator for abilities - glowing gold */}
      {ability && !isOnCooldown && !disabled && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--gold)] rounded-full shadow-lg animate-pulse-soft border-2 border-[var(--parchment)]" />
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
    <div className="glass border-t-2 border-[var(--gold)] p-4 space-y-3">
      {/* Decorative top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--burgundy)] to-transparent opacity-50" />
      
      {/* Turn status indicator */}
      {!isPlayerTurn && (
        <div className="text-center py-3 bg-[var(--parchment-dark)] rounded-lg border border-[var(--gold)] animate-candlelight">
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg">⏳</span>
            <span className="font-['Cinzel'] text-sm font-semibold text-[var(--ink-light)] tracking-wide">
              The Enemy Acts...
            </span>
          </div>
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
        
        {/* Custom action toggle - quill style */}
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={isDisabled}
          className={`
            group flex flex-col items-center justify-center
            min-w-[80px] min-h-[76px] px-3 py-3 rounded-lg
            transition-all duration-200 touch-target
            font-['Cinzel']
            ${isDisabled 
              ? 'bg-[var(--parchment-dark)] text-[var(--ink-light)] cursor-not-allowed opacity-40' 
              : showCustomInput
                ? 'bg-gradient-to-br from-[var(--burgundy)] to-[var(--burgundy-dark)] text-[var(--parchment)] border-2 border-[var(--gold)] shadow-lg'
                : 'card border-[var(--gold)] hover:shadow-lg hover:-translate-y-1'
            }
          `}
        >
          <span className={`text-2xl transition-transform duration-200 ${!isDisabled && !showCustomInput ? 'group-hover:scale-110' : ''}`}>
            {showCustomInput ? '✍️' : '🪶'}
          </span>
          <span className="text-[11px] font-semibold mt-1.5 tracking-wide">
            {showCustomInput ? 'Writing' : 'Scribe'}
          </span>
        </button>
      </div>

      {/* Custom action input - manuscript style */}
      {showCustomInput && isPlayerTurn && (
        <div className="flex gap-3 animate-fade-in-up">
          <input
            ref={inputRef}
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Inscribe your action upon the chronicle..."
            className="flex-1 px-5 py-4 rounded-lg border-2 border-[var(--gold)] bg-[var(--parchment-light)] text-[var(--ink)] placeholder:text-[var(--ink-light)] placeholder:opacity-50 placeholder:font-['IM_Fell_English'] placeholder:italic focus:outline-none focus:ring-2 focus:ring-[var(--burgundy)] focus:border-transparent text-base touch-target font-['Crimson_Text']"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customInput.trim()}
            className="btn-primary px-6 py-4 min-w-[72px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <span className="text-lg">⚔</span>
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
    <div className="glass border-t-2 border-[var(--gold)] p-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-5 py-4 rounded-lg border-2 border-[var(--gold)] bg-[var(--parchment-light)] text-[var(--ink)] placeholder:text-[var(--ink-light)] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--burgundy)] disabled:opacity-50 text-base touch-target font-['Crimson_Text']"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="btn-primary px-8 py-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⚔
        </button>
      </div>
    </div>
  );
}
