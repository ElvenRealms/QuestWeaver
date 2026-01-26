'use client';

import { useState } from 'react';
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
    <div className="flex flex-col items-center p-2 bg-stone-100 dark:bg-stone-700 rounded-lg">
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">{label}</span>
      <span className="text-xl font-bold text-stone-800 dark:text-stone-100">{value}</span>
      <span className={`text-xs font-medium ${mod >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {mod >= 0 ? '+' : ''}{mod}
      </span>
    </div>
  );
}

function AbilityCard({ ability }: { ability: Ability }) {
  const isReady = ability.currentCooldown === 0;
  
  return (
    <div className={`
      p-3 rounded-lg border-2 transition-all duration-200
      ${isReady 
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' 
        : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600 opacity-60'
      }
    `}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-stone-800 dark:text-stone-200">{ability.name}</span>
        {!isReady && (
          <span className="text-xs bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full">
            ⏱️ {ability.currentCooldown}
          </span>
        )}
      </div>
      <p className="text-xs text-stone-600 dark:text-stone-400">{ability.description}</p>
    </div>
  );
}

function EquipmentItem({ item }: { item: Equipment }) {
  const getIcon = () => {
    switch (item.type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'accessory': return '💍';
      case 'consumable': return '🧪';
      default: return '📦';
    }
  };

  return (
    <div className={`
      flex items-center gap-2 p-2 rounded-lg
      ${item.equipped 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-stone-50 dark:bg-stone-800'
      }
    `}>
      <span>{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-stone-800 dark:text-stone-200 block truncate">
          {item.name}
        </span>
        {item.equipped && (
          <span className="text-[10px] text-green-600 dark:text-green-400 uppercase">Equipped</span>
        )}
      </div>
    </div>
  );
}

function HPBar({ current, max }: { current: number; max: number }) {
  const percent = (current / max) * 100;
  const getColor = () => {
    if (percent > 50) return 'bg-green-500';
    if (percent > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">❤️ HP</span>
        <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
          {current} / {max}
        </span>
      </div>
      <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function CharacterSheet({ character, isOpen, onClose }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'equipment'>('stats');

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-stone-900 z-50
        shadow-2xl transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{character.portrait || '⚔️'}</span>
              <div>
                <h2 className="text-xl font-bold">{character.name}</h2>
                <p className="text-amber-100 text-sm">
                  Level {character.level} {character.class}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
          {/* HP Bar */}
          <div className="mt-4">
            <HPBar current={character.hp.current} max={character.hp.max} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-700">
          {(['stats', 'abilities', 'equipment'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-3 text-sm font-medium capitalize transition-colors
                ${activeTab === tab 
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                }
              `}
            >
              {tab === 'stats' && '📊 '}
              {tab === 'abilities' && '✨ '}
              {tab === 'equipment' && '🎒 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Might" value={character.stats.might} icon="💪" />
              <StatBlock label="Agility" value={character.stats.agility} icon="🏃" />
              <StatBlock label="Wit" value={character.stats.wit} icon="🧠" />
              <StatBlock label="Heart" value={character.stats.heart} icon="❤️‍🔥" />
            </div>
          )}

          {activeTab === 'abilities' && (
            <div className="space-y-3">
              {character.abilities.map((ability) => (
                <AbilityCard key={ability.id} ability={ability} />
              ))}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-2">
              {character.equipment.map((item) => (
                <EquipmentItem key={item.id} item={item} />
              ))}
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
  const hpPercent = (character.hp.current / character.hp.max) * 100;
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-stone-200 dark:border-stone-700"
    >
      <span className="text-xl">{character.portrait || '⚔️'}</span>
      <div className="text-left">
        <span className="text-sm font-medium text-stone-800 dark:text-stone-200 block">
          {character.name}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-600 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500">
            {character.hp.current}/{character.hp.max}
          </span>
        </div>
      </div>
    </button>
  );
}
