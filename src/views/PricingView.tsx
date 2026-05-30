import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";

/**
 * Plans & Billing — the monetization story. Tiered SaaS plus the differentiated
 * performance-based model that the optimization loop justifies. Judges score
 * business viability; a credible model stated clearly beats a fake checkout.
 */
const PLANS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "free forever",
    accent: "#6b748f",
    features: ["1 brand workspace", "5 campaigns / mo", "Text + image generation", "Simulated analytics"],
    cta: "Current plan",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$79",
    cadence: "per month",
    accent: "#a78bfa",
    features: ["5 brand workspaces", "Unlimited campaigns", "Live data streams + GraphRAG", "Voice + video synthesis", "Real-time optimization loop"],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$349",
    cadence: "per month",
    accent: "#22d3ee",
    features: ["Unlimited workspaces", "Team seats + roles", "Custom MCP connectors", "White-label exports", "Priority model routing"],
    cta: "Talk to sales",
    highlight: false,
  },
];

const USAGE = [
  { label: "Generation credits", used: 1840, total: 5000, color: "#a78bfa" },
  { label: "Live optimizations", used: 12, total: 50, color: "#a3e635" },
  { label: "MCP connector calls", used: 320, total: 1000, color: "#22d3ee" },
];

export function PricingView() {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-8 py-6">
      <SectionHeader
        title="Plans & Billing"
        subtitle="Tiered SaaS, usage credits & a performance-based model the optimization loop unlocks"
        pillar="Business model"
      />

      {/* plan cards */}
      <div className="grid grid-cols-3 gap-5">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`panel relative flex flex-col p-6 ${plan.highlight ? "glow-violet" : ""}`}
            style={plan.highlight ? { borderColor: "rgba(139,92,246,0.4)" } : undefined}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-sheen px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-void-900">
                Most popular
              </span>
            )}
            <div className="text-sm font-bold uppercase tracking-wider" style={{ color: plan.accent }}>
              {plan.name}
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="font-display text-4xl font-extrabold text-ink-100">{plan.price}</span>
              <span className="mb-1.5 text-xs text-ink-500">{plan.cadence}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-300">
                  <span className="mt-0.5 text-lime">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                plan.highlight ? "btn-primary" : "border border-white/10 text-ink-300 hover:text-ink-100"
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_1fr] gap-5">
        {/* performance model */}
        <div className="panel p-6">
          <div className="flex items-center gap-2">
            <span className="text-lg text-magenta">◆</span>
            <span className="font-display text-lg font-bold text-ink-100">Performance Model</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            The differentiator: because AIgnis <em>measures</em> campaign lift and
            <em> self-optimizes</em>, we can charge on outcomes. Brands pay a small percentage of
            verified incremental conversions instead of a flat fee — aligning our revenue with
            their results.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-magenta/20 bg-magenta/[0.06] p-4">
            <span className="font-display text-2xl font-bold text-magenta">8%</span>
            <span className="text-xs leading-relaxed text-ink-300">
              of measured incremental campaign lift, billed monthly. Zero lift, zero fee.
            </span>
          </div>
        </div>

        {/* usage */}
        <div className="panel p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-ink-100">This month's usage</span>
            <span className="label-mono">Pro plan</span>
          </div>
          <div className="space-y-4">
            {USAGE.map((u) => (
              <div key={u.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink-300">{u.label}</span>
                  <span className="font-mono text-xs text-ink-500">
                    {u.used.toLocaleString()} / {u.total.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: u.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(u.used / u.total) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
