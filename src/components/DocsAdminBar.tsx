import { useDocs, windowStatus, type DocsMode } from "../docsStore";
import { play } from "../lib/sound";

/**
 * Admin-only control bar for the /docs page: toggle visibility mode and edit
 * the public scheduling window. Only rendered for admin users.
 */
export function DocsAdminBar() {
  const { mode, startISO, endISO, setMode, setStart, setEnd, reset } = useDocs();
  const status = windowStatus({ mode, startISO, endISO });

  const modes: { id: DocsMode; label: string }[] = [
    { id: "scheduled", label: "Scheduled" },
    { id: "always", label: "Always on" },
    { id: "off", label: "Off" },
  ];

  return (
    <div className="panel mb-6 border-violet/20 p-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-violet/15 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-violet-glow">
            Admin
          </span>
          <span className="text-sm font-semibold text-ink-100">Docs visibility</span>
          <span
            className={`ml-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] ${
              status.live ? "bg-lime/10 text-lime" : "bg-white/[0.05] text-ink-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.live ? "bg-lime animate-pulse" : "bg-ink-500"}`} />
            {status.label}
          </span>
        </div>

        {/* mode toggle */}
        <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                play("tick");
                setMode(m.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === m.id ? "bg-violet/20 text-violet-glow" : "text-ink-500 hover:text-ink-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* schedule window (only when scheduled) */}
      {mode === "scheduled" && (
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="label-mono mb-1.5 block">Public from</span>
            <input
              type="datetime-local"
              value={startISO}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-ink-100 focus:border-violet/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="label-mono mb-1.5 block">Until</span>
            <input
              type="datetime-local"
              value={endISO}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-ink-100 focus:border-violet/50 focus:outline-none"
            />
          </label>
          <button onClick={() => { play("tick"); reset(); }} className="btn-ghost text-xs">
            Reset to judging window
          </button>
        </div>
      )}
    </div>
  );
}
