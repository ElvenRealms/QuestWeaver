'use client';

import { useEffect, useRef } from 'react';
import { Message, DiceRoll } from '@/types/game';
import { formatRollResult, isCriticalSuccess, isCriticalFailure } from '@/lib/dice';

interface ChatWindowProps {
  messages: Message[];
}

function RollDisplay({ roll }: { roll: DiceRoll }) {
  const isCrit = isCriticalSuccess(roll);
  const isFail = isCriticalFailure(roll);
  
  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm
      ${isCrit ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 ring-2 ring-yellow-400' : 
        isFail ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 ring-2 ring-red-400' :
        'bg-stone-100 dark:bg-stone-700'}
    `}>
      <span className="text-lg">🎲</span>
      <span className="font-bold">{roll.dice}:</span>
      <span>{formatRollResult(roll)}</span>
      {isCrit && <span className="text-yellow-600 font-bold animate-pulse">CRIT!</span>}
      {isFail && <span className="text-red-600 font-bold">FUMBLE!</span>}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const getMessageStyles = () => {
    switch (message.type) {
      case 'narrative':
        return 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 text-stone-800 dark:text-stone-200';
      case 'action':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-900 dark:text-blue-100 ml-auto max-w-[85%]';
      case 'system':
        return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-center text-sm italic';
      case 'roll':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 text-center';
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
        return '⚙️';
      case 'roll':
        return '🎲';
      default:
        return '';
    }
  };

  return (
    <div className={`
      p-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md
      ${getMessageStyles()}
    `}>
      {message.type === 'narrative' && (
        <div className="flex items-start gap-2">
          <span className="text-xl shrink-0">{getIcon()}</span>
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      )}
      
      {message.type === 'action' && (
        <div className="flex items-start gap-2">
          <p className="leading-relaxed">{message.content}</p>
          <span className="text-lg shrink-0">{getIcon()}</span>
        </div>
      )}
      
      {message.type === 'system' && (
        <p>{message.content}</p>
      )}
      
      {message.type === 'roll' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm">{message.content}</p>
          {message.rollResult && <RollDisplay roll={message.rollResult} />}
        </div>
      )}
    </div>
  );
}

export function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-stone-400">
          <div className="text-center">
            <span className="text-4xl block mb-2">📜</span>
            <p>Your adventure awaits...</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
