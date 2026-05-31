import { AnimatePresence, motion } from "framer-motion";
import { usePipeline } from "../stores/pipelineStore";
import { ModeIndicator } from "../components/ui/ModeIndicator";
import { ChannelIcon } from "../components/ui/ChannelIcon";
import { CountUp } from "../components/ui/CountUp";
import { Sparkline } from "../components/ui/Sparkline";
import type { ChannelPulse } from "../types";
import { AGENT_META } from "../types";

const CHANNEL_ACCENT: Record<string, string> = {
  instagram: "#d6249f",
  tiktok: "#25F4EE",
  web: "#22d3ee",
};

/**
 * Campaign Pulse — the post-launch loop (the "what happened after deploy" view).
 * Top: Analyst-agent AI narrative. Grid: per-channel performance with real
 * brand icons, animated metrics, sentiment comments. Bottom: the optimization
 * loop that re-activates the swarm and visibly improves the numbers.
 */
export function PulseView() {
  const { dataset, productIdea, optimizing, optimized, optimize, reset } = usePipeline();
  if (!dataset) return null;
  const pulse = dataset.pulse;

  const narrative = optimized ? pulse.narrativeOptimized : pulse.narrativeBase;

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col px-8 py-6">
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="label-mono mb-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime shadow-[0_0_8px_#a3e635]" />
            Live across 3 channels
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-100">
            Campaign Pulse · “{productIdea}”
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <ModeIndicator label={pulse.label} />
          <button onClick={reset} className="btn-ghost flex items-center gap-2">
            <span>↻</span> New campaign
          </button>
        </div>
      </div>

      {/* AI narrative banner */}
      <AnalystNarrative lines={narrative} optimized={optimized} />

      {/* channel grid */}
      <div className="mt-5 grid flex-1 grid-cols-1 gap-5 md:grid-cols-3">
        {pulse.channels.map((c, i) => (
          <ChannelCard key={c.id} channel={c} optimized={optimized} delay={i * 0.1} />
        ))}
      </div>

      {/* optimization loop */}
      <OptimizeBar
        optimizing={optimizing}
        optimized={optimized}
        actions={pulse.optimizationActions}
        newHeadline={pulse.optimizedHeadline}
        onOptimize={optimize}
      />
    </div>
  );
}

function AnalystNarrative({ lines, optimized }: { lines: string[]; optimized: boolean }) {
  const meta = AGENT_META.Analyst;
  return (
    <motion.div
      key={optimized ? "opt" : "base"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel relative overflow-hidden p-5"
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: meta.color }}
      />
      <div className="flex items-start gap-4 pl-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ color: meta.color, background: `${meta.color}14`, border: `1px solid ${meta.color}33` }}
        >
          {meta.glyph}
        </div>
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-sm font-bold text-ink-100">Analyst Agent</span>
            <span className="label-mono">live commentary</span>
          </div>
          <ul className="space-y-1.5">
            {lines.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.12 }}
                className="flex items-start gap-2 text-sm leading-relaxed text-ink-300"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: meta.color }} />
                {line}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function ChannelCard({
  channel,
  optimized,
  delay,
}: {
  channel: ChannelPulse;
  optimized: boolean;
  delay: number;
}) {
  const m = optimized ? channel.optimized : channel.base;
  const accent = CHANNEL_ACCENT[channel.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="panel panel-hover flex flex-col p-5"
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChannelIcon id={channel.id} size={28} />
          <div>
            <div className="text-sm font-bold text-ink-100">{channel.name}</div>
            <div className="font-mono text-[10px] text-ink-500">{channel.handle}</div>
          </div>
        </div>
        <Sparkline points={channel.spark} color={accent} boost={optimized ? 0.35 : 0} />
      </div>

      {/* metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Impressions" value={<CountUp value={m.impressions} format />} />
        <Metric label="Engagement" value={<CountUp value={m.engagementRate} decimals={1} suffix="%" />} />
        <Metric label="CTR" value={<CountUp value={m.ctr} decimals={1} suffix="%" />} />
        <Metric label="Conversions" value={<CountUp value={m.conversions} format />} />
      </div>

      {/* comments */}
      <div className="mt-4 flex-1 space-y-2 border-t border-white/[0.06] pt-3">
        <div className="label-mono">Viewer reactions</div>
        {channel.comments.map((c) => (
          <div key={c.text} className="flex items-start gap-2 text-xs">
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                c.sentiment === "positive"
                  ? "bg-lime"
                  : c.sentiment === "negative"
                    ? "bg-magenta"
                    : "bg-ink-500"
              }`}
            />
            <span className="leading-relaxed text-ink-300">
              <span className="font-mono text-ink-500">{c.handle}</span> {c.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-ink-100">{value}</div>
    </div>
  );
}

function OptimizeBar({
  optimizing,
  optimized,
  actions,
  newHeadline,
  onOptimize,
}: {
  optimizing: boolean;
  optimized: boolean;
  actions: string[];
  newHeadline: string;
  onOptimize: () => void;
}) {
  return (
    <div className="panel mt-5 overflow-hidden p-5">
      <AnimatePresence mode="wait">
        {!optimized && !optimizing && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-bold text-ink-100">Performance plateauing?</div>
              <div className="mt-0.5 text-sm text-ink-300">
                Let the agent swarm read the data and self-optimize the campaign.
              </div>
            </div>
            <button onClick={onOptimize} className="btn-primary flex items-center gap-2">
              <span>⚡</span> Let AIgnis optimize
            </button>
          </motion.div>
        )}

        {optimizing && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4"
          >
            <span className="inline-block h-5 w-5 animate-spin-slow rounded-full border-2 border-ink-700 border-t-violet-glow" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-violet-glow">
                Swarm re-engaging — analyzing 3-channel performance…
              </div>
              <ShimmerBar />
            </div>
          </motion.div>
        )}

        {optimized && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-xs font-bold text-void-900">
                ✓
              </span>
              <span className="text-sm font-bold text-ink-100">Campaign optimized</span>
              <span className="label-mono ml-2">metrics updated above</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <span
                  key={a}
                  className="rounded-lg border border-lime/20 bg-lime/10 px-3 py-1.5 font-mono text-xs text-lime"
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="label-mono">Copywriter rewrote the lead headline →</span>
              <div className="mt-1 font-display text-lg font-bold text-gradient">
                “{newHeadline}”
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShimmerBar() {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
      <motion.div
        className="h-full w-1/3 rounded-full"
        style={{ background: "linear-gradient(90deg,#22d3ee,#8b5cf6,#e879f9)" }}
        animate={{ x: ["-100%", "320%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
