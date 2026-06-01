import { useState, type ReactNode } from "react";
import { Wordmark } from "./BrandMark";
import { EngineButton } from "./EngineButton";
import { PillarDrawer } from "./PillarDrawer";
import { SoundToggle } from "./SoundToggle";
import { ConnectionToggle } from "./ConnectionToggle";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { usePipeline } from "../../stores/pipelineStore";
import { useCommand } from "../../stores/commandStore";

/**
 * Global frame: sticky header + persistent platform sidebar + scrollable
 * content. Targets 1920x1080 but scrolls gracefully on smaller displays.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { pillarStatuses } = usePipeline();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openCommand = useCommand((s) => s.setOpen);

  return (
    <div className="relative flex h-screen flex-col">
      <header className="z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-void-900/60 px-6 backdrop-blur-md">
        <Wordmark />
        <div className="flex items-center gap-5">
          <button
            onClick={() => openCommand(true)}
            title="Command palette"
            className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-ink-400 transition-colors hover:border-white/20 hover:text-ink-200 lg:flex"
          >
            <span className="text-sm">⌘</span>
            <span className="font-mono text-[11px]">K</span>
          </button>
          <ConnectionToggle />
          <EngineButton statuses={pillarStatuses} onClick={() => setDrawerOpen(true)} />
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
