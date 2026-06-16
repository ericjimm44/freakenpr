# 🧭 Adventure Dad

> **Help parents create memories on purpose.**

A mobile-first family engagement platform built around a recurring behavioral
loop that strengthens parent–child relationships through **mission-based
adventures**. Think _Pokémon quests × National Geographic × a family adventure
journal × Duolingo streaks × a road-trip planner_ — fused into one warm,
nostalgic experience.

This is **not** a travel planner, a calendar, or a journaling app. It is a
system designed to make a child ask:

> _"What's our next mission?"_

---

## ✨ What's in this repo

A **fully runnable** Next.js app. It works end-to-end with **zero external
services** — local persistence + an offline AI engine — so you can experience
the entire core loop immediately. Every external integration (Supabase, Clerk,
OpenAI, Mapbox) is architected behind a seam and lights up by adding env keys.

```bash
npm install
npm run dev          # → http://localhost:3000
```

On first load, tap **"Explore the Martinez family demo"** to see a living family
story, or build your own family from scratch.

---

## 🔁 The Core Loop

The entire product revolves around one loop:

```
 TRIGGER     Parent has free time
   ↓
 PLAN        AI Mission Architect recommends a mission   →  /missions/new
   ↓
 EXECUTE     Family completes mission & challenges        →  /missions/[id]
   ↓
 DEBRIEF     Capture favorite/funniest/surprise moments   →  DebriefSheet
   ↓
 PROGRESS    Earn badges, memories, +Memory Score         →  Celebration
   ↓
 ANTICIPATION  AI teases the next mission                 →  home dashboard
   ↓
 REPEAT
```

## ⭐ North Star: the Family Memory Score

The metric we optimize for is **not** DAU, time-in-app, or plans created. It is
the **Family Memory Score** — a single number every screen reinforces:

```
Family Memory Score = f(
  Completed Missions, Mission Ratings, Family Photos,
  Adventure Streaks, States Visited, Child Participation
)
```

See [`src/lib/memoryScore.ts`](src/lib/memoryScore.ts) for the exact, visible
weighting and `/score` for the live breakdown.

---

## 🗺 Feature map (by screen)

| Route             | What it delivers                                                        | Spec section |
|-------------------|-------------------------------------------------------------------------|--------------|
| `/welcome`        | Onboarding → Family Profiles (parent, kids, interests, dislikes)        | User Types   |
| `/`               | Dashboard: Memory Score, next-mission tease, recommendations, streaks   | Core Loop    |
| `/missions/new`   | **AI Mission Architect** — interest/budget/distance/anti-repeat ranking | AI           |
| `/missions`       | **Mission Timeline** + log, connected like a story                      | Timeline     |
| `/missions/[id]`  | Mission detail: challenges, photos, debrief, AI recap, child ratings    | Missions     |
| `/score`          | Family Memory Score breakdown & rank progression                        | North Star   |
| `/map`            | **Adventure Atlas** — pins, routes, states visited                      | Map          |
| `/lore`           | **Family Lore Engine** + Achievement System                             | Lore         |
| `/family`         | Family profile & adventure preferences                                  | User Types   |
| `/api/ai/recap`   | Pluggable OpenAI recap endpoint (local fallback)                        | AI Workflows |

---

## 🧠 The AI, gamification & lore engines

All product "intelligence" lives in pure, testable modules so it runs offline
**and** swaps to OpenAI without touching the UI:

- [`src/lib/aiEngine.ts`](src/lib/aiEngine.ts) — Mission Architect (suggest,
  avoid repetition, respect dislikes/budget/age/distance), challenge generation,
  recap, **Family Lore** narrative, next-mission teaser.
- [`src/lib/memoryScore.ts`](src/lib/memoryScore.ts) — the North Star metric +
  streak math + rank ladder.
- [`src/lib/achievements.ts`](src/lib/achievements.ts) — badge catalog +
  evaluator that stamps unlock moments.

---

## 🏗 Tech stack

| Layer          | Production            | In this demo                               |
|----------------|-----------------------|--------------------------------------------|
| Frontend       | Next.js 14 · TS · Tailwind | ✅ same                                |
| UI             | shadcn/ui style        | ✅ hand-rolled warm design system          |
| State / data   | Supabase (Postgres)    | Zustand + `localStorage` (same contract)   |
| Auth           | Clerk                  | local family profile                       |
| AI             | OpenAI API             | offline deterministic engine + API seam    |
| Maps           | Mapbox GL              | lightweight SVG projection                 |
| Storage        | Supabase Storage       | data-URL photos                            |
| Deploy         | Vercel                 | `npm run build`                            |

> Swapping in the real services is additive — see
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
> [`.env.example`](.env.example). The Postgres schema + RLS is in
> [`supabase/schema.sql`](supabase/schema.sql).

---

## 📚 Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture, component
  hierarchy, data flow, integration seams.
- [`docs/AI_WORKFLOWS.md`](docs/AI_WORKFLOWS.md) — every AI workflow & prompt.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — MVP build order (Phases 1–3) & status.
- [`docs/WIREFRAMES.md`](docs/WIREFRAMES.md) — screen-by-screen wireframes & flows.

---

## ✅ Success criteria

The product wins when a child **regularly asks "What's our next mission?"** and
the parent holds a complete timeline of memories, stories, photos and milestones
that strengthen family connection over time. Every design choice here optimizes
for that emotional loop over travel-planning utility.
