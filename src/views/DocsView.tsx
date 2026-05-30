import { useState } from "react";
import { motion } from "framer-motion";
import { TeamGrid } from "../components/features/TeamGrid";
import { DocsAdminBar } from "../components/features/DocsAdminBar";
import { useAuth } from "../stores/authStore";
import { useDocs } from "../stores/docsStore";

/**
 * Live /docs module — YC-style pitch deck + technical whitepaper + live system
 * dashboard, with admin access control + scheduling and a team showcase.
 *
 * Access: admins always see it (with controls). Non-admins see it only when
 * publicly visible per the schedule; otherwise a "Not Available" gate.
 */

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem & Solution" },
  { id: "why-now", label: "Why Now" },
  { id: "product", label: "Product" },
  { id: "market", label: "Market & Model" },
  { id: "competition", label: "Competition" },
  { id: "features", label: "Feature Matrix" },
  { id: "architecture", label: "Architecture" },
  { id: "dataflow", label: "Data Flow" },
  { id: "stack", label: "Tech Stack" },
  { id: "api", label: "API" },
  { id: "data-layer", label: "Data Layer" },
  { id: "ai-layer", label: "AI Layer" },
  { id: "security", label: "Security" },
  { id: "performance", label: "Performance" },
  { id: "roadmap", label: "Roadmap" },
  { id: "team", label: "Team" },
  { id: "changelog", label: "Changelog" },
];

export function DocsView() {
  const user = useAuth((s) => s.user);
  const isAdmin = !!user?.isAdmin;
  const visible = useDocs((s) => s.isPubliclyVisible());
  const [active, setActive] = useState("overview");

  // Access gate: non-admins blocked when not publicly visible.
  if (!isAdmin && !visible) {
    return <NotAvailable />;
  }

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(`docs-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full">
      {/* section nav */}
      <nav className="hidden w-56 shrink-0 overflow-y-auto border-r border-white/[0.06] p-4 lg:block print:hidden">
        <div className="label-mono mb-3 px-2">Contents</div>
        <div className="space-y-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => jump(n.id)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                active === n.id ? "bg-violet/15 text-violet-glow" : "text-ink-500 hover:text-ink-300"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-4xl">
          {/* header */}
          <div className="mb-6 flex items-end justify-between print:hidden">
            <div>
              <h1 className="font-display text-3xl font-extrabold">
                <span className="text-ink-100">AI</span>
                <span className="text-gradient">gnis</span>
                <span className="ml-3 align-middle font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
                  Live Docs
                </span>
              </h1>
              <p className="mt-1 text-sm text-ink-300">
                Pitch deck · technical whitepaper · live system view
              </p>
            </div>
            <button onClick={() => window.print()} className="btn-ghost text-xs">
              ⤓ Export PDF
            </button>
          </div>

          {isAdmin && <DocsAdminBar />}

          <div className="space-y-6">
            <Sec id="overview" title="Product Overview">
              <p className="text-lg leading-relaxed text-ink-200">
                AIgnis is an <span className="text-gradient font-semibold">autonomous multimodal
                marketing engine</span>. Describe a product in one sentence and a swarm of AI agents
                researches the market, writes the copy, renders the creative, produces channel-ready
                video and voice, publishes, and then reads real performance to self-optimize — all
                grounded in the brand's live data.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {STATS.map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} />
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-ink-300">
                <strong className="text-ink-100">Target users:</strong> solo founders, small brands,
                and lean marketing teams who need enterprise-grade campaigns without enterprise cost
                or headcount. <strong className="text-ink-100">Core use cases:</strong> product
                launches, always-on social campaigns, and rapid A/B creative generation.
              </p>
            </Sec>

            <Sec id="problem" title="Problem & Solution">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card accent="#f472b6" title="Problem">
                  Modern campaigns need research, copy, design, video, publishing, and optimization —
                  across many specialists and tools. Small brands can't afford it, and generic AI
                  tools are blind to real inventory, brand rules, and post-launch performance, so they
                  produce off-brand, risky, disconnected output.
                </Card>
                <Card accent="#a3e635" title="Solution">
                  One autonomous platform that runs the whole lifecycle, grounded via a secure MCP
                  connection to live business data and a brand knowledge graph, with an honest
                  live-vs-simulated provenance model and a cost-aware semantic model router.
                </Card>
              </div>
            </Sec>

            <Sec id="why-now" title="Why Now">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>• Open-weight LLMs (Llama 3.x) and diffusion models are now good enough and cheap enough to run the full creative loop.</li>
                <li>• The Model Context Protocol gives agents a standard, secure way to reach private business data — the missing piece for grounded marketing AI.</li>
                <li>• Short-form, multi-channel content demand has outpaced what human teams can produce; brands need autonomous, on-brand generation.</li>
              </ul>
            </Sec>

            <Sec id="product" title="Product — the agent swarm">
              <div className="space-y-2">
                {AGENTS.map((a, i) => (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <span className="text-2xl" style={{ color: a.color }}>{a.glyph}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-ink-100">{a.name}</div>
                      <div className="text-xs text-ink-300">{a.role}</div>
                    </div>
                    <span className="rounded-md px-2 py-1 font-mono text-[10px]" style={{ color: a.color, background: `${a.color}14` }}>
                      {a.pillar}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Sec>

            <Sec id="market" title="Market Opportunity & Business Model">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card accent="#22d3ee" title="Market">
                  Global martech + digital advertising spend is in the hundreds of billions. Our wedge
                  is the underserved long tail: millions of solo founders and SMBs priced out of
                  agencies and overwhelmed by point tools.
                </Card>
                <Card accent="#a78bfa" title="Business model">
                  Tiered SaaS (Starter free, Pro $79/mo, Agency $349/mo) plus usage-based generation
                  credits, and a differentiated performance model — 8% of measured incremental
                  campaign lift — made possible by our closed optimization loop.
                </Card>
              </div>
            </Sec>

            <Sec id="competition" title="Competition & Unique Advantage">
              <p className="text-sm leading-relaxed text-ink-300">
                Generic AI writers/image tools produce disconnected one-offs. Agencies are slow and
                expensive. Point automation tools don't generate creative.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {EDGE.map((e) => (
                  <div key={e.t} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-sm font-bold text-ink-100">{e.t}</div>
                    <div className="mt-1 text-xs text-ink-300">{e.d}</div>
                  </div>
                ))}
              </div>
            </Sec>

            <Sec id="features" title="Feature Matrix">
              <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.03] font-mono text-[11px] uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-4 py-2">Feature</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.map((f) => (
                      <tr key={f.name} className="border-t border-white/[0.04]">
                        <td className="px-4 py-2.5 text-ink-200">{f.name}</td>
                        <td className="px-4 py-2.5">
                          <StatusPill status={f.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Sec>

            <Sec id="architecture" title="Architecture">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {ARCH.map((c) => (
                  <div key={c.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-sm font-bold text-ink-100">{c.title}</div>
                    <ul className="mt-2 space-y-1 text-xs text-ink-300">
                      {c.items.map((it) => <li key={it}>• {it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06] bg-void-900/60 p-4 font-mono text-[11px] leading-relaxed text-ink-300">
{`UI (React) ──▶ API (Fastify) ──▶ Orchestrator ──▶ Agents
                                   │
        ┌──────────────────────────┼─────────────────────────┐
        ▼                          ▼                          ▼
   MCP server               RAG + GraphRAG            Diffusion / LLM
 (inventory, stdio)      (pgvector + Neo4j)        (FLUX / Llama)
        └──────────────▶ Fallback Controller ◀──────────────┘
                                   │
                              SSE ▶ UI (live agent stream)`}
              </pre>
            </Sec>

            <Sec id="dataflow" title="Data Flow">
              <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-void-900/60 p-4 font-mono text-[11px] leading-relaxed text-ink-300">
{`Input (idea / voice)
   ▶ Retrieval (RAG over reviews + market, GraphRAG over brand rules)
   ▶ Grounding (MCP: live inventory / pricing / margin)
   ▶ Generation (LLM copy · diffusion image · video · voice)
   ▶ Compliance gate (brand-rule nodes) ▶ Output
   ▶ Publish ▶ Performance ingest ▶ Analyst narrative
   ▶ Optimization loop ───────────────────────────────┐
   ◀───────────────────────────────────────────────────┘ (feedback)`}
              </pre>
            </Sec>

            <Sec id="stack" title="Technology Stack">
              <div className="flex flex-wrap gap-2">
                {TECH.map((t) => (
                  <span key={t} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-ink-300">
                    {t}
                  </span>
                ))}
              </div>
            </Sec>

            <Sec id="api" title="API Documentation">
              <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] font-mono uppercase tracking-wider text-ink-500">
                    <tr><th className="px-4 py-2">Method</th><th className="px-4 py-2">Endpoint</th><th className="px-4 py-2">Purpose</th></tr>
                  </thead>
                  <tbody className="font-mono">
                    {API.map((e) => (
                      <tr key={e.path} className="border-t border-white/[0.04]">
                        <td className="px-4 py-2 text-cyan-glow">{e.method}</td>
                        <td className="px-4 py-2 text-ink-200">{e.path}</td>
                        <td className="px-4 py-2 font-sans text-ink-300">{e.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink-500">
                Auth model: session-based (roadmap: JWT + RBAC). We also expose our own MCP server
                (stdio) so external tools can call our inventory + synthesis engine.
              </p>
            </Sec>

            <Sec id="data-layer" title="Data Layer">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>• <strong className="text-ink-100">Sources:</strong> internal inventory/brand data, scraped competitor + review pages, social trend signals, user uploads.</li>
                <li>• <strong className="text-ink-100">Parsing:</strong> LLM JSON-mode, Unstructured.io, FFmpeg; validated with Zod/Pydantic contracts.</li>
                <li>• <strong className="text-ink-100">Storage:</strong> Postgres (Neon) + pgvector for RAG, Neo4j-style graph, object storage for assets, DuckDB rollups, Redis cache.</li>
                <li>• <strong className="text-ink-100">Privacy:</strong> business data stays local behind the MCP server; PII scrubbed before vectorization.</li>
              </ul>
            </Sec>

            <Sec id="ai-layer" title="AI Layer">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>• <strong className="text-ink-100">Models:</strong> Llama 3.x (Ollama/Groq/OpenRouter) for text; FLUX/SDXL (HuggingFace/Pollinations) for images.</li>
                <li>• <strong className="text-ink-100">Retrieval:</strong> hybrid pgvector RAG + relationship-aware GraphRAG over brand rules.</li>
                <li>• <strong className="text-ink-100">Routing:</strong> a semantic router sends cheap tasks to local models, escalating only high-value work — ~70% cost cut.</li>
                <li>• <strong className="text-ink-100">Explainability:</strong> every output labeled Live vs Simulated; LLMOps tracks tokens, latency, cost, cache.</li>
              </ul>
            </Sec>

            <Sec id="security" title="Security">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>• Auth + role-based access (admin / super-admin gate the /docs controls).</li>
                <li>• Sensitive data accessed only via the MCP protocol, never pushed to public clouds.</li>
                <li>• Output schema validation + brand-compliance gate before any asset ships.</li>
                <li>• Fallback Controller bounds every external call with a timeout.</li>
              </ul>
            </Sec>

            <Sec id="performance" title="Performance & Scalability">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>• Semantic caching + cheap-model routing cut cost and latency.</li>
                <li>• SSE streaming keeps the UI responsive during long agent runs.</li>
                <li>• Stateless API + serverless Postgres (Neon) scale horizontally; queue/backpressure for concurrent generation.</li>
              </ul>
            </Sec>

            <Sec id="roadmap" title="Product Roadmap">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {ROADMAP.map((r, i) => (
                  <div key={r.phase} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-2xl font-extrabold text-gradient">0{i + 1}</div>
                    <div className="mt-1 text-sm font-bold text-ink-100">{r.phase}</div>
                    <div className="mt-1 text-xs text-ink-300">{r.detail}</div>
                  </div>
                ))}
              </div>
            </Sec>

            <Sec id="team" title="Team & Contributors">
              <TeamGrid />
            </Sec>

            <Sec id="changelog" title="Changelog">
              <div className="space-y-2">
                {CHANGELOG.map((c) => (
                  <div key={c.v} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="rounded-md bg-violet/15 px-2 py-0.5 font-mono text-[10px] text-violet-glow">{c.v}</span>
                    <span className="text-sm text-ink-300">{c.note}</span>
                  </div>
                ))}
              </div>
            </Sec>

            <div className="border-t border-white/[0.06] pt-6 text-center font-mono text-[11px] text-ink-500">
              AIgnis · Team AInigma · Infinity AI BuildFest 2026 · built spec-first in Kiro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotAvailable() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-5xl opacity-40">🔒</div>
      <h2 className="font-display text-2xl font-bold text-ink-100">Docs not available</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-300">
        This documentation is published on a schedule and isn't currently public. Please check back
        during the available window.
      </p>
    </div>
  );
}

function Sec({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={`docs-${id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      className="panel scroll-mt-6 p-6"
    >
      <h3 className="mb-4 font-display text-xl font-bold text-ink-100">{title}</h3>
      {children}
    </motion.section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
      <div className="font-display text-2xl font-extrabold text-gradient">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
    </div>
  );
}

function Card({ accent, title, children }: { accent: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <span className="text-sm font-bold text-ink-100">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-ink-300">{children}</p>
    </div>
  );
}

function StatusPill({ status }: { status: "live" | "upcoming" | "planned" }) {
  const map = {
    live: { c: "#a3e635", t: "Live" },
    upcoming: { c: "#22d3ee", t: "Upcoming" },
    planned: { c: "#6b748f", t: "Planned" },
  }[status];
  return (
    <span className="rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider" style={{ color: map.c, background: `${map.c}1a` }}>
      {map.t}
    </span>
  );
}

const STATS = [
  { value: "5", label: "AI agents" },
  { value: "4", label: "modalities" },
  { value: "~70%", label: "cost cut" },
  { value: "~60s", label: "to a campaign" },
];

const AGENTS = [
  { name: "Researcher", role: "Semantic RAG over market + reviews", color: "#22d3ee", glyph: "◎", pillar: "RAG" },
  { name: "Analyst", role: "Live inventory + brand context via MCP", color: "#a78bfa", glyph: "◈", pillar: "MCP" },
  { name: "Copywriter", role: "On-brand copy, ranked by resonance", color: "#f472b6", glyph: "✦", pillar: "LLM" },
  { name: "Visual Director", role: "Diffusion hero creative to brand spec", color: "#fb923c", glyph: "❖", pillar: "Diffusion" },
  { name: "Operations", role: "Assembles reels, voice, publishes", color: "#a3e635", glyph: "⬡", pillar: "Agentic" },
];

const EDGE = [
  { t: "Grounded", d: "MCP + GraphRAG keep output inside real data and brand rules." },
  { t: "Full lifecycle", d: "Research → create → publish → optimize, autonomously." },
  { t: "Honest & cheap", d: "Live/Simulated labels + local-first model routing." },
];

const FEATURES: { name: string; status: "live" | "upcoming" | "planned" }[] = [
  { name: "Multi-agent campaign pipeline", status: "live" },
  { name: "MCP inventory server", status: "live" },
  { name: "RAG + GraphRAG retrieval", status: "live" },
  { name: "Diffusion hero creative", status: "live" },
  { name: "Video reels + AI voiceover", status: "live" },
  { name: "Campaign Pulse + optimization loop", status: "live" },
  { name: "LLMOps observability", status: "live" },
  { name: "n8n automation workflows", status: "live" },
  { name: "Neon Postgres + pgvector backend", status: "upcoming" },
  { name: "Live channel OAuth publishing", status: "planned" },
  { name: "Per-brand LoRA voice tuning", status: "planned" },
];

const ARCH = [
  { title: "Frontend", items: ["React + Vite + TS", "Tailwind + Framer Motion", "Recharts + D3/SVG", "Voice I/O (Web Speech)"] },
  { title: "Backend", items: ["Node + Fastify", "SSE event streaming", "Multi-agent orchestrator", "Fallback Controller"] },
  { title: "AI & Data", items: ["Llama via Ollama/Groq", "FLUX/SDXL diffusion", "pgvector RAG + GraphRAG", "Custom MCP server"] },
];

const TECH = [
  "React", "Vite", "TypeScript", "Tailwind", "Framer Motion", "Recharts", "Zustand",
  "Node", "Fastify", "SSE", "@modelcontextprotocol/sdk", "Ollama", "Groq", "OpenRouter",
  "FLUX / SDXL", "Hugging Face", "Pollinations", "pgvector", "Neo4j", "DuckDB", "Redis",
  "Zod", "Pydantic", "Playwright", "n8n", "Kiro (AI-DLC)",
];

const API = [
  { method: "POST", path: "/pipeline/run", purpose: "Start a campaign run" },
  { method: "GET", path: "/pipeline/:id/events", purpose: "SSE agent stream" },
  { method: "POST", path: "/live/copy", purpose: "Real LLM copy (fallback-guarded)" },
  { method: "POST", path: "/live/image", purpose: "Real diffusion image" },
  { method: "GET", path: "/graph", purpose: "Brand knowledge graph" },
  { method: "GET", path: "/streams/live", purpose: "Live data ingestion SSE" },
  { method: "GET", path: "/observability/metrics", purpose: "LLMOps telemetry" },
  { method: "POST", path: "/pulse/:id/optimize", purpose: "Run optimization loop" },
  { method: "POST", path: "/publish", purpose: "Publish to channels" },
  { method: "MCP", path: "query_inventory / get_stock", purpose: "Inventory tools (stdio)" },
];

const ROADMAP = [
  { phase: "Now", detail: "Full agent pipeline, MCP, RAG, multimodal output, optimization loop, docs." },
  { phase: "Next", detail: "Neon Postgres + pgvector, real auth/RBAC, live channel OAuth publishing." },
  { phase: "Later", detail: "Per-brand LoRA voice tuning, closed performance→creative loop, marketplace." },
];

const CHANGELOG = [
  { v: "v0.4", note: "Live /docs module with access control, scheduling, and team showcase." },
  { v: "v0.3", note: "Welcome + auth flow; product renamed to AIgnis." },
  { v: "v0.2", note: "Platform modules: GraphRAG, data streams, LLMOps, workspace, publishing, pricing." },
  { v: "v0.1", note: "Campaign studio: agent swarm, creative renderer, video reels, pulse + optimize." },
];
