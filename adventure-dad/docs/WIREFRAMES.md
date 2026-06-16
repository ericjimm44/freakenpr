# Wireframes & User Flows

Low-fidelity, mobile-first (single `max-w-md` column). Maps directly to the
implemented screens.

## Onboarding flow `/welcome`

```
[Intro]                 [Step 1: You]            [Step 2: Crew]
┌───────────────┐       ┌───────────────┐        ┌───────────────┐
│ 🧭 Adventure  │       │ Your name     │        │ Child 1   [x] │
│ Create        │       │ Family name   │        │ [Name] [age]  │
│ memories      │  →    │ Home base     │   →    │ Loves: chips  │
│ on purpose.   │       │ Budget $ $$ $$│        │ Avoid: chips  │
│ • AI plans    │       │ Drive ──●──   │        │ [+ Add child] │
│ [Start]       │       │ [Add crew →]  │        │ [Begin →]     │
│ [Demo]        │       └───────────────┘        └───────────────┘
└───────────────┘
```
Flow: Intro → (Start) Step1 → Step2 → `createFamily()` → `/`.
Or Intro → (Demo) `loadDemo()` → `/`.

## Home dashboard `/`

```
┌─────────────────────────────┐
│ [forest header]             │
│ Welcome back   (kid avatars)│
│ The Martinez Family         │
│ 🔥 3-week streak            │
├──── floating score card ────┤
│ (ScoreRing)  Missions  States│
│   1,240      Photos    Avg   │
│              See breakdown → │
├─────────────────────────────┤
│ ✨ AI Mission Architect      │
│ "Next up could be Animals…" │
│ [Plan this mission →]       │
├─────────────────────────────┤
│ Your next mission  (card)   │
│ Recommended ▸▸ (h-scroll)   │
│ Recent memories  (cards)    │
│ 🏆 N badges earned →        │
└─────────────────────────────┘
[ Home  Missions  Atlas  Lore  Family ]
```

## Mission Architect `/missions/new`

```
[For us] [By type] [Custom]
For us:  N ideas              Regenerate ↻
┌─ Suggestion card ──────────┐
│ 🐾 Animals                 │
│ Wild Florida Safari        │
│ 📍 Kenansville, FL         │
│ desc…  💲 ⏱60m  📍FL       │
│ ✨ Why: Adriel loves this  │
│ [Add to missions →]        │
└────────────────────────────┘
```

## Mission detail `/missions/[id]`

```
┌─ hero photo / category ─────┐
│ ‹  🚀 Space                 │
│    Kennedy Space Center     │
│    📍 Merritt Island, FL    │
├─────────────────────────────┤
│ Mission 001  ⭐9.4  ⏱  💲   │
│ description…                │
│ ✨ AI Mission Recap (if done)│
│ Challenges                  │
│  ☑ Parent: find biggest…    │
│  ☑ Ana: best photo          │
│  ☑ Adriel: count rockets    │
│  ☐ Bonus: weird fact        │
│ Photos  [+ Add] (grid)      │
│ How the crew rated it       │
│ Memories captured           │
├─────────────────────────────┤
│ [Complete & debrief mission]│  ← sticky (if not done)
└─────────────────────────────┘
```

### Debrief → Celebration

```
DebriefSheet (bottom modal)        Celebration (bottom modal)
┌──────────────────┐               ┌──────────────────┐
│ Mission Debrief  │               │   🎉 confetti     │
│ ⭐ favorite?      │   submit →    │ Mission complete!│
│ 😂 funniest?      │               │ +320 Memory Score│
│ 😮 surprise?      │               │ ✨ AI recap…      │
│ rate ──●── 8      │               │ 🏅 New badges     │
│ kids' ratings     │               │ [Continue story →]│
│ recommend? 👍👎    │               └──────────────────┘
│ 🔮 next wish?     │
│ [Complete →]      │
└──────────────────┘
```

## Timeline `/missions`

```
[Mission Log]            [timeline | grid]
│
●─ Mission 001 · Space   Kennedy…  ⭐9.4
│
●─ Mission 002 · History Castillo  ⭐8.7
│
●─ Mission 003 · Animals Wild FL   ⭐9.1
│
(thread = sunset→gold→forest gradient)        [+ New mission] (FAB)
```

## Atlas `/map`, Lore `/lore`, Score `/score`, Family `/family`

```
Atlas: framed map canvas, category pins, dashed route lines between completed
       missions, "States visited · N" chips.
Lore:  journal card (headline + paragraphs + 4 stats), running jokes,
       achievement grid (earned gold / locked greyed).
Score: big ScoreRing + rank progress + 6 contribution rows summing to total.
Family: family header, crew cards (interests/dislikes), budget & drive
        preferences, load-demo / reset controls.
```
