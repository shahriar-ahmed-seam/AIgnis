import type { ModeLabel } from "../../types";

/**
 * Honest real-vs-simulated badge (Req 11). Renders on every output.
 * "Live" = cyan/lime, "Simulated" = muted violet — visually distinct so a
 * judge can read the system's honesty at a glance.
 */
export function ModeIndicator({ label, className = "" }: { label: ModeLabel; className?: string }) {
  const live = label === "Live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
        live
          ? "border-lime/30 bg-lime/10 text-lime"
          : "border-violet/25 bg-violet/10 text-violet-glow"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-lime" : "bg-violet-glow"} ${
          live ? "animate-pulse" : ""
        }`}
      />
      {label}
    </span>
  );
}
