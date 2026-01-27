'use client';

import { useState, useEffect } from 'react';
import { Character, Ability, Equipment } from '@/types/game';

interface CharacterSheetProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

function StatBlock({ label, value, icon }: { label: string; value: number; icon: string }) {
  const getModifier = (stat: number) => Math.floor((stat - 10) / 2);
  const mod = getModifier(value);
  
  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 card-lift">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-2xl font-black text-stone-800 dark:text-stone-100 mt-1">{value}</span>
      <span className={`
        text-sm font-bold px-2 py-0.5 rounded-full mt-1
        ${mod >= 0 
          ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40' 
          : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40'
        }
      `}>
        {mod >= 0 ? '+' : ''}{mod}
      </span>
    </div>
  );
}

function AbilityCard({ ability, index }: { ability: Ability; index: number }) {
  const isReady = ability.currentCooldown === 0;
  
  return (
    <div 
      className={`
        p-4 rounded-xl border-2 transition-all duration-300 card-lift
        animate-fade-in
        ${isReady 
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-amber-300 dark:border-amber-700 shadow-md' 
          : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600 opacity-70'
        }
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-stone-800 dark:text-stone-200 text-lg">{ability.name}</span>
        {!isReady ? (
          <span className="text-xs bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <span>⏱️</span>
            <span>{ability.currentCooldown} turns</span>
          </span>
        ) : (
          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
            ✓ Ready
          </span>
        )}
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{ability.description}</p>
      <div className="mt-2 text-xs text-stone-500 dark:text-stone-500 italic">
        Cooldown: {ability.cooldown} turns
      </div>
    </div>
  );
}

function EquipmentItem({ item, index }: { item: Equipment; index: number }) {
  const getIcon = () => {
    switch (item.type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'accessory': return '💍';
      case 'consumable': return '🧪';
      default: return '📦';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'weapon': return 'text-red-600 dark:text-red-400';
      case 'armor': return 'text-blue-600 dark:text-blue-400';
      case 'accessory': return 'text-purple-600 dark:text-purple-400';
      case 'consumable': return 'text-green-600 dark:text-green-400';
      default: return 'text-stone-600 dark:text-stone-400';
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all duration-200 card-lift
        animate-fade-in
        ${item.equipped 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 shadow-sm' 
          : 'bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800'
        }
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <span className="text-2xl">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 block truncate">
          {item.name}
        </span>
        <span className={`text-[10px] uppercase tracking-wide font-semibold ${getTypeColor()}`}>
          {item.type}
        </span>
      </div>
      {item.equipped && (
        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold shrink-0">
          Equipped
        </span>
      )}
    </div>
  );
}

function HPBar({ current, max, animate }: { current: number; max: number; animate?: boolean }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const getColor = () => {
    if (percent > 50) return 'from-green-400 to-green-600';
    if (percent > 25) return 'from-yellow-400 to-orange-500';
    return 'from-red-500 to-red-700';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white/90 flex items-center gap-1">
          <span>❤️</span> Health
        </span>
        <span className="text-sm font-black text-white">
          {current} / {max}
        </span>
      </div>
      <div className="h-5 bg-black/30 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`
            h-full rounded-full bg-gradient-to-r ${getColor()} 
            transition-all duration-500 ease-out
            ${animate ? 'animate-hp-decrease' : ''}
          `}
          style={{ width: `${percent}%` }}
        >
          <div className="h-full w-full bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export function CharacterSheet({ character, isOpen, onClose }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'equipment'>('stats');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const tabs = [
    { id: 'stats' as const, label: 'Stats', icon: '📊' },
    { id: 'abilities' as const, label: 'Abilities', icon: '✨' },
    { id: 'equipment' as const, label: 'Gear', icon: '🎒' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-stone-900 z-50
        shadow-2xl transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-5 text-white relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 text-6xl">⚔️</div>
            <div className="absolute bottom-2 left-2 text-4xl">🛡️</div>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                  {character.portrait || '⚔️'}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{character.name}</h2>
                  <p className="text-amber-100 text-sm font-medium">
                    Level {character.level} {character.class}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-colors touch-target"
                aria-label="Close character sheet"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            {/* HP Bar */}
            <HPBar current={character.hp.current} max={character.hp.max} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-4 text-sm font-semibold transition-all duration-200 touch-target
                flex items-center justify-center gap-2
                ${activeTab === tab.id 
                  ? 'text-amber-600 dark:text-amber-400 border-b-3 border-amber-500 bg-white dark:bg-stone-900' 
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Might" value={character.stats.might} icon="💪" />
              <StatBlock label="Agility" value={character.stats.agility} icon="🏃" />
              <StatBlock label="Wit" value={character.stats.wit} icon="🧠" />
              <StatBlock label="Heart" value={character.stats.heart} icon="❤️‍🔥" />
            </div>
          )}

          {activeTab === 'abilities' && (
            <div className="space-y-4">
              {character.abilities.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <span className="text-4xl block mb-2">✨</span>
                  <p>No abilities yet</p>
                </div>
              ) : (
                character.abilities.map((ability, index) => (
                  <AbilityCard key={ability.id} ability={ability} index={index} />
                ))
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-3">
              {character.equipment.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <span className="text-4xl block mb-2">🎒</span>
                  <p>No equipment yet</p>
                </div>
              ) : (
                character.equipment.map((item, index) => (
                  <EquipmentItem key={item.id} item={item} index={index} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Toggle button for opening the sheet
export function CharacterSheetToggle({ 
  character, 
  onClick 
}: { 
  character: Character; 
  onClick: () => void;
}) {
  const hpPercent = Math.max(0, Math.min(100, (character.hp.current / character.hp.max) * 100));
  const getBarColor = () => {
    if (hpPercent > 50) return 'bg-green-500';
    if (hpPercent > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-stone-200 dark:border-stone-700 hover:scale-105 active:scale-95 touch-target min-h-[44px]"
    >
      <span className="text-2xl">{character.portrait || '⚔️'}</span>
      <div className="text-left">
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 block">
          {character.name}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-stone-200 dark:bg-stone-600 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold tabular-nums">
            {character.hp.current}/{character.hp.max}
          </span>
        </div>
      </div>
    </button>
  );
}
