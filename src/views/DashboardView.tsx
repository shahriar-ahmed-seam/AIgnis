import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { useCampaigns, type Campaign, type ActivityEntry } from "../stores/campaignStore";
import { useAuth } from "../stores/authStore";
import { useNav } from "../stores/navStore";
import { CountUp } from "../components/ui/CountUp";
import { Sparkline } from "../components/ui/Sparkline";
import { AGENT_META } from "../types";
import { staggerContainer, staggerItem } from "../lib/motion";
import { play } from "../lib/sound";

const STATUS_STYLE: Record<string, { c: string; label: string }> = {
  active: { c: "#a3e635", label: "active" },
  paused: { c: "#fb923c", label: "paused" },
  draft: { c: "#6b748f", label: "draft" },
  archived: { c: "#6b748f", label: "archived" },
};

/**
 * Dashboard / Home — what a returning user lands on. Greets them, shows what
 * the agents did "while you were away", a portfolio snapshot, the top mover,
 * and a live 24/7 agent activity feed. This is the "I have a marketing team
 * working for me around the clock" view.
 */
export function DashboardView() {
  const user = useAuth((s) => s.user);
  const campaigns = useCampaigns((s) => s.campaigns);
  const activity = useCampaigns((s) => s.activity);
  const sinceLastSeen = useCampaigns((s) => s.sinceLastSeen);
  const markSeen = useCampaigns((s) => s.markSeen);
  const openCampaign = useCampaigns((s) => s.open);
  const setSection = useNav((s) => s.setSection);

  // compute the "while you were away" delta once on mount, then mark seen
  const away = useMemo(() => sinceLastSeen(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = window.setTimeout(() => markSeen(), 1500);
    return () => window.clearTimeout(t);
  }, [markSeen]);

  const active = campaigns.filter((c) => c.status === "active");
  const totals = useMemo(
    () => ({
      reach: campaigns.reduce((a, c) => a + c.perf.reach, 0),
      conversions: campaigns.reduce((a, c) => a + c.perf.conversions, 0),
      active: active.length,
    }),
    [campaigns, active.length]
  );

  const firstName = (user?.name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title={`${greeting}, ${firstName}`}
        subtitle="Your agents have been working. Here's what moved while you were away."
        pillar="Command dashboard"
      />

      <div className="flex-1 space-y-6 overflow-y-auto pb-2">
        {/* while you were away band */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <AwayStat label="New reach" accent="#22d3ee" value={<>+<CountUp value={away.reach} format /></>} sub="since your last visit" />
          <AwayStat label="New sales" accent="#a3e635" value={<>+<CountUp value={away.conversions} /></>} sub="across active campaigns" />
          <AwayStat label="Active campaigns" accent="#a78bfa" value={<CountUp value={totals.active} />} sub={`${campaigns.length} total in portfolio`} />
          <AwayStat label="Total reach" accent="#e879f9" value={<CountUp value={totals.reach} format />} sub="all-time across channels" />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* left: top mover + portfolio snapshot */}
          <div className="space-y-6">
            {away.topMover && <TopMover campaign={away.topMover} onOpen={() => openCampaign(away.topMover!.id)} />}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-ink-100">Your campaigns</span>
                <button
                  onClick={() => { play("tick"); setSection("studio"); }}
                  className="font-mono text-[11px] text-violet-glow transition-transform hover:translate-x-0.5"
                >
                  + New campaign
                </button>
              </div>
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2.5">
                {campaigns.map((c) => (
                  <PortfolioRow key={c.id} campaign={c} onOpen={() => openCampaign(c.id)} />
                ))}
              </motion.div>
            </div>
          </div>

          {/* right: agent activity feed */}
          <ActivityFeed activity={activity} />
        </div>
      </div>
    </div>
  );
}

function AwayStat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub: string; accent: string }) {
  return (
    <motion.div variants={staggerItem} className="panel p-5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-extrabold text-ink-100">{value}</div>
      <div className="mt-1 text-xs text-ink-500">{sub}</div>
    </motion.div>
  );
}

function TopMover({ campaign, onOpen }: { campaign: Campaign; onOpen: () => void }) {
  return (
    <div className="panel relative overflow-hidden p-5">
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${campaign.hero.src})`, background: campaign.hero.fallbackGradient }}
        />
        <div className="min-w-0 flex-1">
          <div className="label-mono text-lime">▲ Top mover today</div>
          <div className="mt-0.5 truncate font-display text-lg font-bold text-ink-100">{campaign.name}</div>
          <div className="truncate text-xs text-ink-400">{campaign.copy.headline}</div>
        </div>
        <div className="hidden sm:block">
          <Sparkline points={campaign.perf.series} color="#a3e635" width={120} height={40} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-6">
        <Mini label="Reach" value={<CountUp value={campaign.perf.reach} format />} />
        <Mini label="Conversions" value={<CountUp value={campaign.perf.conversions} format />} />
        <button onClick={() => { play("tick"); onOpen(); }} className="ml-auto btn-ghost text-xs">
          Open Command Center →
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold text-ink-100">{value}</div>
    </div>
  );
}

function PortfolioRow({ campaign, onOpen }: { campaign: Campaign; onOpen: () => void }) {
  const st = STATUS_STYLE[campaign.status];
  return (
    <motion.button
      variants={staggerItem}
      onClick={() => { play("tick"); onOpen(); }}
      className="panel panel-hover flex w-full items-center gap-4 p-3 text-left"
    >
      <div
        className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${campaign.hero.src})`, background: campaign.hero.fallbackGradient }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink-100">{campaign.name}</span>
          <span
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ color: st.c, background: `${st.c}1a` }}
          >
            {campaign.status === "active" && <span className="h-1 w-1 animate-pulse rounded-full" style={{ background: st.c }} />}
            {st.label}
          </span>
        </div>
        <div className="truncate font-mono text-[10px] text-ink-500">
          {campaign.channels.length} channels · v{campaign.versions.length} · {campaign.perf.reach.toLocaleString()} reach
        </div>
      </div>
      <Sparkline points={campaign.perf.series} color={st.c} width={84} height={28} />
    </motion.button>
  );
}

function ActivityFeed({ activity }: { activity: ActivityEntry[] }) {
  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-lime shadow-[0_0_8px_#a3e635]" />
          <span className="font-mono text-xs text-ink-300">agents · working 24/7</span>
        </div>
        <span className="label-mono">live</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {activity.map((a, i) => {
          const meta = AGENT_META[a.agent];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="flex items-start gap-3"
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                style={{ color: meta.color, background: `${meta.color}14`, border: `1px solid ${meta.color}33` }}
              >
                {meta.glyph}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs leading-relaxed text-ink-300">{a.message}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-600">
                  {meta.label} · {timeAgo(a.ts)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
