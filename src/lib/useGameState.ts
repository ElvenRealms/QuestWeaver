'use client';

// React hook for game state management

import { useState, useEffect, useCallback } from 'react';
import { GameState, Message, GameStatus } from '@/types/game';
import { DiceRoll } from '@/types/game';
import {
  initializeGameState,
  saveGameState,
  addMessage,
  updateCharacterHP,
  updateEnemyHP,
  useAbility,
  reduceCooldowns,
  advanceTurn,
  isPlayerTurn,
  getCurrentTurnEntity,
  setGameStatus,
  resetGame,
} from './gameState';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state on mount
  useEffect(() => {
    const state = initializeGameState();
    setGameState(state);
    setIsLoading(false);
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    if (gameState && !isLoading) {
      saveGameState(gameState);
    }
  }, [gameState, isLoading]);

  // Action handlers
  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    setGameState(prev => prev ? addMessage(prev, message) : prev);
  }, []);

  const sendNarrative = useCallback((content: string) => {
    sendMessage({ type: 'narrative', content, sender: 'dm' });
  }, [sendMessage]);

  const sendPlayerAction = useCallback((content: string) => {
    sendMessage({ type: 'action', content, sender: 'player' });
  }, [sendMessage]);

  const sendSystemMessage = useCallback((content: string) => {
    sendMessage({ type: 'system', content, sender: 'system' });
  }, [sendMessage]);

  const sendRollMessage = useCallback((content: string, rollResult: DiceRoll) => {
    sendMessage({ type: 'roll', content, sender: 'system', rollResult });
  }, [sendMessage]);

  const damagePlayer = useCallback((amount: number) => {
    setGameState(prev => prev ? updateCharacterHP(prev, -amount) : prev);
  }, []);

  const healPlayer = useCallback((amount: number) => {
    setGameState(prev => prev ? updateCharacterHP(prev, amount) : prev);
  }, []);

  const damageEnemy = useCallback((enemyId: string, amount: number) => {
    setGameState(prev => prev ? updateEnemyHP(prev, enemyId, -amount) : prev);
  }, []);

  const activateAbility = useCallback((abilityId: string) => {
    setGameState(prev => prev ? useAbility(prev, abilityId) : prev);
  }, []);

  const tickCooldowns = useCallback(() => {
    setGameState(prev => prev ? reduceCooldowns(prev) : prev);
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => prev ? advanceTurn(prev) : prev);
  }, []);

  const updateStatus = useCallback((status: GameStatus) => {
    setGameState(prev => prev ? setGameStatus(prev, status) : prev);
  }, []);

  const reset = useCallback(() => {
    setGameState(resetGame());
  }, []);

  return {
    gameState,
    isLoading,
    
    // State checks
    isPlayerTurn: gameState ? isPlayerTurn(gameState) : false,
    currentTurnEntity: gameState ? getCurrentTurnEntity(gameState) : null,
    
    // Actions
    sendMessage,
    sendNarrative,
    sendPlayerAction,
    sendSystemMessage,
    sendRollMessage,
    damagePlayer,
    healPlayer,
    damageEnemy,
    activateAbility,
    tickCooldowns,
    nextTurn,
    updateStatus,
    reset,
  };
}
