'use client';

import { useEffect, useRef, useState } from 'react';
import { Message, DiceRoll } from '@/types/game';
import { formatRollResult, isCriticalSuccess, isCriticalFailure } from '@/lib/dice';

interface ChatWindowProps {
  messages: Message[];
}

function RollDisplay({ roll }: { roll: DiceRoll }) {
  const isCrit = isCriticalSuccess(roll);
  const isFail = isCriticalFailure(roll);
  const [showResult, setShowResult] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`
      inline-flex items-center gap-3 px-5 py-3 rounded-lg font-mono text-sm
      transition-all duration-300 border-2
      ${isCrit 
        ? 'bg-gradient-to-br from-[#F5E08C]/30 to-[#C9A227]/20 border-[#C9A227] animate-glow-pulse' 
        : isFail 
          ? 'bg-gradient-to-br from-[#8B0000]/20 to-[#5C1F2A]/10 border-[#8B0000]' 
          : 'bg-[var(--parchment-light)] border-[var(--copper)]'
      }
    `}>
      <span className={`text-2xl ${showResult ? 'animate-dice-bounce' : ''}`}>🎲</span>
      <span className="font-['Cinzel'] font-semibold text-[var(--ink-light)]">{roll.dice}:</span>
      <span className={`
        dice-result text-2xl font-bold font-['Cinzel_Decorative']
        ${showResult ? 'animate-pop-in' : 'opacity-0'}
        ${isCrit ? 'dice-crit' : isFail ? 'dice-fumble' : 'text-[var(--foreground)]'}
      `}>
        {formatRollResult(roll)}
      </span>
      {isCrit && (
        <span className="text-[var(--gold)] font-['Cinzel'] font-bold text-xs uppercase tracking-widest animate-pulse-soft flex items-center gap-1">
          <span>✦</span> CRITICAL <span>✦</span>
        </span>
      )}
      {isFail && (
        <span className="text-[var(--damage)] font-['Cinzel'] font-bold text-xs uppercase tracking-widest flex items-center gap-1">
          <span>☠</span> FUMBLE
        </span>
      )}
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const getMessageStyles = () => {
    switch (message.type) {
      case 'narrative':
        return 'message-narrative';
      case 'action':
        return 'message-action ml-auto max-w-[85%]';
      case 'system':
        return 'message-system';
      case 'roll':
        return 'message-roll';
      default:
        return 'card';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'narrative':
        return null; // Using CSS pseudo-element instead
      case 'action':
        return '⚔️';
      case 'system':
        return null;
      case 'roll':
        return '🎲';
      default:
        return '';
    }
  };

  const icon = getIcon();

  // Check if narrative starts with a letter (for drop cap)
  const shouldUseDropCap = message.type === 'narrative' && 
    message.content.length > 100 && 
    /^[A-Za-z]/.test(message.content);

  return (
    <div 
      className={`
        transition-all duration-200 hover:shadow-lg
        message-enter
        ${getMessageStyles()}
      `}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {message.type === 'narrative' && (
        <div className="flex items-start gap-3">
          <p className={`leading-relaxed text-[17px] text-[var(--ink)] ${shouldUseDropCap ? 'drop-cap' : ''}`}>
            {message.content}
          </p>
        </div>
      )}
      
      {message.type === 'action' && (
        <div className="flex items-start gap-3 justify-end">
          <p className="leading-relaxed text-[15px] font-medium text-[var(--sepia)]">{message.content}</p>
          <span className="text-xl shrink-0 opacity-80">{icon}</span>
        </div>
      )}
      
      {message.type === 'system' && (
        <p className="py-1 text-xs font-['Cinzel'] font-medium tracking-wider uppercase">{message.content}</p>
      )}
      
      {message.type === 'roll' && (
        <div className="flex flex-col items-center gap-3 py-1">
          <p className="text-sm font-['Cinzel'] font-semibold text-[var(--copper)]">{message.content}</p>
          {message.rollResult && <RollDisplay roll={message.rollResult} />}
        </div>
      )}
    </div>
  );
}

export function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center animate-float card-elevated flourish-corner p-8">
            <span className="text-6xl block mb-4">📜</span>
            <h2 className="font-['Cinzel_Decorative'] text-2xl text-[var(--burgundy)] mb-2">Your Chronicle Awaits</h2>
            <p className="text-[var(--ink-light)] font-['IM_Fell_English'] italic text-lg">
              Every legend begins with a single choice...
            </p>
            <div className="divider-ornate mt-4">
              <span className="text-sm">⚔</span>
            </div>
            <p className="text-sm text-[var(--ink-light)] mt-2 opacity-70">Make your first move, hero</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            index={messages.length - index > 5 ? 0 : messages.length - index} 
          />
        ))
      )}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
