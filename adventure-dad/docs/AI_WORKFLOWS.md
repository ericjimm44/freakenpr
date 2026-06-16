# AI Workflows

The "AI" is four workflows. Each runs **offline** via a deterministic engine
(`src/lib/aiEngine.ts`) and upgrades to OpenAI behind an API route without UI
changes. The engine already performs the reasoning the spec asks for.

## 1. AI Mission Architect — `suggestMissions(family, history, n)`

Generates fresh adventures, **avoiding repetition** and personalizing to the
family.

**Signals & scoring (per candidate):**

| Signal              | Effect                                                            |
|---------------------|------------------------------------------------------------------|
| Recently-done category | −8 (strong anti-repeat — e.g. after Space/History/Beach it surfaces Animals/Mountains/Road Trip) |
| Interest match (kids) | +2…+3 per matched interest                                     |
| Age fit             | −6 if youngest child is below the idea's `minAge`                 |
| Travel radius       | +2 within `maxTravelMinutes`, −5 beyond                          |
| Budget              | −4 above the family's budget ceiling                             |
| Dislikes            | −10 (e.g. "Deep Water" suppresses deep-water ideas)             |
| Novelty jitter      | small deterministic shuffle so picks feel fresh                  |

Output includes a human **"why"** (`reason`) shown in the UI
("Adriel loves this · within your travel range").

**Production prompt shape:**
```
system: You are the Adventure Dad Mission Architect. Recommend family outings as
        strict JSON. Avoid categories in {recent}. Respect dislikes, budget,
        max drive time and the youngest child's age. Ground every place in a
        real, currently-operating location.
user:   {family interests, ages, dislikes, home_base, budget, max_minutes,
         recent_categories, season/weather, school_schedule}
```
Ground results with Mapbox/Places; weather via a forecast API keyed on
`scheduled_for`.

## 2. Challenge generation — `generateChallenges(category, family)`

Every mission auto-generates **Parent / Child / Bonus** challenges. Child
challenges are personalized per kid (addressed by name, biased toward the
category): _"Adriel, spot 5 different animals."_, _"Find the coolest cannon."_,
_"Capture one photo nobody will believe."_

## 3. Mission recap — `generateRecap(mission, family)` & `/api/ai/recap`

After the debrief, composes a warm 2–3 sentence recap from the captured
favorite/funniest moments + ratings:

> _"Mission 002 complete — Castillo de San Marcos. The highlight: Ana loved
> exploring the fort walls. Funniest moment? Adriel declared himself 'General
> Adriel.' Family rating: 8.7."_

`POST /api/ai/recap` calls OpenAI when `OPENAI_API_KEY` is set, else returns the
local recap — and **always** falls back locally on error so a user is never
blocked. Response: `{ recap, source: "openai" | "local" | "local-fallback" }`.

## 4. Family Lore Engine — `generateLore(family, missions)`

The "secret feature." Builds an evolving narrative from the entire history:
headline (missions × states), each child's favorite mission (their highest
personal rating), highest-rated adventure, favorite food/road-trip stop, rolling
stats, and **running jokes** seeded from funniest-moment debriefs.

> _"The Martinez Family has completed 3 missions across 1 state. Ana's favorite
> mission was Kennedy Space Center. Adriel's favorite mission was Wild Florida
> Safari."_

In production this is cached to `lore_snapshots` and regenerated after each
completed mission (and annually for the "Year in Adventures" recap).

## Graceful degradation contract

Every AI surface renders meaningfully with **no** API key. OpenAI strictly
improves prose quality and place grounding — it is never required for the loop
to function.
