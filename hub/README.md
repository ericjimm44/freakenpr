# 🚀 Vibe Projects Hub

A central dashboard for every vibe-coded project — see what's **in progress**, what's
**completed**, and how far along each one is via a progress bar.

## Run it

Because the page loads `projects.json` with `fetch`, open it through a local server
(opening the HTML file directly will be blocked by the browser):

```bash
# from the repo root
python3 -m http.server
# then visit http://localhost:8000/hub/
```

## Add or update a project

Everything is data-driven — just edit `projects.json`. No code changes needed.

```json
{
  "name": "My New Project",
  "description": "One-line summary of what it does.",
  "status": "in-progress",        // "in-progress" or "completed"
  "progress": 40,                  // 0–100, drives the progress bar
  "tags": ["game", "javascript"],  // optional
  "link": "../my-project/index.html", // optional: where to open it
  "repo": "https://github.com/ericjimm44/freakenpr/tree/my-branch", // optional
  "updated": "2026-06-17"          // optional
}
```

The stat cards (total / in progress / completed / average progress) and the
filter buttons update automatically from the list.

## Auto-discovery from GitHub

The hub can also pull projects straight from your repo's branches so the list
stays current on its own. It's configured in the `github` block of
`projects.json`:

```json
"github": {
  "owner": "ericjimm44",
  "repo": "freakenpr",
  "autoDiscover": true,
  "ignoreBranches": ["main", "master", "gh-pages"]
}
```

On load the hub queries the public GitHub API for branches. Any branch **not**
already covered by a curated entry (matched on its `branch` field) is added as
an *In Progress* card tagged `auto-discovered`. To give an auto-discovered
project a real description, status, or progress %, just add a curated entry with
the same `branch` value — the curated entry wins.

Set `"autoDiscover": false` to disable it. Note: unauthenticated GitHub API
calls are rate-limited (~60/hour per IP), which is plenty for a dashboard.
