# GTM Agent

Go-to-market agent for enterprise software sellers. Deep research on up to 50 accounts instead of boiling the ocean with 300 generic emails.

## Features

- **News of the Day** — account-level news feed (past week / 30 / 60 days) with exec LinkedIn activity and "why it matters" context
- **Suggested PG** — up to 10 pipeline-generation emails a day; approve, reject, or edit (the agent learns your writing voice from edits)
- **Org Charts** — deep-wiki style, 6-layer org maps per account (CEO → AVP/Sr Manager) with project–person connections and evidence links; move people around and add ones you find on LinkedIn
- **Ops vs PG Breakdown** — multi-threading targets with emails for active opportunities; best entry-point exec for PG accounts
- **Upload Data** — CSV import for accounts and opportunities (hard cap 50 accounts), with downloadable templates
- **Voice onboarding** — answer 8 questions by voice (mic recording + live browser transcription; Whisper once an OpenAI key is connected)
- **Settings** — API key slots for OpenAI, X, Exa.ai, and Apollo.io

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · localStorage-backed store (seeded with demo data)

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```
