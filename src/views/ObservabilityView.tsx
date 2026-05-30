import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { SectionHeader } from "./GraphView";
import { CountUp } from "../components/ui/CountUp";

/**
 * LLMOps Observability — makes the model layer feel like a real ML platform:
 * token/cost/latency KPIs (ticking live), a latency timeline, a semantic
 * model-router that classifies tasks to fast-local vs smart-cloud models, and
 * a cost-saving cache. This is the "semantic routing + observability" pillar.
 */
const MODELS = [
  { id: "llama-3.1-8b", tier: "local", role: "extraction · parsing · routing", color: "#a3e635", cost: "$0.00", share: 64 },
  { id: "claude-3.5", tier: "cloud", role: "creative direction · copy", color: "#a78bfa", cost: "$3.00/M", share: 24 },
  { id: "gpt-4o", tier: "cloud", role: "complex reasoning · QA", color: "#22d3ee", cost: "$5.00/M", share: 12 },
];

const ROUTES = [
  { task: "Parse competitor JSON", model: "llama-3.1-8b", reason: "structured · low-stakes" },
  { task: "Write hero headline", model: "claude-3.5", reason: "high-creativity" },
  { task: "Brand-compliance check", model: "gpt-4o", reason: "reasoning-critical" },
  { task: "Summarize 2k reviews", model: "llama-3.1-8b", reason: "bulk · cacheable" },
];

export function ObservabilityView() {
  const [tokens, setTokens] = useState(1_284_000);
  const [cost, setCost] = useState(4.82);
  const [latency, setLatency] = useState(412);
  const [cacheHit, setCacheHit] = useState(41);
  const [series, setSeries] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({ t: i, ms: 380 + Math.random() * 120 }))
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setTokens((v) => v + Math.floor(Math.random() * 4000 + 800));
      setCost((v) => +(v + Math.random() * 0.04).toFixed(2));
      setLatency(() => Math.round(360 + Math.random() * 160));
      setCacheHit(() => Math.round(38 + Math.random() * 10));
      setSeries((prev) => [...prev.slice(1), { t: prev[prev.length - 1].t + 1, ms: 360 + Math.random() * 180 }]);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="LLMOps Observability"
        subtitle="Token economics, latency, semantic model routing & cost-saving cache"
        pillar="Model router + telemetry"
      />

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-4 gap-4">
        <Kpi label="Tokens processed" value={<CountUp value={tokens} format />} accent="#22d3ee" />
        <Kpi label="Spend (session)" value={<>${<CountUp value={cost} decimals={2} />}</>} accent="#a78bfa" />
        <Kpi label="P50 latency" value={<><CountUp value={latency} />ms</>} accent="#fb923c" />
        <Kpi label="Cache hit rate" value={<><CountUp value={cacheHit} />%</>} accent="#a3e635" />
      </div>

      <div className="grid flex-1 grid-cols-[1.1fr_1fr] gap-6 overflow-hidden">
        {/* latency timeline + router */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-100">Inference Latency</span>
              <span className="label-mono">ms · rolling</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="t" hide />
                  <YAxis
                    width={34}
                    stroke="#3a4055"
                    tick={{ fill: "#6b748f", fontSize: 10, fontFamily: "JetBrains Mono" }}
                    domain={[300, 600]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,18,29,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      fontFamily: "JetBrains Mono",
                      fontSize: 11,
                    }}
                  />
                  <Area type="monotone" dataKey="ms" stroke="#22d3ee" strokeWidth={2} fill="url(#lat)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel flex-1 overflow-y-auto p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-100">Semantic Router · recent decisions</span>
              <span className="label-mono">task → model</span>
            </div>
            <div className="space-y-2">
              {ROUTES.map((r, i) => {
                const model = MODELS.find((m) => m.id === r.model)!;
                return (
                  <motion.div
                    key={r.task}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm text-ink-300">
                      <span className="text-ink-500">›</span> {r.task}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-ink-500">{r.reason}</span>
                      <span
                        className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                        style={{ color: model.color, background: `${model.color}14` }}
                      >
                        {model.id}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* model fleet */}
        <div className="panel flex flex-col overflow-y-auto p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-100">Model Fleet</span>
            <span className="label-mono">routing mix</span>
          </div>
          <div className="space-y-3">
            {MODELS.map((m) => (
              <div key={m.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink-100">{m.id}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                        m.tier === "local" ? "bg-lime/10 text-lime" : "bg-violet/10 text-violet-glow"
                      }`}
                    >
                      {m.tier}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ink-300">{m.cost}</span>
                </div>
                <div className="mt-1 text-xs text-ink-500">{m.role}</div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.share}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="mt-1 text-right font-mono text-[10px] text-ink-500">{m.share}% of calls</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-lime/20 bg-lime/[0.06] p-4">
            <div className="flex items-center gap-2">
              <span className="text-lime">⚡</span>
              <span className="text-sm font-semibold text-ink-100">Cost optimization</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-300">
              Routing 64% of calls to a local model + semantic caching cuts spend by an
              estimated <span className="text-lime">~71%</span> versus an all-cloud baseline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: React.ReactNode; accent: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-ink-100">{value}</div>
    </div>
  );
}
