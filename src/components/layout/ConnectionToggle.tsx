import { useConnection } from "../../stores/connectionStore";

/**
 * Live / Demo switch. Live drives runs from the backend; Demo runs the local
 * engine. When the backend isn't detected, Live is disabled with a hint.
 */
export function ConnectionToggle() {
  const { mode, backendAvailable, setMode } = useConnection();

  return (
    <div className="flex items-center gap-2">
      <span className="label-mono hidden lg:inline">Engine</span>
      <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
        <button
          onClick={() => backendAvailable && setMode("Live")}
          disabled={!backendAvailable}
          title={backendAvailable ? "Run on the live backend" : "Backend not detected — start the server to enable Live"}
          className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
            mode === "Live"
              ? "bg-lime/15 text-lime"
              : backendAvailable
                ? "text-ink-500 hover:text-ink-300"
                : "cursor-not-allowed text-ink-700"
          }`}
        >
          ● Live
        </button>
        <button
          onClick={() => setMode("Demo")}
          title="Run the local demo engine (no backend needed)"
          className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
            mode === "Demo" ? "bg-violet/15 text-violet-glow" : "text-ink-500 hover:text-ink-300"
          }`}
        >
          ◑ Demo
        </button>
      </div>
    </div>
  );
}
