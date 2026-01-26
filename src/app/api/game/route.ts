// API Route for Game Actions
// Handles player actions and enemy turns via Gemini AI

import { NextRequest, NextResponse } from 'next/server';
import { callGeminiDM, GameActionRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GameActionRequest;
    
    // Validate request
    if (!body.gameState) {
      return NextResponse.json(
        { error: 'Missing game state' },
        { status: 400 }
      );
    }
    
    if (!body.action && !body.isEnemyTurn) {
      return NextResponse.json(
        { error: 'Missing action or enemy turn flag' },
        { status: 400 }
      );
    }
    
    // Call Gemini AI
    const response = await callGeminiDM(body);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process game action',
        narrative: 'The magical energies of the realm flicker momentarily... (try again)',
        delta: { turnAdvance: false }
      },
      { status: 500 }
    );
  }
}
