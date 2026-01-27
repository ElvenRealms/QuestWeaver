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
    <div className="flex flex-col items-center p-4 card card-lift">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-[10px] text-[var(--ink-light)] uppercase tracking-widest font-['Cinzel'] font-semibold">{label}</span>
      <span className="text-3xl font-['Cinzel_Decorative'] font-bold text-[var(--burgundy)] mt-1">{value}</span>
      <span className={`
        text-sm font-['Cinzel'] font-bold px-3 py-1 rounded-full mt-2 border
        ${mod >= 0 
          ? 'text-[var(--heal)] bg-[var(--heal)]/10 border-[var(--heal)]/30' 
          : 'text-[var(--damage)] bg-[var(--damage)]/10 border-[var(--damage)]/30'
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
        p-4 rounded-lg border-2 transition-all duration-300 card-lift
        animate-fade-in
        ${isReady 
          ? 'bg-gradient-to-br from-[var(--gold)]/10 to-[var(--burgundy)]/5 border-[var(--gold)] shadow-md' 
          : 'bg-[var(--parchment-dark)] border-[var(--ink-light)]/30 opacity-60'
        }
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-['Cinzel'] font-bold text-[var(--burgundy)] text-lg">{ability.name}</span>
        {!isReady ? (
          <div className="wax-seal w-8 h-8 text-xs">
            {ability.currentCooldown}
          </div>
        ) : (
          <span className="text-xs bg-[var(--gold)] text-[var(--parchment)] px-3 py-1 rounded-full font-['Cinzel'] font-semibold">
            ✓ Ready
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--ink)] font-['Crimson_Text'] leading-relaxed">{ability.description}</p>
      <div className="mt-3 text-xs text-[var(--ink-light)] font-['IM_Fell_English'] italic flex items-center gap-2">
        <span>⏱</span>
        <span>Cooldown: {ability.cooldown} turns</span>
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
      case 'weapon': return 'text-[var(--damage)]';
      case 'armor': return 'text-[#4A6FA5]';
      case 'accessory': return 'text-[#8B5A8B]';
      case 'consumable': return 'text-[var(--heal)]';
      default: return 'text-[var(--ink-light)]';
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all duration-200 card-lift
        animate-fade-in border
        ${item.equipped 
          ? 'bg-gradient-to-r from-[var(--gold)]/10 to-[var(--gold)]/5 border-[var(--gold)] shadow-sm' 
          : 'bg-[var(--parchment-light)] border-[var(--gold)]/30 hover:bg-[var(--parchment)]'
        }
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <span className="text-2xl">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-['Cinzel'] font-semibold text-[var(--ink)] block truncate">
          {item.name}
        </span>
        <span className={`text-[10px] uppercase tracking-widest font-['Cinzel'] font-semibold ${getTypeColor()}`}>
          {item.type}
        </span>
      </div>
      {item.equipped && (
        <span className="text-xs bg-[var(--gold)] text-[var(--parchment)] px-2 py-1 rounded-full font-['Cinzel'] font-semibold shrink-0">
          Equipped
        </span>
      )}
    </div>
  );
}

function HPBar({ current, max }: { current: number; max: number }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-['Cinzel'] font-semibold text-[var(--parchment)] flex items-center gap-2">
          <span>❤️</span> Vitality
        </span>
        <span className="text-sm font-['Cinzel_Decorative'] font-bold text-[var(--parchment)]">
          {current} / {max}
        </span>
      </div>
      <div className="hp-bar h-6">
        <div className="hp-bar-fill" style={{ width: `${percent}%` }} />
        <div className="hp-bar-text">
          {Math.round(percent)}%
        </div>
      </div>
    </div>
  );
}

export function CharacterSheet({ character, isOpen, onClose }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'equipment'>('stats');

  const tabs = [
    { id: 'stats' as const, label: 'Attributes', icon: '📊' },
    { id: 'abilities' as const, label: 'Abilities', icon: '✨' },
    { id: 'equipment' as const, label: 'Arsenal', icon: '🎒' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-[var(--ink)]/70 backdrop-blur-sm z-40 transition-all duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md z-50
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
        bg-[var(--parchment)]
        border-l-2 border-[var(--gold)]
      `}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[var(--burgundy)] via-[var(--burgundy-dark)] to-[#3D1520] p-5 text-[var(--parchment)] relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 text-6xl">⚔️</div>
            <div className="absolute bottom-2 left-2 text-4xl">🛡️</div>
          </div>
          
          {/* Gold border accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl bg-[var(--parchment)]/20 rounded-lg p-2 backdrop-blur-sm border border-[var(--gold)]/30">
                  {character.portrait || '⚔️'}
                </div>
                <div>
                  <h2 className="font-['Cinzel_Decorative'] text-2xl font-bold tracking-wide">{character.name}</h2>
                  <p className="text-[var(--gold-light)] text-sm font-['IM_Fell_English'] italic">
                    Level {character.level} {character.class}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-[var(--parchment)]/20 rounded-full transition-colors touch-target"
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
        <div className="flex border-b-2 border-[var(--gold)] bg-[var(--parchment-dark)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-4 text-sm font-['Cinzel'] font-semibold transition-all duration-200 touch-target
                flex items-center justify-center gap-2
                ${activeTab === tab.id 
                  ? 'text-[var(--burgundy)] border-b-3 border-[var(--burgundy)] bg-[var(--parchment)]' 
                  : 'text-[var(--ink-light)] hover:text-[var(--ink)] hover:bg-[var(--parchment)]/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 scroll-smooth parchment-bg">
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
                <div className="text-center py-8 text-[var(--ink-light)] card-elevated">
                  <span className="text-4xl block mb-2">✨</span>
                  <p className="font-['IM_Fell_English'] italic">No abilities discovered yet</p>
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
                <div className="text-center py-8 text-[var(--ink-light)] card-elevated">
                  <span className="text-4xl block mb-2">🎒</span>
                  <p className="font-['IM_Fell_English'] italic">Your pack lies empty</p>
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
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 card card-lift touch-target min-h-[44px]"
    >
      <span className="text-2xl">{character.portrait || '⚔️'}</span>
      <div className="text-left">
        <span className="text-sm font-['Cinzel'] font-semibold text-[var(--ink)] block">
          {character.name}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-[var(--parchment-dark)] border border-[var(--gold)]/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[var(--burgundy-light)] to-[var(--burgundy)] transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--ink-light)] font-['Cinzel'] font-semibold tabular-nums">
            {character.hp.current}/{character.hp.max}
          </span>
        </div>
      </div>
    </button>
  );
}
