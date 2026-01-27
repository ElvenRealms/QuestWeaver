'use client';

import { useState, useCallback, useRef } from 'react';
import { useGameState } from '@/lib/useGameState';
import { GameHeader } from '@/components/GameHeader';
import { ChatWindow } from '@/components/ChatWindow';
import { CharacterSheet } from '@/components/CharacterSheet';
import { ActionBar } from '@/components/ActionBar';
import { DiceRollerModal } from '@/components/DiceRollerModal';
import { VictoryDefeatScreen } from '@/components/VictoryDefeatScreen';
import { QuickAction, DiceRoll, AIResponse, GameState } from '@/types/game';
import { rollD20, formatRollResult } from '@/lib/dice';

// Call the AI API
async function callGameAI(
  gameState: GameState,
  action: string,
  rollResult?: { total: number; modifiedTotal?: number; dice: string },
  isEnemyTurn?: boolean,
  enemyId?: string
): Promise<AIResponse> {
  const response = await fetch('/api/game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameState,
      action,
      rollResult,
      isEnemyTurn,
      enemyId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('API call failed');
  }
  
  return response.json();
}

export default function GamePage() {
  const {
    gameState,
    isLoading,
    isPlayerTurn,
    sendPlayerAction,
    sendNarrative,
    sendSystemMessage,
    sendRollMessage,
    damageEnemy,
    damagePlayer,
    healPlayer,
    activateAbility,
    tickCooldowns,
    nextTurn,
    updateStatus,
    reset,
  } = useGameState();

  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track if we're in the middle of enemy turns
  const processingEnemyTurns = useRef(false);

  // Apply AI response delta to game state
  const applyAIDelta = useCallback((response: AIResponse) => {
    const { delta } = response;
    
    // Apply player damage
    if (delta.playerDamage && delta.playerDamage > 0) {
      damagePlayer(delta.playerDamage);
    }
    
    // Apply player healing
    if (delta.playerHealing && delta.playerHealing > 0) {
      healPlayer(delta.playerHealing);
    }
    
    // Apply enemy damage
    if (delta.enemyDamage) {
      delta.enemyDamage.forEach(({ enemyId, damage }) => {
        damageEnemy(enemyId, damage);
      });
    }
    
    // Handle ability usage
    if (delta.abilityUsed) {
      activateAbility(delta.abilityUsed);
    }
    
    // Check encounter status
    if (delta.encounterStatus === 'victory' || delta.encounterStatus === 'defeat') {
      updateStatus(delta.encounterStatus);
    }
  }, [damagePlayer, healPlayer, damageEnemy, activateAbility, updateStatus]);

  // Process enemy turns automatically
  const processEnemyTurns = useCallback(async (currentState: GameState) => {
    if (!currentState.encounter || currentState.status !== 'active') return;
    if (processingEnemyTurns.current) return;
    
    processingEnemyTurns.current = true;
    
    // Get living enemies who need to act
    const livingEnemies = currentState.encounter.enemies.filter(e => e.hp.current > 0);
    
    // Process each enemy turn
    for (const enemy of livingEnemies) {
      // Check if game ended
      if (currentState.status !== 'active') break;
      
      // Small delay between enemy actions for drama
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        sendSystemMessage(`🎯 ${enemy.name}'s turn...`);
        
        const response = await callGameAI(
          currentState,
          '',
          undefined,
          true,
          enemy.id
        );
        
        // Display the narrative
        sendNarrative(response.narrative);
        
        // Apply the delta
        applyAIDelta(response);
        
        // Check for defeat
        if (response.delta.encounterStatus === 'defeat') {
          processingEnemyTurns.current = false;
          return;
        }
        
      } catch (error) {
        console.error('Enemy turn failed:', error);
        sendNarrative(`The ${enemy.name} hesitates, confused by the chaos of battle.`);
      }
      
      // Advance turn
      nextTurn();
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // All enemies done - tick cooldowns at start of player turn
    tickCooldowns();
    sendSystemMessage(`⚔️ Your turn, hero!`);
    
    processingEnemyTurns.current = false;
  }, [sendNarrative, sendSystemMessage, applyAIDelta, nextTurn, tickCooldowns]);

  // Handle quick action button clicks
  const handleAction = useCallback(async (action: QuickAction) => {
    if (!gameState || !isPlayerTurn || isProcessing) return;
    if (gameState.status !== 'active') return;
    
    setIsProcessing(true);
    
    try {
      // Roll dice for the action
      let roll: DiceRoll | undefined;
      let actionDescription = '';
      
      switch (action.type) {
        case 'attack': {
          // Roll to attack with Might modifier
          const mightMod = Math.floor((gameState.character.stats.might - 10) / 2);
          roll = rollD20(mightMod);
          sendRollMessage(`⚔️ Attack roll!`, roll);
          actionDescription = `Attacks with ${gameState.character.equipment.find(e => e.type === 'weapon')?.name || 'weapon'}`;
          break;
        }
        
        case 'ability': {
          const ability = gameState.character.abilities.find(a => a.id === action.abilityId);
          if (!ability || ability.currentCooldown > 0) {
            sendSystemMessage(`❌ ${action.label} is not ready yet!`);
            setIsProcessing(false);
            return;
          }
          
          // Roll for ability
          const statMod = Math.floor((gameState.character.stats.might - 10) / 2);
          roll = rollD20(statMod);
          sendRollMessage(`💥 ${ability.name}!`, roll);
          actionDescription = `Uses ${ability.name}: ${ability.effect}`;
          break;
        }
        
        case 'defend': {
          actionDescription = 'Takes a defensive stance, bracing for attacks';
          sendPlayerAction(`🛡️ Defending...`);
          break;
        }
        
        default:
          actionDescription = action.label;
          sendPlayerAction(action.label);
      }
      
      // Small delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call AI for result
      const response = await callGameAI(
        gameState,
        actionDescription,
        roll ? {
          total: roll.total,
          modifiedTotal: roll.modifiedTotal,
          dice: roll.dice,
        } : undefined
      );
      
      // Display narrative
      sendNarrative(response.narrative);
      
      // Apply game state changes
      applyAIDelta(response);
      
      // Check for victory
      if (response.delta.encounterStatus === 'victory') {
        setIsProcessing(false);
        return;
      }
      
      // Advance turn
      nextTurn();
      
      // Small delay then process enemy turns
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Process enemy turns
      await processEnemyTurns(gameState);
      
    } catch (error) {
      console.error('Action failed:', error);
      sendNarrative('The chaos of battle swirls around you... (try again)');
    } finally {
      setIsProcessing(false);
    }
  }, [gameState, isPlayerTurn, isProcessing, sendPlayerAction, sendNarrative, sendSystemMessage, sendRollMessage, applyAIDelta, nextTurn, processEnemyTurns]);

  // Handle custom text actions
  const handleCustomAction = useCallback(async (text: string) => {
    if (!gameState || !isPlayerTurn || isProcessing) return;
    if (gameState.status !== 'active') return;
    
    setIsProcessing(true);
    
    try {
      sendPlayerAction(`💬 "${text}"`);
      
      // Call AI to interpret the action
      const response = await callGameAI(gameState, text);
      
      // Display narrative
      sendNarrative(response.narrative);
      
      // Apply game state changes
      applyAIDelta(response);
      
      // Check for victory/defeat
      if (response.delta.encounterStatus === 'victory' || response.delta.encounterStatus === 'defeat') {
        setIsProcessing(false);
        return;
      }
      
      // Advance turn
      nextTurn();
      
      // Process enemy turns
      await new Promise(resolve => setTimeout(resolve, 500));
      await processEnemyTurns(gameState);
      
    } catch (error) {
      console.error('Custom action failed:', error);
      sendNarrative('The DM scratches their head... (try again)');
    } finally {
      setIsProcessing(false);
    }
  }, [gameState, isPlayerTurn, isProcessing, sendPlayerAction, sendNarrative, applyAIDelta, nextTurn, processEnemyTurns]);

  // Handle dice roller results
  const handleDiceRoll = useCallback((roll: DiceRoll) => {
    sendRollMessage(`🎲 Manual roll: ${roll.dice}`, roll);
  }, [sendRollMessage]);

  // Loading state
  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <div className="text-center">
          <div className="relative">
            <span className="text-7xl block mb-4 animate-float">🏰</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-stone-300 dark:bg-stone-700 rounded-full blur-md opacity-50" />
          </div>
          <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 mb-2">QuestWeaver</h2>
          <p className="text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
            <span>Loading your adventure</span>
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col parchment-bg">
      {/* Header */}
      <GameHeader
        character={gameState.character}
        encounter={gameState.encounter}
        isPlayerTurn={isPlayerTurn && !isProcessing}
        onOpenCharacterSheet={() => setIsCharacterSheetOpen(true)}
        onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
      />

      {/* Main chat area */}
      <ChatWindow messages={gameState.history} />

      {/* Action bar */}
      <div className="safe-area-bottom">
        <ActionBar
          character={gameState.character}
          isPlayerTurn={isPlayerTurn && !isProcessing}
          onAction={handleAction}
          onCustomAction={handleCustomAction}
          disabled={isProcessing}
        />
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-xl animate-bounce-in flex items-center gap-3 z-40">
          <span className="animate-dice-roll inline-block">🎲</span>
          <span>The DM is weaving the tale...</span>
          <span className="flex space-x-1">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>
      )}

      {/* Character sheet slide-out */}
      <CharacterSheet
        character={gameState.character}
        isOpen={isCharacterSheetOpen}
        onClose={() => setIsCharacterSheetOpen(false)}
      />

      {/* Dice roller modal */}
      <DiceRollerModal
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        onRoll={handleDiceRoll}
      />

      {/* Victory/Defeat overlay */}
      <VictoryDefeatScreen
        status={gameState.status}
        onRestart={reset}
      />
    </div>
  );
}
