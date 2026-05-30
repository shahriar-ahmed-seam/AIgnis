import { useState, type ReactNode } from "react";
import { Wordmark } from "./BrandMark";
import { PillarBar } from "./PillarBar";
import { ModeIndicator } from "./ModeIndicator";
import { PillarDrawer } from "./PillarDrawer";
import { SoundToggle } from "./SoundToggle";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { usePipeline } from "../store";

/**
 * Global frame: sticky header + persistent platform sidebar + scrollable
 * content. Targets 1920x1080 but scrolls gracefully on smaller displays.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { pillarStatuses, executionMode } = usePipeline();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex h-screen flex-col">
      <header className="z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-void-900/60 px-6 backdrop-blur-md">
        <Wordmark />
        <div className="flex items-center gap-5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="hidden transition-transform hover:scale-[1.02] xl:block"
            title="Inside the Engine"
          >
            <PillarBar statuses={pillarStatuses} />
          </button>
          <div className="hidden h-6 w-px bg-white/10 xl:block" />
          <div className="flex items-center gap-2">
            <span className="label-mono">Mode</span>
            <ModeIndicator label={executionMode === "Live" ? "Live" : "Simulated"} />
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-ghost flex items-center gap-2 text-xs"
          >
            <span className="text-violet-glow">⬡</span> Inside the Engine
          </button>
          <SoundToggle />
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-y-auto">{children}</main>
      </div>

      <PillarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        statuses={pillarStatuses}
      />
    </div>
  );
}
