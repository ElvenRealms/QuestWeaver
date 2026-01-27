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
    // Small delay to trigger the animation
    const timer = setTimeout(() => setShowResult(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm
      transition-all duration-300
      ${isCrit 
        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-200 ring-2 ring-yellow-400 animate-glow-pulse' 
        : isFail 
          ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-800 dark:text-red-200 ring-2 ring-red-400' 
          : 'bg-stone-100 dark:bg-stone-700/80'
      }
    `}>
      <span className={`text-xl ${showResult ? 'animate-dice-bounce' : ''}`}>🎲</span>
      <span className="font-bold text-stone-600 dark:text-stone-300">{roll.dice}:</span>
      <span className={`
        dice-result text-lg font-bold
        ${showResult ? 'animate-pop-in' : 'opacity-0'}
        ${isCrit ? 'text-yellow-600 dark:text-yellow-400' : isFail ? 'text-red-600 dark:text-red-400' : 'text-stone-800 dark:text-stone-200'}
      `}>
        {formatRollResult(roll)}
      </span>
      {isCrit && (
        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs uppercase tracking-wide animate-pulse">
          ✨ CRIT!
        </span>
      )}
      {isFail && (
        <span className="text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wide">
          💀 FUMBLE
        </span>
      )}
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const getMessageStyles = () => {
    switch (message.type) {
      case 'narrative':
        return 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-l-4 border-amber-500 text-stone-800 dark:text-stone-200 shadow-md';
      case 'action':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border-r-4 border-blue-500 text-blue-900 dark:text-blue-100 ml-auto max-w-[85%] shadow-md';
      case 'system':
        return 'bg-stone-100/80 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 text-center text-sm italic backdrop-blur-sm';
      case 'roll':
        return 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/20 text-purple-900 dark:text-purple-100 text-center shadow-md';
      default:
        return 'bg-white dark:bg-stone-800';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'narrative':
        return '📜';
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

  return (
    <div 
      className={`
        p-4 rounded-xl transition-all duration-200 hover:shadow-lg
        message-enter
        ${getMessageStyles()}
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {message.type === 'narrative' && (
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0 opacity-80">{icon}</span>
          <p className="leading-relaxed whitespace-pre-wrap text-[15px]">{message.content}</p>
        </div>
      )}
      
      {message.type === 'action' && (
        <div className="flex items-start gap-3 justify-end">
          <p className="leading-relaxed text-[15px]">{message.content}</p>
          <span className="text-xl shrink-0 opacity-80">{icon}</span>
        </div>
      )}
      
      {message.type === 'system' && (
        <p className="py-1 text-xs font-medium tracking-wide">{message.content}</p>
      )}
      
      {message.type === 'roll' && (
        <div className="flex flex-col items-center gap-3 py-1">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{message.content}</p>
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
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-stone-400 dark:text-stone-500">
          <div className="text-center animate-float">
            <span className="text-5xl block mb-3">📜</span>
            <p className="text-lg font-medium">Your adventure awaits...</p>
            <p className="text-sm mt-1 opacity-70">Make your first move!</p>
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
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
