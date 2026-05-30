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

  setSpeed: (s) => set({ speed: s }),

  reset: () => {
    get()._timers.forEach((t) => clearTimeout(t));
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
    });
  },

  start: (idea) => {
    const trimmed = idea.trim();
    if (trimmed.length === 0) return;

    get()._timers.forEach((t) => clearTimeout(t));

    const dataset = resolveDataset(trimmed);
    const speed = get().speed;
    const script = dataset.agentScript;
    const total = script.length;

    set({
      view: "activity",
      state: "running",
      productIdea: trimmed,
      dataset,
      visibleEvents: [],
      activeAgent: null,
      completedAgents: [],
      asset: null,
      progress: 0,
      deployed: false,
      optimizing: false,
      optimized: false,
      _timers: [],
    });

    const timers: number[] = [];

    script.forEach((evt, i) => {
      const delay = evt.timestamp / speed;
      const timer = window.setTimeout(() => {
        const s = get();
        const completed = [...s.completedAgents];
        if (evt.kind === "complete" && !completed.includes(evt.agent)) {
          completed.push(evt.agent);
        }
        // sound cues per event kind
        if (evt.kind === "active") play("activate");
        else if (evt.kind === "handoff") play("handoff");
        else if (evt.kind === "complete") play("complete");

        set({
          visibleEvents: [...s.visibleEvents, evt],
          activeAgent: evt.kind === "complete" ? null : evt.agent,
          completedAgents: completed,
          progress: (i + 1) / total,
        });
      }, delay);
      timers.push(timer);
    });

    // Reveal the finished creative asset shortly after the last event.
    const lastTs = script[script.length - 1]?.timestamp ?? 0;
    const finishTimer = window.setTimeout(() => {
      const asset: CreativeAsset = {
        copy: dataset.copy,
        copyLabel: "Simulated",
        hero: dataset.heroImage,
        heroLabel: "Simulated",
        palette: paletteFor(dataset.presetId),
      };
      play("reveal");
      set({ state: "complete", view: "creative", asset, progress: 1, activeAgent: null });
    }, lastTs / speed + 1200);
    timers.push(finishTimer);

    set({ _timers: timers });
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
    default:
      return ["#155e75", "#22d3ee", "#e879f9", "#e8ecf7"];
  }
}
