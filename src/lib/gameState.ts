// Game State Management with LocalStorage persistence

import { GameState, Message, Character, Encounter, Enemy, GameStatus } from '@/types/game';
import { INITIAL_GAME_STATE } from '@/data/mockData';

const STORAGE_KEY = 'questweaver-game-state';

/**
 * Load game state from LocalStorage
 */
export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const state = JSON.parse(saved) as GameState;
    console.log('📂 Game state loaded from localStorage');
    return state;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Save game state to LocalStorage
 */
export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stateToSave: GameState = {
      ...state,
      lastSaved: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    console.log('💾 Game state saved');
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

/**
 * Clear saved game state
 */
export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Game state cleared');
}

/**
 * Initialize game state - load from storage or use default
 */
export function initializeGameState(): GameState {
  const saved = loadGameState();
  if (saved) {
    return saved;
  }
  return { ...INITIAL_GAME_STATE };
}

// State update helpers

/**
 * Add a message to the history
 */
export function addMessage(state: GameState, message: Omit<Message, 'id' | 'timestamp'>): GameState {
  const newMessage: Message = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  
  return {
    ...state,
    history: [...state.history, newMessage],
  };
}

/**
 * Update character HP
 */
export function updateCharacterHP(state: GameState, change: number): GameState {
  const newHP = Math.max(0, Math.min(
    state.character.hp.max,
    state.character.hp.current + change
  ));
  
  return {
    ...state,
    character: {
      ...state.character,
      hp: {
        ...state.character.hp,
        current: newHP,
      },
    },
    status: newHP <= 0 ? 'defeat' : state.status,
  };
}

/**
 * Update enemy HP
 */
export function updateEnemyHP(state: GameState, enemyId: string, change: number): GameState {
  if (!state.encounter) return state;
  
  const updatedEnemies = state.encounter.enemies.map(enemy => {
    if (enemy.id !== enemyId) return enemy;
    
    const newHP = Math.max(0, enemy.hp.current + change);
    return {
      ...enemy,
      hp: { ...enemy.hp, current: newHP },
    };
  });
  
  // Check if all enemies are defeated
  const allDefeated = updatedEnemies.every(e => e.hp.current <= 0);
  
  return {
    ...state,
    encounter: {
      ...state.encounter,
      enemies: updatedEnemies,
    },
    status: allDefeated ? 'victory' : state.status,
  };
}

/**
 * Use an ability (set cooldown)
 */
export function useAbility(state: GameState, abilityId: string): GameState {
  const updatedAbilities = state.character.abilities.map(ability => {
    if (ability.id !== abilityId) return ability;
    return {
      ...ability,
      currentCooldown: ability.cooldown,
    };
  });
  
  return {
    ...state,
    character: {
      ...state.character,
      abilities: updatedAbilities,
    },
  };
}

/**
 * Reduce all ability cooldowns by 1 (called at start of player turn)
 */
export function reduceCooldowns(state: GameState): GameState {
  const updatedAbilities = state.character.abilities.map(ability => ({
    ...ability,
    currentCooldown: Math.max(0, ability.currentCooldown - 1),
  }));
  
  return {
    ...state,
    character: {
      ...state.character,
      abilities: updatedAbilities,
    },
  };
}

/**
 * Advance to the next turn
 */
export function advanceTurn(state: GameState): GameState {
  if (!state.encounter) return state;
  
  const { turnOrder, currentTurn } = state.encounter;
  const currentIndex = turnOrder.indexOf(currentTurn);
  const nextIndex = (currentIndex + 1) % turnOrder.length;
  const nextTurn = turnOrder[nextIndex];
  
  // If we've wrapped around, increment the round
  const newRound = nextIndex === 0 
    ? state.encounter.round + 1 
    : state.encounter.round;
  
  return {
    ...state,
    encounter: {
      ...state.encounter,
      currentTurn: nextTurn,
      round: newRound,
    },
  };
}

/**
 * Check if it's the player's turn
 */
export function isPlayerTurn(state: GameState): boolean {
  if (!state.encounter) return false;
  return state.encounter.currentTurn === state.character.id;
}

/**
 * Get the current turn entity (player or enemy)
 */
export function getCurrentTurnEntity(state: GameState): Character | Enemy | null {
  if (!state.encounter) return null;
  
  const { currentTurn, enemies } = state.encounter;
  
  if (currentTurn === state.character.id) {
    return state.character;
  }
  
  return enemies.find(e => e.id === currentTurn) || null;
}

/**
 * Set game status
 */
export function setGameStatus(state: GameState, status: GameStatus): GameState {
  return { ...state, status };
}

/**
 * Reset to initial state
 */
export function resetGame(): GameState {
  clearGameState();
  return { ...INITIAL_GAME_STATE };
}
