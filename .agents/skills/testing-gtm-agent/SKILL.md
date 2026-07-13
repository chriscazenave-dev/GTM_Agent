---
name: testing-gtm-agent
description: Test the GTM Agent Next.js app end-to-end (org charts, manual accounts, meeting notes, news feed). Use when verifying UI or store changes in this repo.
---

# Testing GTM Agent

## Setup
- `npm run dev` → http://localhost:3000. No auth or backend; everything is client-side.
- Lint/build gates: `npm run lint`, `npm run build` (CI runs lint + Vercel deploy).
- All state is localStorage under key `gtm-agent-store-v1`, seeded from `src/lib/mockData.ts` via `src/lib/store.tsx`. To reset to seed data, clear site data (or the Settings page reset if present). Remember: state persists across page reloads but is per-browser-profile.

## Key routes
- `/` News of the Day (filters: window, account, exec-only)
- `/org-charts` account index + "Add account manually" → `/accounts/new`
- `/org-charts/[accountId]` tree org chart (e.g. `acc-relativity` has the richest seed data)

## Testing the org chart
- **Press-and-hold drag**: cards require a ~250ms hold before dragging. With computer-use tools, `left_click_drag` will NOT work; use `mouse_move` to the card, `left_mouse_down` (no coordinate arg — move first), `wait 0.6s`, several `mouse_move` steps, then `left_mouse_up`.
- Drag positions persist to `OrgPerson.pos`; verify with a page reload. "Reset layout" clears them.
- Quick click (no hold) selects a card and opens the right-side detail panel (notes, reports-to dropdown, remove).
- Meeting notes: type in panel textarea, Save note → dated entry + note-count badge on the card; verify persistence via reload.
- Manager reassignment via the panel's "Reports to" select re-lays out the tree instantly.

## Manual account flow
- `/accounts/new`: "Use 6-layer scaffold template" prefills 7 rows with the reports-to chain. Blank names become `TBD — <title>` cards. Duplicate account names show an inline error. Create redirects to the new chart.

## Gotchas
- The header URL bar sometimes ignores ctrl+l typing if page focus was stolen; navigating via sidebar links is more reliable.
- Typed em-dashes may not register through synthetic keyboard input; avoid special characters in test strings or verify rendering.

## Devin Secrets Needed
- None for local UI testing. (EXA_API_KEY / APOLLO_API_KEY etc. only matter if live research integrations get wired in later.)
