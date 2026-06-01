import { create } from "zustand";
import type {
  AgentEvent,
  CreativeAsset,
  ExecutionMode,
  MockDataset,
  PillarStatus,
  PipelineState,
} from "../types";
import { PILLAR_ORDER } from "../types";
import { resolveDataset } from "../data/datasets";
import { play } from "../lib/sound";
import { startRun as apiStartRun, streamRun, generateLiveCopy } from "../lib/api";
import { useConnection } from "./connectionStore";
import { useWorkspace } from "./workspaceStore";
import { toast } from "./toastStore";

type View = "landing" | "activity" | "creative" | "video" | "pulse";

interface PipelineStore {
  view: View;
  state: PipelineState;
  productIdea: string;
  executionMode: ExecutionMode;
  speed: number; // 1 | 2 | 4
  dataset: MockDataset | null;
  visibleEvents: AgentEvent[];
  activeAgent: AgentEvent["agent"] | null;
  completedAgents: AgentEvent["agent"][];
  asset: CreativeAsset | null;
  pillarStatuses: PillarStatus[];
  progress: number; // 0..1 over the agent script

  // post-launch
  deployed: boolean;
  optimizing: boolean;
  optimized: boolean;

  setSpeed: (s: number) => void;
  start: (idea: string) => void;
  goToVideo: () => void;
  goToCreative: () => void;
  goToPulse: () => void;
  optimize: () => void;
  reset: () => void;
  // internal
  _timers: number[];
  _closeStream?: () => void;
}

function defaultPillars(mode: ExecutionMode): PillarStatus[] {
  return PILLAR_ORDER.map((pillar) => ({ pillar, mode }));
}

export const usePipeline = create<PipelineStore>((set, get) => ({
  view: "landing",
  state: "idle",
  productIdea: "",
  executionMode: "Simulated",
  speed: 1,
  dataset: null,
  visibleEvents: [],
  activeAgent: null,
  completedAgents: [],
  asset: null,
  pillarStatuses: defaultPillars("Simulated"),
  progress: 0,
  deployed: false,
  optimizing: false,
  optimized: false,
  _timers: [],
  _closeStream: undefined,

  setSpeed: (s) => set({ speed: s }),

  reset: () => {
    get()._timers.forEach((t) => clearTimeout(t));
    get()._closeStream?.();
    set({
      view: "landing",
      state: "idle",
      productIdea: "",
      visibleEvents: [],
      activeAgent: null,
      completedAgents: [],
      asset: null,
      progress: 0,
      dataset: null,
      deployed: false,
      optimizing: false,
      optimized: false,
      _timers: [],
      _closeStream: undefined,
    });
  },

  start: (idea) => {
    const trimmed = idea.trim();
    if (trimmed.length === 0) return;

    get()._timers.forEach((t) => clearTimeout(t));
    get()._closeStream?.();

    const dataset = resolveDataset(trimmed);
    const speed = get().speed;
    const connection = useConnection.getState();
    const live = connection.mode === "Live" && connection.backendAvailable;

    // Common reset for either path.
    set({
      view: "activity",
      state: "running",
      productIdea: trimmed,
      dataset,
      executionMode: live ? "Live" : "Simulated",
      pillarStatuses: defaultPillars(live ? "Live" : "Simulated"),
      visibleEvents: [],
      activeAgent: null,
      completedAgents: [],
      asset: null,
      progress: 0,
      deployed: false,
      optimizing: false,
      optimized: false,
      _timers: [],
      _closeStream: undefined,
    });

    if (live) {
      runLive(trimmed, dataset, speed, set, get);
    } else {
      runLocal(dataset, speed, set, get);
    }
  },

  goToVideo: () => {
    play("tick");
    set({ view: "video" });
  },

  goToCreative: () => {
    play("tick");
    set({ view: "creative" });
  },

  goToPulse: () => {
    play("deploy");
    set({ deployed: true, view: "pulse" });
  },

  optimize: () => {
    if (get().optimizing || get().optimized) return;
    play("optimize");
    set({ optimizing: true });
    const t = window.setTimeout(() => {
      play("success");
      set({ optimizing: false, optimized: true });
      toast({
        tone: "success",
        title: "Campaign optimized",
        detail: "The swarm rewrote the weak spots — metrics climbed.",
        glyph: "⚡",
      });
    }, 2600);
    set({ _timers: [...get()._timers, t] });
  },
}));

function paletteFor(presetId: string): string[] {
  switch (presetId) {
    case "eco-sneakers":
      return ["#0f766e", "#22d3ee", "#a3e635", "#e8ecf7"];
    case "cold-brew":
      return ["#1c1917", "#f59e0b", "#a78bfa", "#e8ecf7"];
    case "ai-fitness":
      return ["#312e81", "#8b5cf6", "#22d3ee", "#e8ecf7"];
    case "artisan-chocolate":
      return ["#1c1917", "#7c2d12", "#fb923c", "#e8ecf7"];
    case "glow-skincare":
      return ["#78350f", "#fbbf24", "#f472b6", "#e8ecf7"];
    case "signature-fragrance":
      return ["#1e1b4b", "#a78bfa", "#e879f9", "#e8ecf7"];
    default:
      return ["#155e75", "#22d3ee", "#e879f9", "#e8ecf7"];
  }
}

type SetState = (partial: Partial<PipelineStore>) => void;
type GetState = () => PipelineStore;

/** Play one streamed agent event into the store (shared by both paths). */
function applyEvent(evt: AgentEvent, total: number, index: number, set: SetState, get: GetState) {
  const s = get();
  const completed = [...s.completedAgents];
  if (evt.kind === "complete" && !completed.includes(evt.agent)) completed.push(evt.agent);
  if (evt.kind === "active") play("activate");
  else if (evt.kind === "handoff") play("handoff");
  else if (evt.kind === "complete") play("complete");
  set({
    visibleEvents: [...s.visibleEvents, evt],
    activeAgent: evt.kind === "complete" ? null : evt.agent,
    completedAgents: completed,
    progress: total > 0 ? (index + 1) / total : s.progress,
  });
}

/** Demo path — schedule the curated agent script entirely in-browser. */
function runLocal(dataset: MockDataset, speed: number, set: SetState, get: GetState) {
  const script = dataset.agentScript;
  const total = script.length;
  const timers: number[] = [];

  // Kick off a real LLM copy request in parallel (Vercel /api/generate).
  // The image + reel stay curated, but the headline/body/CTA become genuine
  // Groq output when reachable — so a judge typing their own idea sees real
  // generation. Falls back silently to the curated copy on any failure.
  const idea = get().productIdea;
  let liveCopy: { headline: string; body: string; cta: string; model: string } | null = null;
  generateLiveCopy({ idea, inventory: dataset.intel.inventory }).then((c) => {
    liveCopy = c;
    // if the reveal already happened, patch the copy in retroactively
    const s = get();
    if (c && s.asset && s.state === "complete") {
      set({ asset: { ...s.asset, copy: c, copyLabel: "Live" } });
    }
  });

  script.forEach((evt, i) => {
    const t = window.setTimeout(() => applyEvent(evt, total, i, set, get), evt.timestamp / speed);
    timers.push(t);
  });

  const lastTs = script[script.length - 1]?.timestamp ?? 0;
  const finish = window.setTimeout(() => {
    play("reveal");
    set({
      state: "complete",
      view: "creative",
      asset: {
        copy: liveCopy ?? dataset.copy,
        copyLabel: liveCopy ? "Live" : "Simulated",
        hero: dataset.heroImage,
        heroLabel: "Simulated",
        palette: paletteFor(dataset.presetId),
      },
      progress: 1,
      activeAgent: null,
    });
    useWorkspace.getState().recordCampaign(get().productIdea);
  }, lastTs / speed + 1200);
  timers.push(finish);

  set({ _timers: timers });
}

/**
 * Live path — start a run on the backend and drive the UI from its SSE stream.
 * On any failure, fall back to the local engine so the demo never stalls.
 */
function runLive(idea: string, dataset: MockDataset, speed: number, set: SetState, get: GetState) {
  const total = dataset.agentScript.length;
  let count = 0;

  const fallback = (reason: string) => {
    console.warn(`[pipeline] live run failed (${reason}); falling back to Demo.`);
    useConnection.getState().markBackendDown();
    get()._closeStream?.();
    set({ executionMode: "Simulated", pillarStatuses: defaultPillars("Simulated"), _closeStream: undefined });
    runLocal(dataset, speed, set, get);
  };

  apiStartRun(idea, "Live", speed)
    .then((run) => {
      // adopt the backend's per-pillar live/simulated status
      set({ pillarStatuses: run.pillarStatuses });
      const close = streamRun(run.runId, {
        onAgentEvent: (evt) => applyEvent(evt, total, count++, set, get),
        onAsset: (asset) => {
          play("reveal");
          set({ state: "complete", view: "creative", asset, progress: 1, activeAgent: null });
          useWorkspace.getState().recordCampaign(get().productIdea);
        },
        onError: () => fallback("stream"),
      });
      set({ _closeStream: close });
    })
    .catch(() => fallback("start"));
}
