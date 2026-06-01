import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useCampaigns, optimizeCopy, type Campaign, type CampaignStatus } from "../stores/campaignStore";
import { ChannelIcon } from "../components/ui/ChannelIcon";
import { CountUp } from "../components/ui/CountUp";
import { HeroImage } from "../components/features/HeroImage";
import { toast } from "../stores/toastStore";
import { play } from "../lib/sound";
import type { ChannelId } from "../types";

const STATUS_STYLE: Record<CampaignStatus, { c: string; label: string }> = {
  active: { c: "#a3e635", label: "Active" },
  paused: { c: "#fb923c", label: "Paused" },
  draft: { c: "#6b748f", label: "Draft" },
  archived: { c: "#6b748f", label: "Archived" },
};

const CHANNEL_NAME: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", web: "Web" };

/**
 * Campaign detail — open one owned campaign: its creative, performance over
 * time, the version history (v1 → v2 → …), and the actions a founder lives in:
 * re-optimize (the swarm makes a new version), re-publish, pause/resume.
 * This is the heart of Scenario B — "keep optimizing my past campaigns".
 */
export function CampaignDetailView({ campaign }: { campaign: Campaign }) {
  const closeDetail = useCampaigns((s) => s.closeDetail);
  const addVersion = useCampaigns((s) => s.addVersion);
  const setStatus = useCampaigns((s) => s.setStatus);

  const [optimizing, setOptimizing] = useState(false);
  const st = STATUS_STYLE[campaign.status];

  const chartData = campaign.perf.series.map((y, i) => ({ x: i, y }));

  function reoptimize() {
    if (optimizing) return;
    setOptimizing(true);
    play("optimize");
    window.setTimeout(() => {
      const { copy, note } = optimizeCopy(campaign);
      addVersion(campaign.id, copy, note);
      play("success");
      setOptimizing(false);
      toast({ tone: "success", title: `Optimized → v${campaign.versions.length + 1}`, detail: note, glyph: "⚡" });
    }, 2400);
  }

  function republish() {
    play("deploy");
    setStatus(campaign.id, "active");
    toast({ tone: "success", title: "Re-published", detail: `${campaign.name} is live again across ${campaign.channels.length} channels.`, glyph: "↗" });
  }

  function togglePause() {
    const next: CampaignStatus = campaign.status === "active" ? "paused" : "active";
    setStatus(campaign.id, next);
    play("tick");
    toast({ tone: next === "active" ? "success" : "info", title: next === "active" ? "Campaign resumed" : "Campaign paused", glyph: next === "active" ? "▶" : "⏸" });
  }

  return (
    <div className="flex h-full flex-col px-8 py-6">
      {/* breadcrumb + actions */}
      <div className="mb-5 flex items-center justify-between">
        <button onClick={() => { play("tick"); closeDetail(); }} className="group flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-100">
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          {campaign.status !== "draft" && (
            <button onClick={togglePause} className="btn-ghost text-sm">
              {campaign.status === "active" ? "⏸ Pause" : "▶ Resume"}
            </button>
          )}
          <button onClick={republish} className="btn-ghost text-sm">↗ Re-publish</button>
          <button onClick={reoptimize} disabled={optimizing} className="btn-primary text-sm disabled:opacity-60">
            {optimizing ? "Optimizing…" : "⚡ Re-optimize"}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-2">
        {/* header card */}
        <div className="panel flex flex-col gap-5 p-5 md:flex-row md:items-center">
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl md:w-52">
            <HeroImage image={campaign.hero} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-ink-100">{campaign.name}</h2>
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider" style={{ color: st.c, background: `${st.c}1a` }}>
                {campaign.status === "active" && <span className="h-1 w-1 animate-pulse rounded-full" style={{ background: st.c }} />}
                {st.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-300">{campaign.copy.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {campaign.channels.map((ch: ChannelId) => (
                <span key={ch} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-ink-300">
                  <ChannelIcon id={ch} size={14} /> {CHANNEL_NAME[ch]}
                </span>
              ))}
              <span className="font-mono text-[10px] text-ink-500">· v{campaign.versions.length} · created {timeAgo(campaign.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Reach" accent="#22d3ee" value={<CountUp value={campaign.perf.reach} format />} />
          <Kpi label="Engagements" accent="#a78bfa" value={<CountUp value={campaign.perf.engagements} format />} />
          <Kpi label="Clicks" accent="#fb923c" value={<CountUp value={campaign.perf.clicks} format />} />
          <Kpi label="Conversions" accent="#a3e635" value={<CountUp value={campaign.perf.conversions} format />} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* performance chart */}
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-100">Reach over time</span>
              <span className="label-mono">live · updating</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="camp-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="x" hide />
                  <YAxis width={40} stroke="#3a4055" tick={{ fill: "#6b748f", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <Tooltip contentStyle={{ background: "rgba(15,18,29,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                  <Area type="monotone" dataKey="y" stroke="#22d3ee" strokeWidth={2} fill="url(#camp-area)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* version history */}
          <div className="panel flex flex-col overflow-hidden p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-100">Version history</span>
              <span className="label-mono">{campaign.versions.length} versions</span>
            </div>
            <div className="relative flex-1 space-y-3 overflow-y-auto">
              {/* optimizing shimmer (new version forming) */}
              <AnimatePresence>
                {optimizing && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-violet/25 bg-violet/[0.06] px-3 py-2.5"
                  >
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-transparent border-t-violet-glow border-r-violet-glow" />
                    <span className="font-mono text-xs text-violet-glow">Swarm rewriting v{campaign.versions.length + 1}…</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {[...campaign.versions].reverse().map((ver, idx) => {
                const isCurrent = idx === 0 && !optimizing;
                return (
                  <div key={ver.v} className="relative pl-5">
                    {/* timeline dot + line */}
                    <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full" style={{ background: isCurrent ? "#a3e635" : "rgba(255,255,255,0.25)" }} />
                    {idx < campaign.versions.length - 1 && <span className="absolute left-[3px] top-4 h-[calc(100%-0.5rem)] w-px bg-white/10" />}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink-100">v{ver.v}</span>
                      {isCurrent && <span className="rounded-full bg-lime/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-lime">current</span>}
                      <span className="ml-auto font-mono text-[10px] text-ink-600">{timeAgo(ver.createdAt)}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink-200">"{ver.copy.headline}"</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-500">{ver.note}</div>
                  </div>
                );
              })}
            </div>
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

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
