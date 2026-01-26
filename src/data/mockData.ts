// Mock data for testing UI - Pre-made Warrior character and sample encounter

import { Character, Enemy, Encounter, Message, GameState } from '@/types/game';

export const WARRIOR_CHARACTER: Character = {
  id: 'player-1',
  name: 'Thorin Ironforge',
  class: 'Warrior',
  level: 3,
  portrait: '⚔️',
  stats: {
    might: 16,
    agility: 12,
    wit: 10,
    heart: 14,
  },
  hp: {
    current: 28,
    max: 35,
  },
  abilities: [
    {
      id: 'power-strike',
      name: 'Power Strike',
      description: 'A devastating blow that deals extra damage',
      cooldown: 2,
      currentCooldown: 0,
      effect: 'Deal weapon damage + Might modifier. High chance to stagger.',
    },
    {
      id: 'shield-bash',
      name: 'Shield Bash',
      description: 'Slam your shield into an enemy, stunning them',
      cooldown: 3,
      currentCooldown: 1,
      effect: 'Deal minor damage and skip enemy\'s next turn.',
    },
    {
      id: 'rally',
      name: 'Rally',
      description: 'Steel yourself, recovering some health',
      cooldown: 4,
      currentCooldown: 0,
      effect: 'Heal for 2d6 + Heart modifier HP.',
    },
    {
      id: 'intimidate',
      name: 'Intimidating Shout',
      description: 'Let out a fearsome battle cry',
      cooldown: 3,
      currentCooldown: 0,
      effect: 'Enemies have disadvantage on their next attack.',
    },
  ],
  equipment: [
    {
      id: 'longsword',
      name: 'Steel Longsword',
      type: 'weapon',
      description: 'A reliable blade, well-balanced and sharp.',
      equipped: true,
    },
    {
      id: 'shield',
      name: 'Iron Shield',
      type: 'armor',
      description: 'Sturdy shield bearing the mark of the Ironforge clan.',
      equipped: true,
    },
    {
      id: 'chainmail',
      name: 'Chainmail Armor',
      type: 'armor',
      description: 'Interlocking rings provide solid protection.',
      equipped: true,
    },
    {
      id: 'health-potion',
      name: 'Healing Potion',
      type: 'consumable',
      description: 'Restores 2d4+2 HP when consumed.',
      equipped: false,
    },
  ],
};

export const GOBLIN_ENEMIES: Enemy[] = [
  {
    id: 'goblin-1',
    name: 'Goblin Scout',
    portrait: '👺',
    hp: { current: 12, max: 12 },
    threat: 'Quick and sneaky, carries a rusty dagger',
    abilities: ['Sneak Attack', 'Flee'],
  },
  {
    id: 'goblin-2',
    name: 'Goblin Archer',
    portrait: '🏹',
    hp: { current: 8, max: 8 },
    threat: 'Hangs back, pelting you with arrows',
    abilities: ['Aimed Shot', 'Poison Arrow'],
  },
  {
    id: 'goblin-3',
    name: 'Goblin Brute',
    portrait: '👹',
    hp: { current: 18, max: 18 },
    threat: 'Bigger than the others, swings a heavy club',
    abilities: ['Smash', 'Enrage'],
  },
];

export const SAMPLE_ENCOUNTER: Encounter = {
  id: 'goblin-ambush',
  name: 'The Goblin Ambush',
  description: 'A group of goblins has sprung from the bushes along the forest path!',
  enemies: GOBLIN_ENEMIES,
  turnOrder: ['player-1', 'goblin-1', 'goblin-2', 'goblin-3'],
  currentTurn: 'player-1',
  round: 1,
};

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    type: 'narrative',
    content: 'The morning sun filters through the canopy as you walk the forest path. Birds chirp overhead, and a gentle breeze carries the scent of pine and wildflowers. It would be peaceful, if not for the uneasy feeling that you\'re being watched...',
    sender: 'dm',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'msg-2',
    type: 'system',
    content: '⚔️ Encounter started: The Goblin Ambush',
    sender: 'system',
    timestamp: Date.now() - 45000,
  },
  {
    id: 'msg-3',
    type: 'narrative',
    content: 'Suddenly, rustling erupts from the bushes! Three goblins leap onto the path, weapons drawn and yellow eyes gleaming with malice. "Hand over your gold, tall-one!" the largest one snarls.',
    sender: 'dm',
    timestamp: Date.now() - 40000,
  },
  {
    id: 'msg-4',
    type: 'roll',
    content: 'Rolling for initiative...',
    sender: 'system',
    timestamp: Date.now() - 35000,
    rollResult: {
      dice: '1d20',
      results: [17],
      total: 17,
      modifier: 1,
      modifiedTotal: 18,
    },
  },
  {
    id: 'msg-5',
    type: 'system',
    content: '🎯 Turn order set! You act first.',
    sender: 'system',
    timestamp: Date.now() - 30000,
  },
  {
    id: 'msg-6',
    type: 'narrative',
    content: 'The goblins spread out, trying to surround you. The scout crouches low, ready to dart in. The archer nocks an arrow, taking aim. The brute pounds his club against his palm menacingly. What do you do?',
    sender: 'dm',
    timestamp: Date.now() - 20000,
  },
];

export const INITIAL_GAME_STATE: GameState = {
  encounter: SAMPLE_ENCOUNTER,
  character: WARRIOR_CHARACTER,
  history: SAMPLE_MESSAGES,
  status: 'active',
};

// Quick actions based on character abilities
export const getQuickActions = (character: Character) => [
  {
    id: 'attack',
    label: 'Attack',
    icon: '⚔️',
    type: 'attack' as const,
  },
  ...character.abilities.map(ability => ({
    id: ability.id,
    label: ability.name,
    icon: ability.id === 'power-strike' ? '💥' : 
          ability.id === 'shield-bash' ? '🛡️' :
          ability.id === 'rally' ? '💪' : '📢',
    type: 'ability' as const,
    abilityId: ability.id,
    disabled: ability.currentCooldown > 0,
  })),
  {
    id: 'defend',
    label: 'Defend',
    icon: '🛡️',
    type: 'defend' as const,
  },
];
