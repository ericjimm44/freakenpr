# Architecture

## Principles

1. **Emotional engagement > productivity.** Every screen advances the core loop
   and the Family Memory Score, not task completion.
2. **Runnable with zero dependencies.** The app must work offline so the product
   experience is never gated on a key. External services are _seams_, not
   prerequisites.
3. **One contract, two backends.** The local Zustand store and the Supabase
   schema implement the same domain model (`src/lib/types.ts`). Replacing the
   persistence layer never changes UI or engine code.

## High-level diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Next.js App Router (mobile-first, max-w-md "phone" shell)     │
│                                                              │
│  Pages (client)            Shared components                 │
│  ─ /welcome  onboarding    ─ AppFrame (hydrate + gate + nav) │
│  ─ /         dashboard     ─ MissionCard / ScoreRing         │
│  ─ /missions timeline      ─ DebriefSheet / Celebration      │
│  ─ /missions/new architect ─ ChildAvatar / Icon / BottomNav  │
│  ─ /missions/[id] detail                                     │
│  ─ /score /map /lore /family                                 │
└───────────────┬──────────────────────────┬──────────────────┘
                │ reads/writes              │ calls
        ┌───────▼────────┐         ┌────────▼─────────┐
        │ Zustand store  │         │ Engines (pure)   │
        │ (persist →     │         │ aiEngine         │
        │  localStorage) │         │ memoryScore      │
        │                │         │ achievements     │
        └───────┬────────┘         └────────┬─────────┘
                │ same domain types          │ same types
        ┌───────▼──────────────────────────▼──────────┐
        │ PRODUCTION SEAMS (additive)                  │
        │  Supabase (Postgres+RLS+Storage+Realtime)    │
        │  Clerk (auth)   OpenAI (/api/ai/*)  Mapbox   │
        └──────────────────────────────────────────────┘
```

## Component hierarchy

```
RootLayout (fonts, .app-shell)
└─ <Page>
   └─ AppFrame                 // waits for hydration, gates on family, renders nav
      ├─ <PageInner>           // screen content (client)
      │   ├─ ScoreRing
      │   ├─ MissionCard[]
      │   ├─ DebriefSheet      // modal, on complete
      │   └─ Celebration       // modal, on success (confetti + recap + badges)
      └─ BottomNav             // Home · Missions · Atlas · Lore · Family
```

## Data flow: completing a mission (the loop in code)

```
MissionDetail "Complete & debrief"
  → DebriefSheet captures favorite/funniest/surprise/ratings/wish
    → store.completeMission(id, data)
        • sets status=completed, stores debrief + child ratings
        • aiEngine.generateRecap()  → mission.aiSummary
        • achievements.evaluate()   → stamps newly-earned badges
        • memoryScore recomputes (derived, never stored stale)
    → Celebration shows recap + score delta + new badges
  → home dashboard re-teases the next mission (anticipation)
```

## State & persistence

- `src/store/useStore.ts` — Zustand + `persist` middleware (`localStorage` key
  `adventure-dad-state-v1`). `partialize` persists only `family`, `missions`,
  `achievements`, `onboarded`. `onRehydrateStorage` flips `hydrated` so
  `AppFrame` can avoid SSR/CSR mismatch.
- Derived values (Memory Score, lore, suggestions) are **computed**, never
  persisted, so they can't drift.

## Swapping to Supabase + Clerk (production)

1. Wrap the app in `<ClerkProvider>`; gate routes with Clerk middleware.
2. Replace the Zustand actions with a thin data layer
   (`src/lib/db.ts`) of the same signatures backed by `@supabase/supabase-js`.
   Because actions already return the same domain types, components are
   untouched.
3. Run `supabase/schema.sql` (tables + RLS + `family_memory_score` view).
4. Photos: write to the `mission-photos` Storage bucket; store the path in
   `photos.storage_path` (the demo stores data URLs in the same `url` field).
5. Mapbox: swap the SVG projection in `/map` for `mapbox-gl`, reusing the same
   `mission.lat/lng` pins.

## Why no shadcn/ui dependency here?

The spec calls for shadcn/ui. To keep the demo install-light and the aesthetic
**warm and nostalgic rather than corporate**, the design system is hand-rolled
in `globals.css` (`.card`, `.btn-*`, `.chip`, `.input`) with the same
composition philosophy. In production these map 1:1 onto shadcn primitives.
