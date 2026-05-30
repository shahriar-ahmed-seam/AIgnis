import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";

/**
 * Live /docs module — pitch deck + technical whitepaper + system dashboard in
 * one scrollable page. Built so judges and investors can assess the product,
 * architecture, and team credibly in minutes.
 */
export function DocsView() {
  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="AIgnis · Live Docs"
        subtitle="Pitch · architecture · system dashboard — everything in one place"
        pillar="Live documentation"
      />

      <div className="mx-auto w-full max-w-5xl space-y-10 overflow-y-auto pb-12">
        {/* hero / one-liner */}
        <Section title="What is AIgnis?">
          <p className="text-lg leading-relaxed text-ink-200">
            AIgnis is an <span className="text-gradient font-semibold">autonomous multimodal
            marketing engine</span>. Describe a product in one sentence and a swarm of
            specialized AI agents researches the market, writes the copy, renders the creative,
            produces channel-ready video and voice, publishes across channels, and then reads
            real performance to self-optimize — grounded in your brand's live data the whole way.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {HEADLINE_STATS.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </Section>

        {/* problem / solution */}
        <Section title="Problem → Solution">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card accent="#f472b6" title="The problem">
              Modern campaigns need research, copy, design, video, publishing, and optimization —
              usually across many specialists and tools. Small brands can't afford it, and
              generic AI tools are blind to real inventory, brand rules, and post-launch
              performance, so they produce off-brand, risky, disconnected output.
            </Card>
            <Card accent="#a3e635" title="Our solution">
              One autonomous platform that runs the entire lifecycle, grounded in the brand's
              real data via a secure MCP connection and a brand knowledge graph, with an honest
              live-vs-simulated provenance model and a cost-aware semantic model router.
            </Card>
          </div>
        </Section>

        {/* how it works */}
        <Section title="How it works — the agent swarm">
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
                <span className="text-2xl" style={{ color: a.color }}>
                  {a.glyph}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink-100">{a.name}</div>
                  <div className="text-xs text-ink-300">{a.role}</div>
                </div>
                <span
                  className="rounded-md px-2 py-1 font-mono text-[10px]"
                  style={{ color: a.color, background: `${a.color}14` }}
                >
                  {a.pillar}
                </span>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* architecture */}
        <Section title="Architecture">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ARCH.map((c) => (
              <div key={c.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-sm font-bold text-ink-100">{c.title}</div>
                <ul className="mt-2 space-y-1 text-xs text-ink-300">
                  {c.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* tech depth */}
        <Section title="Technical depth">
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-ink-300"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>

        {/* provenance */}
        <Section title="Honest provenance">
          <p className="text-sm leading-relaxed text-ink-300">
            Every output in AIgnis is labeled <span className="text-lime">Live</span> (produced
            by a real model call) or <span className="text-violet-glow">Simulated</span>
            {" "}(curated fallback). A Fallback Controller wraps every external call with a
            timeout so the system never crashes and never misrepresents what is real. Sensitive
            business data stays local and is reached only through the MCP server.
          </p>
        </Section>

        {/* roadmap */}
        <Section title="Roadmap">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {ROADMAP.map((r, i) => (
              <div key={r.phase} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="font-display text-2xl font-extrabold text-gradient">0{i + 1}</div>
                <div className="mt-1 text-sm font-bold text-ink-100">{r.phase}</div>
                <div className="mt-1 text-xs text-ink-300">{r.detail}</div>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-white/[0.06] pt-6 text-center font-mono text-[11px] text-ink-500">
          AIgnis · Team AInigma · Infinity AI BuildFest 2026 · built spec-first in Kiro
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="panel p-6"
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

const HEADLINE_STATS = [
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

const ARCH = [
  { title: "Frontend", items: ["React + Vite + TS", "Tailwind + Framer Motion", "Recharts + D3/SVG", "Voice I/O (Web Speech)"] },
  { title: "Backend", items: ["Node + Fastify", "SSE event streaming", "Multi-agent orchestrator", "Fallback Controller"] },
  { title: "AI & Data", items: ["Llama via Ollama/Groq", "FLUX/SDXL diffusion", "pgvector RAG + GraphRAG", "Custom MCP server"] },
];

const TECH = [
  "MCP (custom server, stdio)",
  "GraphRAG knowledge graph",
  "Semantic model router",
  "pgvector hybrid retrieval",
  "LLMOps telemetry",
  "Local Llama 3.1 (Ollama)",
  "Diffusion (FLUX/SDXL)",
  "Real-time SSE streams",
  "n8n automation",
  "Spec-driven (Kiro AI-DLC)",
];

const ROADMAP = [
  { phase: "Now", detail: "Full agent pipeline, MCP, RAG, multimodal output, optimization loop." },
  { phase: "Next", detail: "Neon Postgres + pgvector, real auth, live channel OAuth publishing." },
  { phase: "Later", detail: "Per-brand LoRA voice tuning, closed performance→creative loop." },
];
