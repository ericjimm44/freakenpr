# 🎮 Vibe Coding Hub

A gamified, read-only dashboard for your vibe-coded projects — builder level & XP,
streaks, project cards with progress, a project roadmap, mission board, skill bars,
daily quests, an activity feed, and achievements.

It's a static page (no backend). Everything you see comes from **`data.json`**, plus
projects auto-discovered from your GitHub branches.

## Run it

The page loads `data.json` with `fetch`, so open it through a local server
(opening the HTML file directly is blocked by the browser):

```bash
# from the repo root
python3 -m http.server
# then visit http://localhost:8000/hub/
```

Once GitHub Pages is enabled it's also live at
`https://ericjimm44.github.io/freakenpr/hub/`.

## Edit the dashboard — `data.json`

| Key | What it controls |
| --- | --- |
| `builder` | Name, level, XP (`xp`/`xpMax`), and `streak` shown in the header & stat cards |
| `projects` | The "Your Projects" cards (see fields below) |
| `skills` | The Builder Stats bars in the right rail (`name`, `value` 0–100, `color`) |
| `quests` | Today's Quests checklist (`label`, `reward`, `progress`, `goal`) |
| `questReward` | The bonus box under the quests (`xp`, `bonus`) |
| `activity` | Activity Feed entries (`icon`, `text`, `time`) |
| `achievements` | Achievement badges (`icon`, `name`, `unlocked`) |
| `github` | Branch auto-discovery (`owner`, `repo`, `autoDiscover`, `ignoreBranches`) |

### A project entry

```json
{
  "name": "Adventure Dad",
  "description": "Family memories, reimagined.",
  "status": "in-progress",          // "in-progress" or "completed"
  "progress": 72,                    // 0–100, drives the bar
  "cover": "linear-gradient(135deg,#f7971e,#ffd200)",  // any CSS background
  "nextUp": "Add Trip Planner Module",
  "tags": ["mobile", "ai"],
  "featured": true,                  // this project drives the Roadmap + Mission Board
  "roadmap": [                       // stages: complete | in-progress | locked
    { "stage": "MVP", "state": "in-progress" }
  ],
  "missions": [
    { "name": "Build Authentication", "progress": 75 }
  ]
}
```

The **Roadmap** and **Mission Board** use the project marked `"featured": true`
(or the first project that has a `roadmap`).

## Where the stats come from

The numbers in `data.json` are derived from this repo's real activity (as of the
last update), not placeholders:

- **Projects** — the actual builds in the repo (Ping Pong Game, Vibe Coding Hub).
- **Top Languages** — each language's share of tracked lines of code
  (`git ls-files "*.js" | xargs wc -l`, etc.).
- **Activity Feed** — the most recent real commits.
- **Streak / active days** — distinct calendar days with commits.
- **Builder XP** — a transparent formula:
  `XP = commits×50 + completedProjects×200 + activeDays×25`. Level goes up every
  1000 XP.

To refresh them later, re-run those git counts and edit `data.json`.

## Auto-discovery from GitHub

On load the hub queries the public GitHub API for the repo's branches. Any branch
not already covered by an entry in `data.json` (matched on its `branch` field) is
added as an *In Progress* card. To flesh one out, add a `data.json` project with the
same `branch` value — your entry wins. Set `"autoDiscover": false` to turn it off.

> Covers and icons use CSS gradients and emoji so no image assets are needed —
> swap them for real images anytime by pointing `cover` at a `url(...)`.
