// Dice rolling utilities

import { DiceRoll } from '@/types/game';

/**
 * Parse a dice notation string like "2d6" or "1d20+5"
 */
export function parseDiceNotation(notation: string): { count: number; sides: number; modifier: number } {
  const match = notation.toLowerCase().match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }
  
  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    modifier: match[3] ? parseInt(match[3], 10) : 0,
  };
}

/**
 * Roll a single die with the given number of sides
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll dice based on a notation string like "2d6+3"
 */
export function rollDice(notation: string): DiceRoll {
  const { count, sides, modifier } = parseDiceNotation(notation);
  
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  
  const total = results.reduce((sum, val) => sum + val, 0);
  
  return {
    dice: notation,
    results,
    total,
    modifier: modifier || undefined,
    modifiedTotal: modifier ? total + modifier : undefined,
  };
}

/**
 * Roll a d20 (most common roll)
 */
export function rollD20(modifier: number = 0): DiceRoll {
  return rollDice(`1d20${modifier >= 0 ? '+' : ''}${modifier || ''}`);
}

/**
 * Roll with advantage (roll 2d20, take highest)
 */
export function rollWithAdvantage(modifier: number = 0): DiceRoll {
  const roll1 = rollDie(20);
  const roll2 = rollDie(20);
  const highest = Math.max(roll1, roll2);
  
  return {
    dice: '2d20 (advantage)',
    results: [roll1, roll2],
    total: highest,
    modifier: modifier || undefined,
    modifiedTotal: modifier ? highest + modifier : undefined,
  };
}

/**
 * Roll with disadvantage (roll 2d20, take lowest)
 */
export function rollWithDisadvantage(modifier: number = 0): DiceRoll {
  const roll1 = rollDie(20);
  const roll2 = rollDie(20);
  const lowest = Math.min(roll1, roll2);
  
  return {
    dice: '2d20 (disadvantage)',
    results: [roll1, roll2],
    total: lowest,
    modifier: modifier || undefined,
    modifiedTotal: modifier ? lowest + modifier : undefined,
  };
}

/**
 * Format a dice roll for display
 */
export function formatRollResult(roll: DiceRoll): string {
  const diceStr = roll.results.length > 1 
    ? `[${roll.results.join(', ')}] = ${roll.total}`
    : `${roll.total}`;
  
  if (roll.modifier) {
    const modStr = roll.modifier >= 0 ? `+${roll.modifier}` : roll.modifier.toString();
    return `${diceStr} ${modStr} = ${roll.modifiedTotal}`;
  }
  
  return diceStr;
}

/**
 * Check if a d20 roll is a natural 20 (critical success)
 */
export function isCriticalSuccess(roll: DiceRoll): boolean {
  return roll.dice.includes('d20') && roll.results.includes(20);
}

/**
 * Check if a d20 roll is a natural 1 (critical failure)
 */
export function isCriticalFailure(roll: DiceRoll): boolean {
  return roll.dice.includes('d20') && roll.results.includes(1);
}
