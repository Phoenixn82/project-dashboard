# Project Dashboard — Design Spec

**Date:** 2026-04-23
**Owner:** phoenixn82 (thero)
**Status:** Approved

## Goal

A clean, single-page project dashboard that displays all active projects from the `claude_projects` folder. Left sidebar for filtering, card grid in the main area with expandable detail views, and a nightly GitHub Actions script that keeps project data fresh — all free, all automated with scripts (not Claude loops).

## Projects (as of 2026-04-23)

| ID | Name | Repo | Stack | Type |
|---|---|---|---|---|
| atlas | Atlas | Phoenixn82/atlas | Next.js | web-app |
| claude-usage-widget | Claude Usage Widget | SlavomirDurej/claude-usage-widget | Electron | desktop-app |
| facebook-car-scraper | Facebook Car Scraper | Phoenixn82/facebook-car-scraper | Python, Docker | desktop-app |
| hometown-hybrids | Hometown Hybrids | Phoenixn82/HometownHybrids | Next.js | web-app |
| job-findr | Job Findr | Phoenixn82/job-findr | Next.js, Supabase, Python | web-app |

**Not projects** (excluded from dashboard): `gstack_integration` (skill config docs), `skills/` (gstack skill library), loose Roblox files (reference material).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Data:** Static `projects.json` at repo root
- **Automation:** GitHub Actions (cron) + Node script
- **Hosting:** Vercel free tier or static export
- **Cost:** $0

## 1. Layout & UI

### Two-Panel Layout

- **Left sidebar** (~250px, collapsible on mobile):
  - Dashboard title/logo at top
  - "All Projects" reset button
  - Three collapsible filter groups as accordions:
    - **Status**: Active, Paused, Idea — pill toggles, multi-select
    - **Stack**: Next.js, Electron, Python, Supabase, Docker — pill toggles, multi-select
    - **Type**: Web App, Desktop App, Tool, Script — pill toggles, multi-select
  - Dark background, light text — contrast with main area

- **Main area** (remaining width):
  - Header bar: project count ("5 projects"), search input
  - Responsive card grid: 3 columns desktop, 2 tablet, 1 mobile

### Color & Style

Clean, minimal aesthetic inspired by Claude's design language:
- Light main background (#fafafa or similar)
- Dark sidebar (#1a1a2e or similar deep navy/charcoal)
- Subtle card shadows, rounded corners (8px)
- Status badges: green (active), amber (paused), gray (idea)
- Monospace font for commit info, sans-serif for everything else

### Project Cards (Collapsed)

Each card shows:
- Project name (bold)
- Status badge (colored pill)
- Stack tags (small, muted pills)
- Type tag
- Last commit message (truncated to 1 line) + relative date ("2 days ago")
- GitHub icon link (opens repo in new tab)

### Project Cards (Expanded)

Clicking a card expands it inline (pushes other cards down, no page navigation):
- Full project description/blurb
- Recent commits list (last 5): message, date, short SHA linking to GitHub commit
- Action buttons row:
  - "View on GitHub" — opens repo
  - "Open App" / "Visit Site" — if `liveUrl` is set (hidden otherwise)
- Tech stack detail list
- Last updated timestamp

Expand/collapse animated with a smooth height transition.

## 2. Data Model — `projects.json`

```json
[
  {
    "id": "atlas",
    "name": "Atlas",
    "description": "Industry-specific landing pages with dynamic theming and static generation",
    "localPath": "atlas",
    "githubRepo": "Phoenixn82/atlas",
    "liveUrl": null,
    "status": "active",
    "stack": ["nextjs", "tailwind"],
    "type": "web-app",
    "lastCommit": {
      "message": "",
      "date": "",
      "sha": ""
    },
    "recentCommits": [
      { "message": "...", "date": "...", "sha": "..." }
    ],
    "openIssues": 0,
    "repoDescription": "",
    "updatedAt": ""
  }
]
```

### Field ownership

- **Manual** (set by user, persisted across updates): `id`, `name`, `description`, `localPath`, `githubRepo`, `liveUrl`, `status`, `stack`, `type`
- **Auto-updated** (nightly script overwrites these): `lastCommit`, `recentCommits`, `openIssues`, `repoDescription`, `updatedAt`

The nightly script reads the existing file, preserves all manual fields, and only overwrites the auto-updated fields. It never deletes or reorders entries.

## 3. Nightly Automation — GitHub Actions

### Workflow: `.github/workflows/update-projects.yml`

**Trigger:** `schedule: cron: '0 7 * * *'` (7am UTC = 3am EST)
**Also:** `workflow_dispatch` for manual runs

### Steps

1. Checkout the `project_dashboard` repo
2. Run `scripts/update-projects.mjs` (Node 20)
3. For each entry in `projects.json` that has a `githubRepo`:
   - `GET /repos/{owner}/{repo}` — grab description, open_issues_count
   - `GET /repos/{owner}/{repo}/commits?per_page=5` — grab last 5 commits
4. Merge fetched data into the auto-updated fields
5. Write `projects.json` back (pretty-printed, deterministic key order)
6. If the file changed: `git add projects.json && git commit -m "chore: nightly project data update" && git push`
7. If unchanged: no-op, exit cleanly

### Auth

Uses `GITHUB_TOKEN` (automatically provided by Actions) for API calls. Sufficient for public repos. For private repos on the same account, the default token works too.

### Error handling

- If a single repo API call fails (404, rate limit), log a warning and skip that project — don't fail the whole run
- The script exits 0 unless something catastrophic happens (can't read/write the JSON file)

### Estimated resource usage

- ~15 seconds per run (5 API calls, minimal compute)
- 30 runs/month = ~8 minutes/month
- Well under the 2,000 free minutes

## 4. New Project Detection

The nightly script does NOT auto-detect new projects (it can't see local folders from GitHub Actions). New projects are added by:

1. User manually adds an entry to `projects.json`
2. Or next time user chats with Claude, Claude can add it

The dashboard UI will render whatever is in `projects.json` — adding a project is just adding a JSON object.

## 5. File Structure

```
project_dashboard/
├── .github/
│   └── workflows/
│       └── update-projects.yml
├── scripts/
│   └── update-projects.mjs
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── globals.css
│       └── components/
│           ├── Sidebar.tsx
│           ├── FilterGroup.tsx
│           ├── ProjectGrid.tsx
│           ├── ProjectCard.tsx
│           └── ProjectCardExpanded.tsx
├── projects.json
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-23-project-dashboard-design.md
```

## 6. Deployment

**Option A (recommended):** Vercel free tier — auto-deploys on push, perfect for Next.js.
**Option B:** Static export (`next export`) hosted on GitHub Pages — also free.

Both are $0. Vercel is less config. The nightly script pushes to the repo, which triggers a Vercel redeploy automatically — so the live dashboard always reflects the latest data.

## Non-Goals

- No database — `projects.json` is the entire data layer
- No authentication — this is a personal dashboard
- No real-time updates — nightly is sufficient
- No AI/Claude in the automation loop — pure scripts
- No local folder scanning from CI — only GitHub API data
