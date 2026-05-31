import type { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../lib/motion";

// Shared surface primitives — one glass language across the whole app.
// Replaces the dozens of hand-rolled `rounded-* border bg-white/[..]` cards so
// every surface is identical. Flat glass on the living backdrop (no heavy
// shadow) is the house style.

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** hover lift + border brighten (for clickable cards) */
  interactive?: boolean;
  /** animate in with the shared fadeUp variant */
  animate?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

/** The standard Command Center surface. Use instead of `.panel`. */
export function GlassCard({
  children,
  className = "",
  interactive = false,
  animate = false,
  style,
  onClick,
}: GlassCardProps) {
  const base =
    "relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl";
  const hover = interactive
    ? "transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5"
    : "";
  const cls = `${base} ${hover} ${className}`;

  if (animate) {
    return (
      <motion.div variants={fadeUp} className={cls} style={style} onClick={onClick}>
        {children}
      </motion.div>
    );
  }
  return (
    <div className={cls} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

/** Small inner surface for rows / list items inside a GlassCard. */
export function Inset({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.05] bg-white/[0.015] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/** A labeled metric tile (label-mono caption + value). */
export function StatTile({
  label,
  value,
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <Inset className={`p-2.5 ${className}`}>
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-ink-100">{value}</div>
    </Inset>
  );
}
