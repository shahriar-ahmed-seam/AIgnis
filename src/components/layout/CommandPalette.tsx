import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCommand } from "../../stores/commandStore";
import { useNav, type Section } from "../../stores/navStore";
import { usePipeline } from "../../stores/pipelineStore";
import { useConnection } from "../../stores/connectionStore";
import { play, primeAudio } from "../../lib/sound";

// ---------------------------------------------------------------------------
// ⌘K Command Palette — the unmistakable "this is a real SaaS product" signal.
// Fuzzy-search every section + key action; full keyboard nav; glass modal.
// Opened with ⌘K / Ctrl+K (handled here) or the header hint.
// ---------------------------------------------------------------------------

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Actions" | "Engine";
  glyph: string;
  run: () => void;
}

export function CommandPalette() {
  const open = useCommand((s) => s.open);
  const setOpen = useCommand((s) => s.setOpen);
  const toggle = useCommand((s) => s.toggle);

  const setSection = useNav((s) => s.setSection);
  const optimize = usePipeline((s) => s.optimize);
  const reset = usePipeline((s) => s.reset);
  const setMode = useConnection((s) => s.setMode);
  const backendAvailable = useConnection((s) => s.backendAvailable);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // global ⌘K / Ctrl+K + Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        primeAudio();
        toggle();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, setOpen]);

  // focus the input when opened; reset query
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus after the enter animation tick
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const close = () => setOpen(false);
  const go = (section: Section) => {
    setSection(section);
    close();
  };

  const commands = useMemo<Command[]>(() => {
    const nav: Array<[Section, string, string]> = [
      ["studio", "Campaign Studio", "✦"],
      ["published", "Published", "↗"],
      ["graph", "Knowledge Graph", "◈"],
      ["streams", "Live Data Streams", "≋"],
      ["observability", "LLMOps", "◎"],
      ["workspace", "Brand Workspace", "⬡"],
      ["pricing", "Plans & Billing", "◆"],
      ["docs", "Live Docs", "❑"],
    ];
    const list: Command[] = nav.map(([id, label, glyph]) => ({
      id: `nav-${id}`,
      label: `Go to ${label}`,
      hint: "Navigate",
      group: "Navigate",
      glyph,
      run: () => go(id),
    }));

    list.push(
      {
        id: "act-forge",
        label: "Forge a new campaign",
        hint: "Start a run",
        group: "Actions",
        glyph: "✦",
        run: () => {
          setSection("studio");
          reset();
          close();
          window.setTimeout(() => {
            const el = document.querySelector<HTMLInputElement>("input[placeholder*='eco-friendly']");
            el?.focus();
          }, 120);
        },
      },
      {
        id: "act-optimize",
        label: "Optimize current campaign",
        hint: "Self-optimization loop",
        group: "Actions",
        glyph: "⚡",
        run: () => {
          optimize();
          close();
        },
      },
      {
        id: "act-reset",
        label: "Reset / new idea",
        hint: "Clear the studio",
        group: "Actions",
        glyph: "↻",
        run: () => {
          reset();
          setSection("studio");
          close();
        },
      },
      {
        id: "eng-live",
        label: "Switch engine to Live",
        hint: backendAvailable ? "Backend detected" : "Backend not detected",
        group: "Engine",
        glyph: "●",
        run: () => {
          if (backendAvailable) setMode("Live");
          close();
        },
      },
      {
        id: "eng-demo",
        label: "Switch engine to Demo",
        hint: "Local in-browser engine",
        group: "Engine",
        glyph: "◑",
        run: () => {
          setMode("Demo");
          close();
        },
      }
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendAvailable]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [query, commands]);

  // keep active index in range
  useEffect(() => {
    if (active >= filtered.length) setActive(0);
  }, [filtered.length, active]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        play("tick");
        cmd.run();
      }
    }
  };

  // group the filtered list for rendering
  const groups = useMemo(() => {
    const order: Command["group"][] = ["Actions", "Navigate", "Engine"];
    return order
      .map((g) => ({ group: g, items: filtered.filter((c) => c.group === g) }))
      .filter((s) => s.items.length > 0);
  }, [filtered]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={close}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-void-900/70 backdrop-blur-sm" />

          {/* palette */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-void-800/80 backdrop-blur-2xl"
            style={{ boxShadow: "0 30px 80px -24px rgba(0,0,0,0.85)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <span className="font-mono text-violet-glow">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search actions, pages, engine…"
                className="flex-1 bg-transparent text-ink-100 placeholder:text-ink-500 focus:outline-none"
              />
              <span className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ink-500">
                esc
              </span>
            </div>

            {/* results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {groups.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-ink-500">No matches.</div>
              )}
              {groups.map((g) => (
                <div key={g.group} className="mb-1">
                  <div className="label-mono px-3 py-1.5">{g.group}</div>
                  {g.items.map((cmd) => {
                    flatIndex += 1;
                    const idx = flatIndex;
                    const isActive = idx === active;
                    return (
                      <button
                        key={cmd.id}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => {
                          play("tick");
                          cmd.run();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: isActive ? "rgba(139,92,246,0.14)" : "transparent",
                        }}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                          style={{
                            color: isActive ? "#a78bfa" : "#aab2c8",
                            background: isActive ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                          }}
                        >
                          {cmd.glyph}
                        </span>
                        <span className="flex-1 text-sm font-medium text-ink-100">{cmd.label}</span>
                        {cmd.hint && <span className="font-mono text-[10px] text-ink-500">{cmd.hint}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
