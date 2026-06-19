# Get Adventure Dad on your phone (free, ~5 minutes)

This app needs **no API keys** to run — it works fully on its own. Deploying just
puts it on the internet so you can open it on your phone and "Add to Home Screen"
like a real app. Your family's data stays **on your phone** (local-first); see
[Keeping your memories safe](#keeping-your-memories-safe) below.

## 3 steps to live

### 1. Import the repo into Vercel
- Go to **[vercel.com](https://vercel.com)** and sign up with your **GitHub** account.
- Click **Add New… → Project** and import **`ericjimm44/freakenpr`**.
- Vercel auto-detects Next.js. You don't need to change any build settings, and
  you don't need to add any environment variables.

### 2. Point it at this branch
The app lives on the branch **`claude/adventure-dad-saas-build-pam4v3`**.
- In the import screen (or later under **Settings → Git → Production Branch**),
  set the production branch to that branch.
- Click **Deploy**. First build takes ~1 minute.

> Prefer it on `main`? Tell me and I'll merge this branch to `main` so Vercel's
> default just works — then you can skip the branch step.

### 3. Add it to your home screen
- Open the Vercel URL on your phone (e.g. `your-project.vercel.app`).
- **iPhone:** Share → *Add to Home Screen*. **Android:** ⋮ menu → *Install app*.
- It now opens full-screen with its own icon, just like a native app.

That's it. Tap **"Explore the Martinez family demo"** to look around, or build
your own family and start logging summer missions.

## Optional upgrades (only if you ever want them)
Add these as environment variables in **Vercel → Settings → Environment Variables**;
the app keeps working without them.

| Variable | What it unlocks |
|---|---|
| `OPENAI_API_KEY` | Live AI recaps/suggestions instead of the built-in engine |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | A real interactive map on the Atlas screen |

## Keeping your memories safe
Because data lives on your phone (no cloud account needed):
- The app asks your browser to **keep its storage** so it isn't auto-cleared.
- When you log new memories, the home screen shows a **"Back up" nudge** —
  one tap saves a `.json` file (to iCloud/Google Drive/Files).
- To restore on a new phone: **Family → Import** and pick that file.

Back up every week or two over the summer and your adventures are never at risk.
