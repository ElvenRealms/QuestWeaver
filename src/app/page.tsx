'use client';

import { useState, useCallback } from 'react';
import { useGameState } from '@/lib/useGameState';
import { GameHeader } from '@/components/GameHeader';
import { ChatWindow } from '@/components/ChatWindow';
import { CharacterSheet } from '@/components/CharacterSheet';
import { ActionBar } from '@/components/ActionBar';
import { DiceRollerModal } from '@/components/DiceRollerModal';
import { VictoryDefeatScreen } from '@/components/VictoryDefeatScreen';
import { QuickAction, DiceRoll } from '@/types/game';
import { rollD20, formatRollResult } from '@/lib/dice';

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
    nextTurn,
    reset,
  } = useGameState();

  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false);
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);

  // Handle quick action button clicks
  const handleAction = useCallback((action: QuickAction) => {
    if (!gameState || !isPlayerTurn) return;

    // Mock action handling - in real game, this would call the AI
    switch (action.type) {
      case 'attack': {
        const roll = rollD20(3); // +3 Might modifier
        sendRollMessage(`Attacking with Steel Longsword...`, roll);
        
        // Simulate hit/miss
        const total = roll.modifiedTotal ?? roll.total;
        if (total >= 12) {
          // Hit! Roll damage
          setTimeout(() => {
            const damage = Math.floor(Math.random() * 8) + 4; // 1d8+3
            sendNarrative(`Your blade finds its mark! The Goblin Scout takes ${damage} damage and staggers backward, hissing in pain.`);
            damageEnemy('goblin-1', damage);
          }, 500);
        } else {
          setTimeout(() => {
            sendNarrative(`Your swing goes wide as the goblin ducks beneath your blade with a mocking cackle.`);
          }, 500);
        }
        break;
      }
      
      case 'ability': {
        sendPlayerAction(`Uses ${action.label}!`);
        sendNarrative(`[${action.label} would trigger here - AI integration coming soon!]`);
        break;
      }
      
      case 'defend': {
        sendPlayerAction(`Takes a defensive stance`);
        sendNarrative(`You raise your shield and brace yourself, ready to deflect incoming attacks. (+2 AC until your next turn)`);
        break;
      }
      
      default:
        sendPlayerAction(`Attempts ${action.label}`);
    }
    
    // Advance turn after a delay (simulating enemy turns)
    setTimeout(() => {
      nextTurn();
      // Simulate enemy turn
      if (gameState.encounter) {
        setTimeout(() => {
          sendNarrative(`The Goblin Scout lunges forward with its rusty dagger!`);
          const enemyRoll = rollD20(2);
          sendRollMessage(`Goblin Scout attacks...`, enemyRoll);
          
          const total = enemyRoll.modifiedTotal ?? enemyRoll.total;
          if (total >= 14) {
            const damage = Math.floor(Math.random() * 4) + 2;
            setTimeout(() => {
              sendNarrative(`The blade nicks your arm! You take ${damage} damage.`);
              damagePlayer(damage);
              nextTurn();
            }, 500);
          } else {
            setTimeout(() => {
              sendNarrative(`You deflect the blow with your shield, sending the goblin stumbling.`);
              nextTurn();
            }, 500);
          }
        }, 1000);
      }
    }, 1500);
  }, [gameState, isPlayerTurn, sendPlayerAction, sendNarrative, sendRollMessage, damageEnemy, damagePlayer, nextTurn]);

  // Handle custom text actions
  const handleCustomAction = useCallback((text: string) => {
    sendPlayerAction(text);
    // In real game, this would send to AI for interpretation
    sendNarrative(`[AI would interpret "${text}" and respond - integration coming soon!]`);
  }, [sendPlayerAction, sendNarrative]);

  // Handle dice roller results
  const handleDiceRoll = useCallback((roll: DiceRoll) => {
    sendRollMessage(`Manual roll: ${roll.dice}`, roll);
  }, [sendRollMessage]);

  // Loading state
  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center parchment-bg">
        <div className="text-center animate-pulse">
          <span className="text-6xl block mb-4">🏰</span>
          <p className="text-stone-600 dark:text-stone-400">Loading your adventure...</p>
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
        isPlayerTurn={isPlayerTurn}
        onOpenCharacterSheet={() => setIsCharacterSheetOpen(true)}
        onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
      />

      {/* Main chat area */}
      <ChatWindow messages={gameState.history} />

      {/* Action bar */}
      <div className="safe-area-bottom">
        <ActionBar
          character={gameState.character}
          isPlayerTurn={isPlayerTurn}
          onAction={handleAction}
          onCustomAction={handleCustomAction}
        />
      </div>

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
