# AIgnis — Autonomous Multimodal Marketing Engine

> Built by **Team AInigma** for the Infinity AI BuildFest 2026 · Domain: Branding & Marketing (MarTech) · Challenge: Multimodal Content Engine.

AIgnis turns a single product idea into a complete, on-brand marketing campaign.
A swarm of specialized AI agents researches the market, writes the copy, renders
the creative, produces channel-ready video and voice, publishes across channels,
then reads real performance and self-optimizes — grounded in the brand's live
data the whole way.

## Highlights

- **5-agent swarm** (Researcher · Analyst · Copywriter · Visual Director · Operations) with live, streamed collaboration.
- **Grounded** via a custom **MCP** inventory server and a **GraphRAG** brand knowledge graph.
- **Multimodal output:** copy, hero image (diffusion), video reels, and AI voiceover.
- **Closed loop:** publish → Campaign Pulse analytics → one-click self-optimization.
- **Cost-aware:** a semantic model router prefers local Llama, with full LLMOps telemetry.
- **Honest provenance:** every output labeled Live vs Simulated.
- **Free models:** Llama 3.x (Ollama/Groq/OpenRouter), FLUX/SDXL (Hugging Face/Pollinations).

## Quick start

Frontend (web app):
```cmd
npm install
npm run dev
```
Open the printed URL (default http://localhost:5173). Best at 1920×1080.

Backend (API + MCP, optional — runs standalone):
```cmd
cd server
npm install
npm run dev      :: API on http://localhost:8787
npm run mcp      :: MCP inventory server (stdio)
```

## Project structure

```
.
├── src/                 # React + Vite + TS frontend (the web app)
├── public/              # static assets (hero images, video, team photos)
├── server/              # Node + Fastify backend, MCP server, adapters
│   └── README.md        # backend docs (endpoints, free models, MCP)
├── automation/          # importable n8n workflows
├── video/               # 1920×1080 brand slideshow for the demo video
├── docs/                # project documentation
│   ├── development/     # database notes, refinement checklist, asset prompts
│   └── submission/      # hackathon submission material + video script
└── .kiro/specs/         # the source-of-truth spec (requirements + design)
```

See [`docs/README.md`](docs/README.md) for the documentation index.

## Tech stack

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · Recharts · Zustand
**Backend:** Node · Fastify · Server-Sent Events · @modelcontextprotocol/sdk · Zod
**AI & data:** Llama 3.x (Ollama/Groq/OpenRouter) · FLUX/SDXL (Hugging Face/Pollinations) · pgvector + GraphRAG
**Tooling:** built spec-first in Kiro (AI-DLC)

## Design system (Command Center)

Near-black canvas, electric cyan→violet→magenta accents. Sora (display), Inter
(body), JetBrains Mono (technical labels). Motion-rich: drifting aurora backdrop,
pulse-along-edge agent handoffs, blur-to-resolve hero, count-up analytics.

## Status

Frontend is feature-complete across all modules. Backend is built and tested as
a standalone service (not yet wired to the frontend). Database (Neon + pgvector)
is planned — see `docs/development/DATABASE_NOTES.md`.
