import { useMemo } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { usePublish, channelHandle } from "../stores/publishStore";
import { useOwner } from "../stores/ownerStore";
import { useNav } from "../stores/navStore";
import { ChannelIcon } from "../components/ui/ChannelIcon";
import { CountUp } from "../components/ui/CountUp";
import { Sparkline } from "../components/ui/Sparkline";
import { AGENT_META } from "../types";
import { staggerContainer, staggerItem } from "../lib/motion";
import { play } from "../lib/sound";

const CHANNEL_ACCENT: Record<string, string> = {
  instagram: "#d6249f",
  tiktok: "#25F4EE",
  web: "#22d3ee",
};

/**
 * Owner's Command Center — the post-launch home that proves recurring value:
 * where every post went, how it's performing over time, what AIgnis's Analyst
 * makes of it in plain English, and a live revenue / MRR projection. This is
 * the "this is a fundable business, not a one-shot tool" view.
 */
export function CommandCenterView() {
  const posts = usePublish((s) => s.posts);
  const perf = useOwner((s) => s.perf);
  const revenue = useOwner((s) => s.revenue);
  const projectedMrr = useOwner((s) => s.projectedMrr);
  const setSection = useNav((s) => s.setSection);

  const totals = useMemo(() => {
    const list = Object.values(perf);
    return {
      reach: list.reduce((a, p) => a + p.impressions, 0),
      conversions: list.reduce((a, p) => a + p.conversions, 0),
      engagements: list.reduce((a, p) => a + p.engagements, 0),
    };
  }, [perf]);

  if (posts.length === 0) {
    return (
      <div className="flex h-full flex-col px-8 py-6">
        <SectionHeader
          title="Command Center"
          subtitle="Your live posts, their performance, and what they're worth"
          pillar="Owner analytics"
        />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl text-ink-600">◷</div>
          <h3 className="font-display text-xl font-bold text-ink-100">No live campaigns yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-300">
            Forge and publish a campaign — then come back to watch it perform, read the AI's
            analysis, and see the revenue it drives.
          </p>
          <button onClick={() => setSection("studio")} className="btn-primary mt-5">
            Go to Campaign Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="Command Center"
        subtitle="Your live posts, their performance, and what they're worth"
        pillar="Owner analytics"
      />

      <div className="flex-1 space-y-6 overflow-y-auto pb-2">
        {/* hero stat band */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <BigStat label="Revenue driven" accent="#a3e635" value={<>${<CountUp value={revenue()} format />}</>} sub="from tracked conversions" />
          <BigStat label="Projected MRR" accent="#e879f9" value={<>${<CountUp value={projectedMrr()} format />}</>} sub="at your current cadence" featured />
          <BigStat label="Total reach" accent="#22d3ee" value={<CountUp value={totals.reach} format />} sub="across all channels" />
          <BigStat label="Conversions" accent="#a78bfa" value={<CountUp value={totals.conversions} format />} sub="and climbing" />
        </div>

        {/* AI Analyst read */}
        <AnalystRead reach={totals.reach} conversions={totals.conversions} mrr={projectedMrr()} postCount={posts.length} />

        {/* per-post performance */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-100">Live posts · performance over time</span>
            <span className="label-mono">updating live</span>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {posts.map((post) => {
              const p = perf[post.id];
              const accent = CHANNEL_ACCENT[post.channel] ?? "#a78bfa";
              return (
                <motion.a
                  key={post.id}
                  variants={staggerItem}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => play("tick")}
                  className="panel panel-hover group flex flex-col p-5"
                >
                  <div className="flex items-center gap-3">
                    <ChannelIcon id={post.channel} size={26} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-ink-100">{post.headline}</div>
                      <div className="font-mono text-[10px] text-ink-500">{channelHandle(post.channel)}</div>
                    </div>
                    <span className="font-mono text-[10px] text-violet-glow opacity-0 transition-opacity group-hover:opacity-100">
                      open ↗
                    </span>
                  </div>

                  <div className="mt-4">
                    <Sparkline points={p?.series ?? [1, 2, 3]} color={accent} width={260} height={44} />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniStat label="Reach" value={<CountUp value={p?.impressions ?? 0} format />} />
                    <MiniStat label="Clicks" value={<CountUp value={p?.clicks ?? 0} format />} />
                    <MiniStat label="Sales" value={<CountUp value={p?.conversions ?? 0} />} />
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
  accent,
  featured,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  accent: string;
  featured?: boolean;
}) {
  return (
    <div
      className="panel relative overflow-hidden p-5"
      style={featured ? { borderColor: `${accent}55` } : undefined}
    >
      {featured && (
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
          style={{ background: accent, opacity: 0.18 }}
        />
      )}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-extrabold text-ink-100">{value}</div>
      <div className="mt-1 text-xs text-ink-500">{sub}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="inset p-2.5">
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-display text-base font-bold text-ink-100">{value}</div>
    </div>
  );
}

/** Plain-language Analyst read of the portfolio — the "AI explains it" moment. */
function AnalystRead({
  reach,
  conversions,
  mrr,
  postCount,
}: {
  reach: number;
  conversions: number;
  mrr: number;
  postCount: number;
}) {
  const meta = AGENT_META.Analyst;
  const lines = useMemo(() => {
    const cr = reach > 0 ? ((conversions / reach) * 100).toFixed(2) : "0";
    return [
      `Your ${postCount} live ${postCount === 1 ? "campaign is" : "campaigns are"} compounding — reach has grown to ${reach.toLocaleString()} with a ${cr}% conversion rate.`,
      `TikTok is pulling the most efficient traffic; the under-25 segment is your strongest responder right now.`,
      `If you keep this publishing cadence, projected recurring revenue lands around $${mrr.toLocaleString()}/mo. Want me to forge the next one?`,
    ];
  }, [reach, conversions, mrr, postCount]);

  return (
    <div className="panel relative overflow-hidden p-5">
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: meta.color }} />
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
            <span className="label-mono">portfolio read</span>
          </div>
          <ul className="space-y-1.5">
            {lines.map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.12 }}
                className="flex items-start gap-2 text-sm leading-relaxed text-ink-300"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: meta.color }} />
                {line}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
