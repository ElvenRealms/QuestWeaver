# QuestWeaver

AI-powered D&D-style adventure game. Mobile-first, cozy tavern fantasy aesthetic.

## Tech Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** for styling
- **LocalStorage** for state persistence
- **Gemini Flash** for AI (planned)

## Project Structure
```
src/
├── app/           # Pages + API routes
├── components/    # React components (ChatWindow, DiceRoller, ActionBar, etc.)
├── lib/           # Hooks + utilities (gameState, dice, gemini)
├── types/         # TypeScript interfaces (game.ts)
└── data/          # Mock data for testing
```

## Current State
Foundation complete: chat UI, character sheet, dice roller, action bar, turn order. Combat is mock/simulated — no real AI or game logic yet.

## Design Rules
- **Theme:** Warm ambers/oranges on parchment. Cozy, not dark dungeon.
- **Mobile-first:** Touch-friendly, slide-out panels
- Maintain existing component patterns and naming conventions

## Commands
```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
```

## Don't
- Don't modify package.json dependencies without asking
- Don't change the visual theme/color scheme without approval
- Don't remove existing features — extend them
