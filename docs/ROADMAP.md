# MVP Roadmap

Status against the spec's build order. ✅ implemented in this demo ·
🔌 seam ready (add keys/service) · 📋 designed/next.

## Phase 1 — Foundation

| Item               | Status | Where                                   |
|--------------------|--------|-----------------------------------------|
| Family Profiles    | ✅     | `/welcome`, `/family`                   |
| Mission Creation   | ✅     | `/missions/new` (AI + by-type + custom) |
| Mission Completion | ✅     | `/missions/[id]` + `DebriefSheet`       |
| Mission Ratings    | ✅     | overall + per-child ratings             |
| Mission Timeline   | ✅     | `/missions` (story thread)              |
| Mission Log        | ✅     | `/missions` grid view                   |

## Phase 2 — Engagement

| Item                  | Status | Where                              |
|-----------------------|--------|------------------------------------|
| AI Mission Generator  | ✅     | `aiEngine.suggestMissions`         |
| Mission Challenges    | ✅     | `aiEngine.generateChallenges`      |
| Family Memory Score   | ✅     | `memoryScore.ts`, `/score`         |
| Achievement System    | ✅     | `achievements.ts`, `/lore`         |
| Interactive Map       | ✅     | `/map` (Atlas) · 🔌 Mapbox GL swap |

## Phase 3 — Story

| Item                          | Status | Where                          |
|-------------------------------|--------|--------------------------------|
| Family Lore Engine            | ✅     | `aiEngine.generateLore`, `/lore` |
| Personalized Recommendations  | ✅     | interest/history-weighted ranker |
| AI Story Generation           | ✅🔌   | `/api/ai/recap` (OpenAI seam, wired into completion) |
| Annual Family Adventure Recap | ✅     | `aiEngine.generateAnnualRecap`, `/lore` "Year in Adventures" |

## Product depth (this iteration)

| Item                          | Status | Where                          |
|-------------------------------|--------|--------------------------------|
| Mission lifecycle (start / edit / delete) | ✅ | `/missions/[id]`, store actions |
| Post-onboarding family + child editing | ✅ | `/family`, `ChildEditorSheet`  |
| Data export / import (backup)  | ✅     | `/family`, `store.export/importData` |
| Installable PWA                | ✅     | `app/manifest.ts`, `app/icon.svg` |
| Error / not-found / loading states | ✅ | `app/error.tsx` etc.           |
| Automated test suite           | ✅     | 32 tests — `npm test` (engines + store + render) |

## Production hardening (post-MVP)

- 🔌 **Auth:** Clerk provider + middleware.
- 🔌 **Data:** Supabase (`supabase/schema.sql`) + RLS; replace store actions
  with `src/lib/db.ts` of identical signatures.
- 🔌 **Storage:** `mission-photos` bucket for real uploads.
- 🔌 **Maps:** Mapbox GL using existing `lat/lng` pins.
- 📋 **Realtime:** Supabase subscriptions so both parents see updates live.
- 📋 **Notifications:** "When's our next mission?" nudges + streak reminders.
- 📋 **Sharing:** export a mission/year recap card (the viral growth loop).

## Growth loop (the retention engine)

```
Mission complete → photos uploaded → memories generated → lore updated
→ new badge earned → AI suggests next mission → child asks "when's the next one?"
→ parent opens app → repeat
```
The product is tuned end-to-end to keep this wheel turning.
