# AInigma Backend (Demo)

The backend for AInigma — a Node + Fastify + TypeScript service that runs the
simulated multi-agent pipeline, streams agent events over SSE, exposes an
optional **Live Pass** (real free models), and ships a standalone **MCP
inventory server**.

> Not yet wired to the frontend — this is a standalone, fully tested service.
> Default mode is **Simulated** (no keys, no network). Every Live capability is
> guarded by a Fallback Controller, so missing/slow/erroring providers
> transparently fall back to curated mock data labeled `"Simulated"`.

---

## Run it

```cmd
cd server
npm install
npm run dev        :: starts the API on http://localhost:8787
```

Optional — copy `.env.example` to `.env` to enable Live models (see below).

Standalone MCP server (stdio):

```cmd
npm run mcp
```

Smoke-test the MCP server end to end:

```cmd
npx tsx src/mcp/testClient.ts
```

---

## Free models used

Everything below has a genuinely free option. Nothing is required — with no
config the server runs fully simulated.

### Text (LLM) — set `LLM_PROVIDER`
| Provider | Model ids (free) | Key needed | Notes |
| --- | --- | --- | --- |
| `groq` | `llama-3.1-8b-instant`, `llama-3.3-70b-versatile` | free key | Hosted **Llama 3.x**, very fast. [console.groq.com](https://console.groq.com/keys) |
| `openrouter` | `meta-llama/llama-3.1-8b-instruct:free`, `google/gemma-2-9b-it:free`, `mistralai/mistral-7b-instruct:free` | free key | OpenAI-compatible. [openrouter.ai](https://openrouter.ai/keys) |
| `ollama` | `llama3.1:8b` (and any pulled model) | **none** | Fully local, offline. [ollama.com](https://ollama.com) |

### Image (Diffusion) — set `IMAGE_PROVIDER`
| Provider | Model | Key needed | Notes |
| --- | --- | --- | --- |
| `pollinations` | `flux` (Flux/SD) | **none** | Free, no key. [pollinations.ai](https://pollinations.ai) |
| `huggingface` | `black-forest-labs/FLUX.1-schnell`, `stabilityai/stable-diffusion-xl-base-1.0` | free token | HF Inference API. [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

The default agent-pipeline narrative also references local **Llama 3 via
Ollama** for fast extraction and a larger hosted model for creative direction —
matching the LLMOps "semantic router" story in the frontend.

---

## API

### Core pipeline + live pass + MCP
| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Status + capability report (frontend source-selection probe) |
| GET | `/presets` | Preset product ideas |
| POST | `/pipeline/run` | Start a run → `{ runId, pillarStatuses, dataset }` |
| GET | `/pipeline/:id/events` | **SSE** stream: `hello` → `agent`* → `asset` → `done` |
| GET | `/pipeline/:id/asset` | Final creative asset (`202` while pending) |
| POST | `/live/copy` | One real LLM copy generation (Fallback-guarded) |
| POST | `/live/image` | One real diffusion image (Fallback-guarded) |
| GET | `/live/capabilities` | What's actually live right now |
| GET | `/inventory?q=` | Read local inventory (same data MCP exposes) |
| GET | `/generated/:file` | Serve a live-generated image |

### Platform modules (all coded + tested; not yet wired to the frontend)
| Module | Method | Path | Purpose | Tool / API used |
| --- | --- | --- | --- | --- |
| **GraphRAG** | GET | `/graph` | Full brand knowledge graph (nodes + edges) | In-memory typed property graph (Neo4j-style query shape) |
| | GET | `/graph/node/:id` | Direct relationships of a node | ↑ |
| | GET | `/graph/traverse/:id?depth=` | BFS var-length path traversal | ↑ |
| | POST | `/graph/rule-check` | Brand-rule gate for a candidate creative | ↑ |
| **LLMOps** | GET | `/observability/metrics` | Real metered latency/tokens/cost/cache + router decisions | In-process telemetry recorder + `JsonStore` (Node `fs`); cost via public list-price table |
| | GET | `/observability/models` | Model fleet + per-1M token prices | ↑ |
| **Data Streams** | GET | `/streams/info` | Source metadata + cadences | In-process generators |
| | GET | `/streams/live` | **SSE** real server-pushed ingestion feed (CDC/scraper/reviews/social) | Server-Sent Events |
| **Campaign Pulse** | GET | `/pulse/:campaignId?presetId=` | Get-or-create post-launch performance | `JsonStore` persistence |
| | POST | `/pulse/:campaignId/optimize` | Run the self-optimization loop (applies lift) | ↑ |
| **Publishing** | POST | `/publish` | Publish a campaign to channels (simulated) | `JsonStore`; links open the platform |
| | GET | `/published` | List published posts | ↑ |
| | DELETE | `/published` | Clear gallery | ↑ |
| **Brand Workspace** | GET | `/workspace` | Brand profile + learnings + history | `JsonStore` persistence |
| | POST | `/workspace/history` | Append a campaign to history | ↑ |
| | POST | `/workspace/learning` | Add a confidence-ranked learning | ↑ |
| | PATCH | `/workspace/profile` | Update brand profile | ↑ |

### Request examples

```jsonc
// POST /pipeline/run
{ "productIdea": "eco sneakers", "executionMode": "Simulated", "speed": 1 }

// POST /live/copy   (falls back to curated copy if no LLM configured)
{ "productIdea": "cold brew coffee" }
```

---

## MCP Servers (5)

All built on `@modelcontextprotocol/sdk`, speaking MCP over **stdio**. Each
wraps a real backend service so agents reach private/grounding data through the
protocol. Verified via `src/mcp/testAllServers.ts` (boots each, lists tools/
resources, calls tools).

| Server | Run | Tools | Resource | Wraps |
| --- | --- | --- | --- | --- |
| `aignis-inventory` | `npm run mcp` | query_inventory · get_stock · low_stock | `inventory://all` | `data/inventory.json` |
| `aignis-brand-guidelines` | `npm run mcp:brand` | list_brand_rules · check_compliance · get_relationships · traverse_graph | `brand://graph` | `services/graph.ts` (GraphRAG) |
| `aignis-campaign-memory` | `npm run mcp:memory` | get_brand_profile · recall_learnings · list_campaigns · record_learning · record_campaign | `memory://workspace` | `services/workspace.ts` |
| `aignis-market-intel` | `npm run mcp:market` | pull_signals · pull_reviews · trending_signals | `market://sources` | `services/streamSource.ts` |
| `aignis-campaign-analytics` | `npm run mcp:analytics` | get_campaign_pulse · channel_summary · optimize_campaign | — | `services/pulse.ts` |

Totals: **5 servers · 18 tools · 4 resources**, all stdio.

Use any of them from an MCP client (e.g. Claude Desktop):
```json
{
  "mcpServers": {
    "aignis-inventory": {
      "command": "npx",
      "args": ["tsx", "<abs-path>/server/src/mcp/inventoryServer.ts"]
    },
    "aignis-brand-guidelines": {
      "command": "npx",
      "args": ["tsx", "<abs-path>/server/src/mcp/brandGuidelinesServer.ts"]
    }
  }
}
```

---

## Architecture

```
src/
  index.ts            Fastify app, CORS, static /generated, route registration
  config.ts           .env loader + typed config + capability flags
  types.ts            domain contract (mirrors frontend design.md)
  lib/
    fallback.ts       Fallback Controller (timeout/error → mock) + fetchWithTimeout
    store.ts          JsonStore — dependency-free JSON persistence (Node fs)
  data/
    datasets.ts       curated mock datasets (4) + resolveDataset()
    scriptBuilder.ts  agent-script authoring helper
  adapters/
    copy.ts           LLM copy: Groq | OpenRouter | Ollama + Mock (telemetry-instrumented)
    image.ts          Diffusion: Pollinations | HuggingFace + Mock (telemetry-instrumented)
    inventory.ts      File-based + Mock inventory providers
  services/           domain logic
    orchestrator.ts   simulated swarm: schedules events, SSE pub/sub, finalize()
    telemetry.ts      LLMOps recorder: latency/tokens/cost/cache + cost table
    graph.ts          GraphRAG brand knowledge graph + BFS traversal + rule gate
    streamSource.ts   live ingestion event generators (CDC/scraper/reviews/social)
    pulse.ts          campaign post-launch performance + optimization loop
    publish.ts        publish to channels (simulated) + Published gallery
    workspace.ts      persistent brand memory (profile, learnings, history)
  routes/
    pipeline.ts  live.ts  inventory.ts  telemetry.ts
    graph.ts     streams.ts  pulse.ts   publish.ts  workspace.ts
  mcp/
    inventoryServer.ts  standalone MCP server (stdio)
    testClient.ts       MCP smoke-test client
data/inventory.json   the local inventory the MCP server + adapters read
.data/                created at runtime — JsonStore persistence (gitignored)
```

## Tools & APIs used (summary)

| Concern | Tool / API | Free? |
| --- | --- | --- |
| HTTP server | Fastify + `@fastify/cors` | yes |
| Validation | Zod | yes |
| Real-time streaming | Server-Sent Events (native) | yes |
| LLM (text) | Groq / OpenRouter / Ollama (Llama 3.x, Gemma, Mistral) | yes |
| Diffusion (image) | Pollinations (Flux/SD) / HuggingFace (FLUX.1-schnell, SDXL) | yes |
| MCP | `@modelcontextprotocol/sdk` (stdio) | yes |
| Persistence | `JsonStore` (Node `fs`) — no DB dependency | yes |
| Knowledge graph | in-memory typed graph (Neo4j-style shape) | yes |
| Telemetry/cost | in-process recorder + public list-price table | yes |
| Dev runtime | `tsx` (TS execution + watch) | yes |

### Design guarantees
- **Never crashes a run** — `finalize()` has a total safety net; the Fallback
  Controller wraps every real call (LLM 20s, image 60s, MCP 10s timeouts).
- **Honest labels** — every output carries `"Live"` or `"Simulated"` decided by
  its actual source, even when a Live run falls back mid-flight.
- **No network in Simulated mode** — a full run touches zero external endpoints.
- **Late subscribers** — SSE replays buffered events so a client that connects
  after `/pipeline/run` still sees the whole stream.
```
