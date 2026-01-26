// QuestWeaver Game Types
// Based on PLANNING.md specifications

export interface Stats {
  might: number;      // Strength/physical power
  agility: number;    // Dexterity/speed
  wit: number;        // Intelligence/perception
  heart: number;      // Charisma/willpower
}

export interface HP {
  current: number;
  max: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;        // Max turns until usable again
  currentCooldown: number; // Current turns remaining (0 = ready)
  effect: string;          // Description for AI context
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  description: string;
  equipped: boolean;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  stats: Stats;
  hp: HP;
  abilities: Ability[];
  equipment: Equipment[];
  portrait?: string; // Emoji or image URL
}

export interface Enemy {
  id: string;
  name: string;
  hp: HP;
  threat: string;    // Description for AI/player
  abilities: string[];
  portrait?: string; // Emoji
}

export interface Message {
  id: string;
  type: 'narrative' | 'action' | 'roll' | 'system';
  content: string;
  sender: 'dm' | 'player' | 'system';
  timestamp: number;
  rollResult?: DiceRoll;
}

export interface DiceRoll {
  dice: string;       // e.g., "1d20", "2d6"
  results: number[];  // Individual die results
  total: number;
  modifier?: number;
  modifiedTotal?: number;
}

export interface Encounter {
  id: string;
  name: string;
  description: string;
  enemies: Enemy[];
  turnOrder: string[];   // IDs in initiative order
  currentTurn: string;   // ID of whose turn it is
  round: number;
}

export type GameStatus = 'idle' | 'active' | 'victory' | 'defeat';

export interface GameState {
  encounter: Encounter | null;
  character: Character;
  history: Message[];
  status: GameStatus;
  lastSaved?: number;
}

export interface AIResponse {
  narrative: string;
  delta: {
    playerDamage?: number;
    playerHealing?: number;
    enemyDamage?: { enemyId: string; damage: number }[];
    enemyDefeated?: string[];
    abilityUsed?: string;
    cooldownsUpdated?: { abilityId: string; cooldown: number }[];
    turnAdvance?: boolean;
    encounterStatus?: GameStatus;
  };
}

// Quick actions for the action bar
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  type: 'attack' | 'ability' | 'defend' | 'item' | 'custom';
  abilityId?: string;
  disabled?: boolean;
}
