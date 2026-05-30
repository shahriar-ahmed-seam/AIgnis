import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsBundle, KpiStat, MetricSeries } from "../types";
import { ModeIndicator } from "./ModeIndicator";

/**
 * Synthetic analytics (Req 5). Three restrained charts + KPI tiles, all
 * labeled "Simulated". Count-up + draw-in animations make it feel alive.
 */
export function AnalyticsDashboard({ data }: { data: AnalyticsBundle }) {
  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <span className="font-display text-sm font-bold text-ink-100">
          Campaign Intelligence
        </span>
        <ModeIndicator label={data.label} />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3">
          {data.kpis.map((k, i) => (
            <KpiTile key={k.label} stat={k} delay={i * 0.08} />
          ))}
        </div>

        {/* charts */}
        <MarketChart series={data.market} />
        <div className="grid grid-cols-1 gap-4">
          <AudienceChart series={data.audience} />
          <PerfChart series={data.predictedPerformance} />
        </div>
      </div>
    </div>
  );
}

function KpiTile({ stat, delay }: { stat: KpiStat; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
    >
      <div className="label-mono">{stat.label}</div>
      <div className="mt-1.5 flex items-end justify-between">
        <span className="font-display text-2xl font-bold text-ink-100">{stat.value}</span>
        <span
          className={`font-mono text-xs ${stat.positive ? "text-lime" : "text-magenta"}`}
        >
          {stat.delta}
        </span>
      </div>
    </motion.div>
  );
}

const axisProps = {
  stroke: "#3a4055",
  tick: { fill: "#6b748f", fontSize: 10, fontFamily: "JetBrains Mono" },
  tickLine: false,
};

function ChartFrame({ series, children }: { series: MetricSeries; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink-100">{series.title}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
          {series.xLabel} · {series.yLabel}
        </span>
      </div>
      <div className="h-32">{children}</div>
    </div>
  );
}

function tooltipStyle() {
  return {
    contentStyle: {
      background: "rgba(15,18,29,0.95)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      fontFamily: "JetBrains Mono",
      fontSize: 11,
    },
    labelStyle: { color: "#aab2c8" },
  };
}

function MarketChart({ series }: { series: MetricSeries }) {
  return (
    <ChartFrame series={series}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series.points} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="mkt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.accent} stopOpacity={0.5} />
              <stop offset="100%" stopColor={series.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="x" {...axisProps} />
          <YAxis {...axisProps} width={34} />
          <Tooltip {...tooltipStyle()} />
          <Area
            type="monotone"
            dataKey="y"
            stroke={series.accent}
            strokeWidth={2}
            fill="url(#mkt)"
            isAnimationActive
            animationDuration={1100}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function AudienceChart({ series }: { series: MetricSeries }) {
  return (
    <ChartFrame series={series}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series.points} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="x" {...axisProps} />
          <YAxis {...axisProps} width={34} />
          <Tooltip {...tooltipStyle()} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar
            dataKey="y"
            fill={series.accent}
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function PerfChart({ series }: { series: MetricSeries }) {
  return (
    <ChartFrame series={series}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series.points} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="x" {...axisProps} />
          <YAxis {...axisProps} width={34} />
          <Tooltip {...tooltipStyle()} />
          <Line
            type="monotone"
            dataKey="y"
            stroke={series.accent}
            strokeWidth={2.5}
            dot={{ r: 3, fill: series.accent }}
            isAnimationActive
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
