# 🏰 QuestWeaver

An AI-powered D&D-style adventure game that makes tabletop RPGs accessible to everyone.

![QuestWeaver](https://img.shields.io/badge/Status-Foundation%20Complete-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

## ✨ Features (Foundation)

- **🎭 Narrative Chat Interface** - Fantasy-themed message bubbles for story display
- **📊 Character Sheet** - Slide-out panel with stats, abilities, and equipment
- **🎲 Dice Roller** - Tactile dice selection with modifiers and crit detection
- **⚔️ Action Bar** - Quick combat actions with cooldown indicators
- **🔄 Turn Order** - Visual turn tracker with HP bars
- **💾 Auto-Save** - LocalStorage persistence (never lose progress)
- **📱 Mobile-First** - Designed for phones, works everywhere

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

## 📁 Project Structure

```
questweaver/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main game interface
│   │   ├── layout.tsx        # App shell
│   │   └── globals.css       # Fantasy theme styles
│   ├── components/
│   │   ├── ChatWindow.tsx    # Narrative display
│   │   ├── CharacterSheet.tsx # Stats/abilities panel
│   │   ├── DiceRoller.tsx    # Dice UI with animations
│   │   ├── ActionBar.tsx     # Combat action buttons
│   │   ├── TurnIndicator.tsx # Turn order display
│   │   └── GameHeader.tsx    # Top bar with controls
│   ├── lib/
│   │   ├── gameState.ts      # State management
│   │   ├── useGameState.ts   # React hooks
│   │   └── dice.ts           # Dice rolling utilities
│   ├── data/
│   │   └── mockData.ts       # Test character & encounter
│   └── types/
│       └── game.ts           # TypeScript interfaces
└── public/
    └── manifest.json         # PWA manifest
```

## 🎮 Current Demo

The foundation includes a mock encounter with:

- **Character:** Thorin Ironforge, Level 3 Warrior
- **Enemies:** Goblin Scout, Goblin Archer, Goblin Brute
- **Abilities:** Power Strike, Shield Bash, Rally, Intimidating Shout
- **Sample narrative** showing the encounter flow

Actions are currently simulated (no AI yet) - clicking Attack rolls dice and shows mock combat results.

## 🎨 Design

- **Theme:** Cozy tavern fantasy (light-hearted, not dark dungeon)
- **Colors:** Warm ambers and oranges on parchment backgrounds
- **Mobile:** Touch-friendly buttons, slide-out panels
- **Accessibility:** Color contrast, keyboard navigation, screen reader labels

## 🔮 Next Steps

1. **AI Integration** - Connect Gemini Flash for narrative generation
2. **Real Combat Logic** - Implement the full turn system
3. **"Goblin Ambush" Encounter** - First playable scenario
4. **Sound Effects** - Dice rolls, combat sounds
5. **Victory/Defeat Polish** - XP gains, loot preview

## 📜 Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| State | React hooks + LocalStorage |
| AI (planned) | Gemini Flash |
| Database (planned) | Supabase |

## 🤝 Contributing

This is a personal project, but ideas are welcome! Open an issue to discuss.

## 📄 License

MIT

---

*Built with 🎲 and ☕ by the QuestWeaver team*
