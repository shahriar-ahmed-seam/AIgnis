# AIgnis — Infinity AI BuildFest 2026 · Submission Form (copy-paste ready)

Fill each field below. Checkbox sections list exactly which boxes to tick (✅)
plus the free-text to paste. Replace the link placeholders in the LINKS tab
with your real URLs before submitting.

---

## TAB: Basics

### Event & Team
- **Event:** The Infinity AI BuildFest 2026
- **Team:** AInigma
- **Phase:** Preliminary Submission (Due: May 30, 2026, 11:59 PM)

### Project Info

**Project Name**
```
AIgnis
```

**Elevator Pitch**
```
An autonomous, multi-agent marketing engine that turns a single product idea into a complete, on-brand, multimodal campaign — research, copy, creative, video, and channel strategy — then publishes and self-optimizes it.
```

**Public Summary**
```
AIgnis is an AI-native marketing platform that replaces the slow, fragmented agency workflow with a swarm of specialized AI agents. You describe a product in a sentence (typed or spoken) and a coordinated team of agents goes to work: a Researcher mines market signals and reviews, an Analyst pulls live inventory and brand context through a secure MCP connection, a Copywriter writes the brand voice, a Visual Director renders the hero creative with a diffusion model, and an Operations agent assembles channel-ready assets including short-form video reels and an AI voiceover.

Everything is grounded. A brand knowledge graph (GraphRAG) keeps the agents inside your brand rules, audience fit, and compliance constraints, while semantic RAG over scraped market data and customer reviews keeps the messaging relevant. Once a campaign launches across channels, AIgnis keeps working: a Campaign Pulse view reads real performance, an Analyst agent explains what's happening in plain language, and a one-click optimization loop rewrites the weak spots and improves the numbers.

The platform is built to be transparent and cost-aware. Every output is clearly labeled, a semantic model router sends simple work to fast local models and hard work to stronger models, and an LLMOps layer tracks token usage, latency, and spend in real time. AIgnis is designed for solo founders, small brands, and lean marketing teams who want enterprise-grade output without the enterprise-grade cost or headcount.
```

**Domain**
```
Branding & Marketing (MarTech)
```

**Challenge**
```
Multimodal Content Engine
```

**Problem Statement**
```
Launching and running a modern marketing campaign is expensive, slow, and fragmented. A single launch needs market research, audience analysis, positioning, copywriting, graphic design, video editing, channel formatting, publishing, and ongoing optimization — usually spread across multiple specialists and disconnected tools. Small brands and solo founders simply can't afford that, so they ship generic content and guess at what works.

Generic AI tools don't close the gap. They produce standalone copy or a one-off image, but they're blind to the things that actually matter: real inventory and pricing, brand voice and compliance rules, what's trending in the market right now, and how a campaign is performing after it goes live. They also create real risk — hallucinated claims, off-brand visuals, runaway API costs, and sensitive business data being pushed into public clouds.

The result is a painful middle ground: either expensive human teams, or cheap AI output that's disconnected from the business and unsafe to trust. There is no system that runs the entire campaign lifecycle end to end while staying grounded in a brand's real data and accountable for results.
```

**Solution Description**
```
AIgnis is an autonomous, event-driven multi-agent platform that runs the whole campaign lifecycle and stays grounded in the brand's real data.

A user describes a product (typed or spoken via voice input). That kicks off a stateful agent swarm:

• Researcher — runs semantic RAG over scraped competitor data, market signals, and customer reviews to surface trends and pain points.
• Analyst — queries the brand's live inventory, pricing, and margins securely through a Model Context Protocol (MCP) server, so the data never leaves the brand's control.
• Copywriter — an LLM generates and ranks on-brand headlines, body copy, and CTAs tuned to the retrieved audience signals.
• Visual Director — composes an art-direction brief and prompts a diffusion model to render a hero image locked to the brand palette.
• Operations — assembles the multimodal bundle: channel-native video reels, an AI voiceover, and per-channel formatting, then publishes.

Two systems keep it grounded and safe. A brand knowledge graph (GraphRAG, Neo4j-style) encodes audiences, brand rules, competitors, channels, and compliance constraints, and the agents traverse it before generating so they never cross a rule or mismatch a channel. A semantic model router classifies each task and sends it to the cheapest capable model — fast local Llama for parsing and bulk work, stronger hosted models for creative direction — cutting cost dramatically while an LLMOps layer tracks tokens, latency, cost, and cache hits in real time.

After launch, the loop closes. A Campaign Pulse view ingests real per-channel performance and viewer reactions; an Analyst agent narrates what's working in plain language; and a one-click optimization run re-engages the swarm to rewrite underperforming creative and reallocate spend. A persistent Brand Workspace remembers what it learns about each brand over time, so every campaign gets more on-brand than the last.

The stack is built AI-native end to end: real-time ingestion (CDC + scraping + review/social streams), a relational + vector store for RAG, the agent orchestration layer, multimodal generation, and an outbound layer that exposes its own MCP server so external tools can call AIgnis's synthesis engine.
```

---

## TAB: AI Detail / Usage  →  Data Lifecycle & Engineering

### 1. Data Sources
Tick: ✅ Internal (own DB / app data) · ✅ External APIs · ✅ Public Web (scraping) · ✅ User Uploads / Bulk Import · ✅ IoT / Sensor / Streaming · ✅ Synthetic / AI-generated Data

**List specific sources:**
```
Internal: brand inventory, pricing and margin tables, brand style guides, and campaign history stored in our own Postgres database. External APIs: hosted LLM and diffusion inference (Groq, OpenRouter, Hugging Face, Pollinations) and social trend signals. Public Web: competitor storefronts and social channels scraped for pricing, positioning, and creative trends. User uploads: brand assets, product data, and inventory files (JSON/CSV). Streaming: real-time inventory mutations via database change-data-capture. Synthetic: AI-generated copy, hero imagery, voiceover, and video reels produced by the engine itself.
```

### 2. Acquisition Methods
Tick: ✅ Web Scrapers (Playwright/Puppeteer/Scrapy) · ✅ AI Extraction (LLM parsing of unstructured) · ✅ MCP Servers for data access · ✅ Automated Flows (n8n/Airflow/cron/webhooks) · ✅ API Pull / SDK integrations · ✅ Speech-to-Text (Whisper, Deepgram)

**Scrapers / crawlers used:**
```
Headless Playwright for competitor storefronts and social pages, with rotating user agents and rate limiting. Review and trend pages are scraped on a schedule and queued for embedding.
```

**MCP servers for data access:**
```
A custom Model Context Protocol server (built on the official MCP SDK, stdio transport) exposes the brand's local inventory, pricing, and margin data to the agents. It offers tools like query_inventory, get_stock, and low_stock plus an inventory resource, so the Analyst agent reads live business data without that data ever touching a public cloud.
```

**Bulk upload / automated flows / AI extraction details:**
```
Bulk upload UI accepts JSON/CSV/XLSX inventory and brand-guide files. Scheduled flows (cron + webhooks) trigger competitor scrapes and review ingestion. Unstructured text (reviews, scraped pages) is parsed by an LLM in JSON mode into a strict schema. Voice input is transcribed with a speech-to-text model so users can describe a product by speaking.
```

### 3. Parsing, Formats & Cleaning
Tick: ✅ JSON · ✅ CSV · ✅ XLSX · ✅ PDF · ✅ XML · ✅ JSONL · ✅ Markdown · ✅ HTML · ✅ Images · ✅ Audio · ✅ Video

**Parsers used:**
```
LLM JSON-mode parsing for unstructured text, Unstructured.io and PyPDF for documents, Cheerio/BeautifulSoup for scraped HTML, pandas for tabular data, and FFmpeg for unpacking video into frames.
```

**Formatters / converters:**
```
Markdown→HTML for copy rendering, JSON↔Parquet via DuckDB for analytical rollups, image normalization to brand aspect ratios (9:16 / 1:1 / 16:9), and channel-native asset packaging.
```

**Data cleaning & enrichment:**
```
Deduplication of scraped records, normalization of pricing and stock fields, sentiment tagging of reviews, entity resolution against the brand catalog, and AI enrichment that maps raw signals to audience segments and trend scores.
```

**Schema validation:**
```
Zod on the TypeScript services and Pydantic on the Python side enforce strict runtime data contracts. JSON Schema contract tests guard the ingestion boundary; if an ingested asset breaks the marketing contract it triggers an automated agent self-healing retry instead of failing the run.
```

### 4. Storage Targets
Tick: ✅ Relational (Postgres) · ✅ Vector DB (pgvector) · ✅ Object Storage (S3/R2/GCS) · ✅ Data Warehouse (DuckDB) · ✅ Graph DB (Neo4j) · ✅ Cache / KV (Redis)

**Notes:**
```
Relational: Neon serverless Postgres holds users, brands, campaigns, inventory, published posts, and telemetry. Vector: pgvector (in the same Postgres) stores embeddings of reviews and market research for semantic RAG. Graph: a brand knowledge graph (Neo4j-style) maps audiences, brand rules, competitors, channels, and compliance constraints for GraphRAG. Object storage holds generated images and video reels. DuckDB does in-process analytical rollups for performance metrics. Redis caches repeated model calls and hot reads. Indexes on campaign_id and channel; tiered retention on raw scraped data.
```

### 5. Visualization (open source preferred)
Tick: ✅ Recharts · ✅ D3.js · ✅ Apache ECharts

**Visualization details:**
```
The app UI is built in React with Recharts for the analytics dashboards (market trend, audience resonance, predicted campaign lift) and custom D3/SVG for the live agent knowledge graph and node-swarm visualization. Charts animate in real time with count-ups and draw-in transitions; the agent activity stream and live data feed update over Server-Sent Events. Color and contrast are tuned for accessibility on a dark theme.
```

**Dashboards & reports:**
```
In-app dashboards for Campaign Pulse (per-channel performance + AI narrative), LLMOps observability (tokens, cost, latency, cache, model routing), and a live data-streams console. Campaign results are exportable; performance summaries can be scheduled.
```

### 6. Insights — AI, ML & Non-AI
Tick: ✅ Deep Learning (PyTorch/diffusion) · ✅ LLM Inference / RAG over data · ✅ Anomaly Detection · ✅ Clustering / Segmentation · ✅ Rule Engine / Heuristics (non-AI) · ✅ Statistical Analysis

**AI / ML details:**
```
LLMs (Llama 3.x via Groq/OpenRouter/Ollama) handle parsing, copy generation, and the agent reasoning. Diffusion models (FLUX / Stable Diffusion XL via Hugging Face and Pollinations) render hero creative. RAG runs over a pgvector store of reviews and market data; GraphRAG adds relationship-aware retrieval over the brand knowledge graph. Audience clustering segments customers; anomaly detection flags sudden shifts in campaign performance. A semantic router classifies each task and picks the cheapest capable model. Evaluation uses resonance scoring on copy candidates and brand-compliance checks before any asset ships.
```

**Non-AI analytics:**
```
SQL aggregations for KPIs (CTR, engagement, conversions, CAC, reach), deterministic rule engines that enforce brand and formatting constraints before generation, and statistical comparisons of campaign variants against benchmarks.
```

**How are insights delivered to users?**
```
In-app dashboards, a plain-language Analyst-agent narrative over the raw numbers, real-time agent activity logs, and a one-click optimization recommendation that the user can accept to re-run the swarm.
```

### 7. Pipelines & Orchestration

**Orchestration:**
```
A stateful multi-agent orchestrator (LangGraph-style state machine) coordinates the five agents with explicit handoffs and gated steps. n8n-style automated flows handle scheduled ingestion and webhooks.
```

**Scheduling / Triggers:**
```
Cron and pg_cron for scheduled scrapes and review ingestion; event-driven webhooks for publish and optimization triggers.
```

**Streaming / Real-time:**
```
Server-Sent Events stream agent activity and the live data console to the UI. Change-data-capture (Debezium-style) streams inventory mutations in real time; Kafka/NATS handles backpressure for concurrent multimodal generation.
```

### 8. Outbound — APIs & Distribution

**Outbound APIs:**
```
A REST API (Fastify) exposes the pipeline, live generation, knowledge graph, streams, pulse, publishing, and workspace. SSE endpoints stream agent events. Auth-guarded, with rate limiting and OpenAPI docs planned.
```

**Webhooks & exports:**
```
Outbound webhooks on campaign publish and optimization completion; CSV/PDF exports of campaign performance; generated images and reels exported to object storage.
```

**Embeddings / model serving:**
```
We expose our own MCP server so external tools can call AIgnis's inventory access and synthesis engine natively. Embeddings are generated for RAG; model inference is routed across hosted endpoints (Groq, Hugging Face, Pollinations) and local Ollama.
```

### 9. Open Source Stack
```
React, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand for the web app. Node.js + Fastify for the API, with Server-Sent Events for streaming. Model Context Protocol SDK (@modelcontextprotocol/sdk) for the inventory MCP server. Ollama for local LLM inference (Llama 3.1 8B); Hugging Face Diffusers and FLUX.1 / Stable Diffusion XL for image generation; Pollinations for keyless diffusion. Postgres + pgvector (Neon) for relational + vector storage; DuckDB for in-process analytics; Neo4j for the brand knowledge graph; Redis for caching. Zod and Pydantic for schema validation. Playwright for scraping, Unstructured.io and FFmpeg for parsing, Whisper-class speech-to-text for voice input. Built primarily in Kiro and VS Code.
```

### 10. Quality, Governance & Observability

**Data quality:**
```
Schema contract tests at every ingestion boundary (Zod/Pydantic), completeness and freshness checks on scraped data, and circuit-breakers that halt bad generation loops. Great Expectations-style checks validate ingested datasets before vectorization.
```

**Privacy & compliance:**
```
Sensitive business data (inventory, pricing, margins) stays local and is accessed only through the MCP server, never pushed to public clouds. A PII scrubbing pass runs regex + entity recognition over scraped/review data before vectorization. Brand-compliance rules in the knowledge graph gate every generated asset; access controls protect each brand workspace.
```

**Lineage & observability:**
```
Every model call is logged with model id, latency, token counts, cost, and cache status (LLMOps layer). Each output is labeled by its true source so provenance is auditable end to end. Prompt templates, context snapshots, and agent execution paths are tracked per run; structured logging and alerting on failures.
```

**Cost & performance:**
```
A semantic model router sends low-stakes tasks to free local models (Ollama) and reserves paid hosted models for high-value creative work. Semantic caching cuts repeated calls; batching and partitioning reduce load. Estimated cost reduction of ~70% versus an all-cloud baseline, tracked live in the observability dashboard.
```

**Anything else about your data stack?**
```
AIgnis is AI-native by design: the agents don't just consume data, they run the data ops. Retrieval is relationship-aware (GraphRAG) rather than flat similarity, so generation respects brand rules structurally. The whole system is built around an honest provenance model where every output declares whether it came from a live model or a fallback. Roadmap: pluggable brand connectors via MCP, fine-tuned per-brand voice models, and a fully closed performance-to-creative optimization loop.
```

### Publish local environment to internet
Tick: ✅ ngrok · ✅ Cloudflare Tunnel (cloudflared)

**Tunneling usage notes:**
```
Cloudflare Tunnel exposes the always-on MCP server and webhook receivers during development with an Access policy in front. ngrok with a reserved domain + basic auth is used for ad-hoc demos and OAuth callbacks. Dev-only; production uses managed hosting.
```

---

## TAB: Build Provenance

**Data & AI Provenance**
```
AIgnis is built on a transparent, auditable pipeline. Input data is collected programmatically (scrapers, API pulls, MCP-exposed internal stores) and passed through strict Zod/Pydantic validation before it's embedded or stored. We prioritize open-weight models for control and privacy: Llama 3.x runs locally via Ollama for parsing and agent logic, and FLUX.1 / Stable Diffusion XL via Hugging Face Diffusers generate visual assets, with hosted free tiers (Groq, OpenRouter, Pollinations) for scale. Every model call records its model id, version, latency, token usage, and cost; every generated output is labeled by its true source so live and fallback content are never confused. Prompt templates, context-window snapshots, and agent execution paths are logged per run to maintain a clean, reproducible provenance trail..
```

**Tooling & IDE**
```
Primary development in Kiro (agentic IDE) and VS Code. Frontend: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand. Backend: Node.js 20, Fastify, tsx, Zod, Server-Sent Events. Agents & data: LangGraph-style orchestration, Model Context Protocol SDK, Ollama, Hugging Face Diffusers/Transformers, Playwright, Unstructured.io, FFmpeg. Storage: Neon Postgres + pgvector, DuckDB, Neo4j, Redis. Containerized with Docker Compose for local MCP servers and services.
```

---

## TAB: Links

**YouTube Video**
```
<paste your demo video URL here, e.g. https://youtu.be/XXXXXXXX>
```

**Demo / Live Links**
```
Live app: <paste your deployed URL, e.g. https://ainigma.vercel.app>
Repository: <paste your repo URL>
MCP server / API: <paste if exposed>
```

---

## Submission checklist (the form's 9 required fields)
1. Project Name ✅
2. Elevator Pitch ✅
3. Public Summary ✅
4. Problem Statement ✅
5. Solution Description ✅
6. Data & AI Provenance ✅
7. Tooling & IDE ✅
8. YouTube Video → add your link
9. Demo / Live Links → add your link
