# AInigma — Multimodal Content Engine (Demo Frontend)

Hackathon prototype for the **Multimodal Content Engine** track (Branding &
Marketing / MarTech). A swarm of specialized AI agents turns a raw product idea
into a launch-ready, on-brand campaign — copy + hero creative + analytics.

This is **Phase 1**: a polished, frontend-aesthetics-first demo driven entirely
by mock data. No backend, no network calls. Phases 2 (simulation backend) and 3
(live LLM/Diffusion/MCP pass) layer on later per the spec.

## Run it

```cmd
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). Best viewed at 1920×1080.

## The flow

1. **Landing** — type a product idea or pick a preset chip, hit *Forge Campaign*.
2. **Agent Activity** — watch the 5-agent swarm collaborate on a node graph with
   a live streaming log. Speed control paces the run (1× / 2× / 4×).
3. **Creative** — the finished ad creative renders (hero image + typed copy in an
   on-brand layout) alongside a synthetic analytics dashboard. *Run another* loops it.

## Design system (Command Center)

- Near-black void canvas, electric cyan→violet→magenta accents.
- Fonts: Sora (display), Inter (body), JetBrains Mono (technical labels).
- Motion via Framer Motion: drifting aurora backdrop, pulse-along-edge handoffs,
  blur-to-resolve hero, typed copy, count-up analytics.
- Every output carries an honest **Live / Simulated** badge (spec Req 11).

## Real images (optional upgrade)

The UI looks finished with CSS gradient placeholders. To use photo-real heroes,
generate them from `ASSET_PROMPTS.md` and drop PNGs in `public/heroes/`.

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · Recharts · Zustand
