import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { useNav } from "../stores/navStore";

/**
 * Brand Workspace — the persistent "home" that sells AInigma as a product, not
 * a one-shot tool: a brand profile, an AI "what I've learned" summary that
 * deepens over time, and a campaign history timeline.
 */
const LEARNINGS = [
  { conf: 94, text: "Your audience skews eco-conscious and under-25; they reward proof over claims." },
  { conf: 88, text: "Best-performing tone is confident, not playful. Guilt-driven angles underperform by ~40%." },
  { conf: 82, text: "TikTok consistently outperforms Instagram ~3:1 for your performance-led hooks." },
  { conf: 76, text: "Scarcity framing ('first 500 pairs') lifts conversion; broad value props stall." },
];

const HISTORY = [
  { date: "Day 1", name: "Terra Runner launch", result: "+38% CTR vs benchmark", status: "optimized", color: "#a3e635" },
  { date: "Day 1", name: "Trail line teaser", result: "Strong saves, low installs", status: "live", color: "#22d3ee" },
  { date: "Day 0", name: "Brand voice calibration", result: "Voice profile locked", status: "archived", color: "#6b748f" },
];

const BRAND = {
  name: "TERRA",
  tagline: "Sustainable performance footwear",
  palette: ["#0f766e", "#22d3ee", "#a3e635", "#e8ecf7"],
  voice: "Confident · guilt-free · aspirational",
};

export function WorkspaceView() {
  const setSection = useNav((s) => s.setSection);

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="Brand Workspace"
        subtitle="Your persistent brand memory · profile, learnings & campaign history"
        pillar="Stateful brand memory"
      />

      <div className="grid flex-1 grid-cols-[320px_1fr] gap-6 overflow-hidden">
        {/* brand profile */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="panel p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hero-sheen font-display text-2xl font-extrabold text-void-900">
                T
              </div>
              <div>
                <div className="font-display text-xl font-bold text-ink-100">{BRAND.name}</div>
                <div className="text-xs text-ink-300">{BRAND.tagline}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="label-mono mb-1.5">Brand voice</div>
                <div className="text-sm text-ink-300">{BRAND.voice}</div>
              </div>
              <div>
                <div className="label-mono mb-1.5">Palette</div>
                <div className="flex gap-1.5">
                  {BRAND.palette.map((c) => (
                    <span key={c} className="h-6 w-6 rounded-md border border-white/10" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setSection("studio")} className="btn-primary w-full">
            + New campaign
          </button>

          <div className="panel p-5">
            <div className="label-mono mb-2">Memory depth</div>
            <div className="flex items-end gap-1">
              <span className="font-display text-3xl font-bold text-ink-100">12</span>
              <span className="mb-1 text-xs text-ink-500">signals learned</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-300">
              Each campaign deepens AIgnis's model of your brand. Memory compounds — outputs get
              more on-brand over time.
            </p>
          </div>
        </div>

        {/* learnings + history */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-100">What AIgnis has learned about your brand</span>
              <span className="label-mono">confidence-ranked</span>
            </div>
            <div className="space-y-2.5">
              {LEARNINGS.map((l, i) => (
                <motion.div
                  key={l.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="relative h-9 w-9 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="3"
                        strokeDasharray={`${(l.conf / 100) * 94.2} 94.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-lime">
                      {l.conf}
                    </span>
                  </div>
                  <span className="text-sm leading-relaxed text-ink-300">{l.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="panel flex-1 overflow-y-auto p-5">
            <div className="mb-3 text-sm font-bold text-ink-100">Campaign history</div>
            <div className="space-y-2">
              {HISTORY.map((h, i) => (
                <motion.div
                  key={h.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <span className="font-mono text-[10px] text-ink-500">{h.date}</span>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink-100">{h.name}</div>
                    <div className="text-xs text-ink-500">{h.result}</div>
                  </div>
                  <span
                    className="rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: h.color, background: `${h.color}14` }}
                  >
                    {h.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
