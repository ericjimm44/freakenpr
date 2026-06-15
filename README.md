# PocketAI — Kira

A desktop AI companion that lives in the corner of your screen. Animated cat character, chat, task tracking, and Claude AI integration.

## Run locally

**Requirements:** Node.js 18+

```bash
git clone https://github.com/ericjimm44/freakenpr.git
cd freakenpr
npm install
npm start
```

Kira appears in your bottom-right corner. She's always on top, transparent, and draggable.

## Features

- **Animated cat** — 6 animation states: idle, walk, run, excited, sleep, stretch
- **Speech bubble** — proactive check-ins every 10 minutes when idle
- **Sleep mode** — falls asleep after 5 minutes of no activity; wakes when you interact
- **Chat** — pattern-matched responses out of the box; full AI with your API key
- **Tasks** — add, check off, and delete tasks; Kira reacts when you complete one
- **Memory** — your name, tasks, and chat history persist across sessions (stored in your user data folder, never uploaded anywhere)

## Add AI responses

1. Click ⚙️ in the toolbar
2. Enter your Claude API key (`sk-ant-…`)
3. Click Save

With a key set, every message goes through Claude Haiku with your name and active tasks as context.

## Build a standalone executable

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Output is in the `dist/` folder — a single installer you can run without Node.js.
