// Gemini AI Integration for QuestWeaver
// Uses Gemini 2.0 Flash for fast, engaging Dungeon Master narration

import { GameState, AIResponse, Character, Enemy, Encounter, Message } from '@/types/game';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// DO NOT CHANGE THIS MODEL - Elven's preference (2026-01-27)
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// System prompt that defines the DM's personality and behavior
const SYSTEM_PROMPT = `You are a fun, light-hearted Dungeon Master for a D&D-style adventure game called QuestWeaver. Your role is to narrate combat encounters in an engaging, slightly humorous way while keeping the game casual and accessible.

## Your Personality
- Enthusiastic and encouraging - celebrate cool moments!
- Slightly snarky humor - poke fun at both heroes and monsters
- Keep things light even in "danger" - this is fun, not stressful
- Use vivid, punchy descriptions (2-3 sentences max per beat)
- Occasional 4th-wall winks are fine

## Combat Rules
- The player has already rolled dice - use the roll result they provide
- Describe the action cinematically based on success/failure
- Be generous with hits (12+ on d20 hits, 8+ for abilities)
- Enemies should feel threatening but beatable
- Deaths are dramatic but not graphic
- Always move the story forward

## Response Format
You MUST respond with valid JSON in this exact format:
{
  "narrative": "Your exciting narration here (2-4 sentences)",
  "delta": {
    "playerDamage": number or null,
    "playerHealing": number or null,
    "enemyDamage": [{"enemyId": "goblin-1", "damage": number}] or null,
    "enemyDefeated": ["goblin-1"] or null,
    "abilityUsed": "power-strike" or null (use the exact ability ID from character abilities),
    "cooldownsUpdated": [{"abilityId": "power-strike", "cooldown": 2}] or null,
    "turnAdvance": true,
    "encounterStatus": "active" or "victory" or "defeat"
  }
}

IMPORTANT: Use the exact IDs provided in the game state (e.g., "goblin-1", "power-strike"), not the display names!

## Damage Guidelines
- Basic attack: 4-10 damage on hit
- Power Strike: 8-15 damage
- Shield Bash: 3-6 damage + skip enemy turn
- Enemy attacks: 2-6 damage typically
- Goblin Brute: 4-8 damage

## Victory/Defeat
- Set encounterStatus to "victory" when all enemies reach 0 HP
- Set encounterStatus to "defeat" if player HP reaches 0
- Give a satisfying ending narration for either outcome

Remember: Keep it FUN! This is a casual adventure, not a grueling survival game.`;

// Build context from current game state
function buildGameContext(state: GameState): string {
  const { character, encounter, history } = state;
  
  let context = `## Current Game State\n\n`;
  
  // Character status
  context += `### Hero: ${character.name} (${character.class} Level ${character.level})\n`;
  context += `- HP: ${character.hp.current}/${character.hp.max}\n`;
  context += `- Stats: Might ${character.stats.might}, Agility ${character.stats.agility}, Wit ${character.stats.wit}, Heart ${character.stats.heart}\n`;
  context += `- Equipment: ${character.equipment.filter(e => e.equipped).map(e => e.name).join(', ')}\n`;
  context += `- Abilities:\n`;
  character.abilities.forEach(a => {
    const ready = a.currentCooldown === 0 ? '✓ Ready' : `(${a.currentCooldown} turns)`;
    context += `  - ${a.name} (id: "${a.id}"): ${a.effect} ${ready}\n`;
  });
  
  // Encounter status
  if (encounter) {
    context += `\n### Encounter: ${encounter.name}\n`;
    context += `Round ${encounter.round}\n\n`;
    context += `### Enemies:\n`;
    encounter.enemies.forEach(enemy => {
      const status = enemy.hp.current <= 0 ? '💀 DEFEATED' : `HP: ${enemy.hp.current}/${enemy.hp.max}`;
      context += `- ${enemy.name} (${enemy.id}): ${status}\n`;
      context += `  Threat: ${enemy.threat}\n`;
      context += `  Can use: ${enemy.abilities.join(', ')}\n`;
    });
    
    // Whose turn
    const currentTurnName = encounter.currentTurn === character.id 
      ? character.name 
      : encounter.enemies.find(e => e.id === encounter.currentTurn)?.name || 'Unknown';
    context += `\n### Current Turn: ${currentTurnName}\n`;
  }
  
  // Recent history (last 5 messages)
  const recentHistory = history.slice(-5);
  if (recentHistory.length > 0) {
    context += `\n### Recent Events:\n`;
    recentHistory.forEach(msg => {
      const prefix = msg.sender === 'player' ? '🎮 Player' : msg.sender === 'dm' ? '📜 DM' : '⚙️ System';
      context += `${prefix}: ${msg.content}\n`;
    });
  }
  
  return context;
}

// Format the action prompt
function buildActionPrompt(
  action: string, 
  rollResult?: { total: number; modifiedTotal?: number; dice: string }
): string {
  let prompt = `\n## Player Action\n${action}\n`;
  
  if (rollResult) {
    const total = rollResult.modifiedTotal ?? rollResult.total;
    prompt += `\nDice Roll: ${rollResult.dice} = ${total}`;
    if (total >= 18) prompt += ' (EXCELLENT!)';
    else if (total >= 12) prompt += ' (Hit!)';
    else if (total <= 5) prompt += ' (Yikes!)';
    else prompt += ' (Miss)';
  }
  
  prompt += '\n\nRespond with the JSON format specified. Be creative and fun!';
  
  return prompt;
}

// Build enemy turn prompt
function buildEnemyTurnPrompt(
  enemy: Enemy,
  state: GameState,
  rollResult?: { total: number; modifiedTotal?: number; dice: string }
): string {
  let prompt = `\n## Enemy Turn: ${enemy.name}

The ${enemy.name} takes their turn. They can use: ${enemy.abilities.join(', ')}.

Current state:
- ${enemy.name} HP: ${enemy.hp.current}/${enemy.hp.max}
- Player HP: ${state.character.hp.current}/${state.character.hp.max}
`;

  if (rollResult) {
    const total = rollResult.modifiedTotal ?? rollResult.total;
    prompt += `\nDice Roll: ${rollResult.dice} = ${total}`;
    if (total >= 18) prompt += ' (DEVASTATING!)';
    else if (total >= 12) prompt += ' (Hit!)';
    else if (total <= 5) prompt += ' (Fumble!)';
    else prompt += ' (Miss)';
  }

  prompt += `

Narrate the enemy's attack based on the dice roll result above. Make it dramatic!
Keep damage reasonable (${enemy.name === 'Goblin Brute' ? '4-8' : '2-5'} damage on hit).

Respond with the JSON format specified.`;

  return prompt;
}

export interface GameActionRequest {
  gameState: GameState;
  action: string;
  rollResult?: { total: number; modifiedTotal?: number; dice: string };
  isEnemyTurn?: boolean;
  enemyId?: string;
}

export async function callGeminiDM(request: GameActionRequest): Promise<AIResponse> {
  const { gameState, action, rollResult, isEnemyTurn, enemyId } = request;
  
  // Build the full prompt
  const context = buildGameContext(gameState);
  let actionPrompt: string;
  
  if (isEnemyTurn && enemyId) {
    const enemy = gameState.encounter?.enemies.find(e => e.id === enemyId);
    if (!enemy) throw new Error(`Enemy ${enemyId} not found`);
    actionPrompt = buildEnemyTurnPrompt(enemy, gameState, rollResult);
  } else {
    actionPrompt = buildActionPrompt(action, rollResult);
  }
  
  const fullPrompt = context + actionPrompt;
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }]
          },
          {
            role: 'model', 
            parts: [{ text: 'Understood! I\'m ready to be your fun, engaging Dungeon Master. I\'ll respond with proper JSON format for all game actions. Let\'s make this adventure epic! 🎲' }]
          },
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gemini raw response:', JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text in Gemini response');
      throw new Error('No response from Gemini');
    }
    
    console.log('Gemini text:', text);
    
    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = text.trim();
    
    // Try to extract JSON from markdown code blocks
    if (jsonStr.includes('```json')) {
      const parts = jsonStr.split('```json');
      if (parts[1]) {
        jsonStr = parts[1].split('```')[0].trim();
      }
    } else if (jsonStr.includes('```')) {
      const parts = jsonStr.split('```');
      if (parts[1]) {
        jsonStr = parts[1].split('```')[0].trim();
      }
    }
    
    // Try to find JSON object in the text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    console.log('Parsing JSON:', jsonStr);
    const aiResponse = JSON.parse(jsonStr) as AIResponse;
    
    // Validate and sanitize response
    return {
      narrative: aiResponse.narrative || 'Something mysterious happens...',
      delta: {
        playerDamage: aiResponse.delta?.playerDamage ?? undefined,
        playerHealing: aiResponse.delta?.playerHealing ?? undefined,
        enemyDamage: aiResponse.delta?.enemyDamage ?? undefined,
        enemyDefeated: aiResponse.delta?.enemyDefeated ?? undefined,
        abilityUsed: aiResponse.delta?.abilityUsed ?? undefined,
        cooldownsUpdated: aiResponse.delta?.cooldownsUpdated ?? undefined,
        turnAdvance: aiResponse.delta?.turnAdvance ?? true,
        encounterStatus: aiResponse.delta?.encounterStatus ?? undefined,
      },
    };
  } catch (error) {
    console.error('Gemini call failed:', error);
    
    // Return a fallback response
    return {
      narrative: 'The chaos of battle makes it hard to see what happened... (AI temporarily unavailable)',
      delta: {
        turnAdvance: true,
      },
    };
  }
}
