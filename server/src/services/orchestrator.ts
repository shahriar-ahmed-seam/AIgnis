import { randomUUID } from "node:crypto";
import type {
  AgentEvent,
  CreativeAsset,
  ExecutionMode,
  PillarStatus,
  PipelineRun,
} from "../types.js";
import { PILLAR_ORDER } from "../types.js";
import { resolveDataset } from "../data/datasets.js";
import { config, imageEnabled, llmEnabled } from "../config.js";
import { runWithFallback } from "../lib/fallback.js";
import { MockCopyGenerator, makeLiveCopyGenerator } from "../adapters/copy.js";
import { MockImageGenerator, makeLiveImageGenerator, buildImagePrompt } from "../adapters/image.js";
import { FileInventoryProvider, MockInventoryProvider } from "../adapters/inventory.js";
import { recordRoute } from "./telemetry.js";
import { addHistory } from "./workspace.js";

export interface RunOptions {
  executionMode: ExecutionMode; // "Live" attempts real calls (with fallback)
  speed: number; // playback speed for event scheduling (1|2|4)
}

type EventListener = (evt: AgentEvent) => void;
type DoneListener = (asset: CreativeAsset) => void;

interface ActiveRun extends PipelineRun {
  options: RunOptions;
  // buffered events for late SSE subscribers + replay
  emitted: AgentEvent[];
  listeners: Set<EventListener>;
  doneListeners: Set<DoneListener>;
  timers: NodeJS.Timeout[];
  finished: boolean;
}

const runs = new Map<string, ActiveRun>();

function pillarStatuses(mode: ExecutionMode): PillarStatus[] {
  // In Live mode, only the pillars we can really do go Live; others stay Simulated.
  const liveCapable: Record<string, boolean> = {
    LLM: mode === "Live" && llmEnabled(),
    Diffusion: mode === "Live" && imageEnabled(),
    MCP: mode === "Live", // file-based inventory is "real" data access
    RAG: false, // simulated retrieval in this prototype
    Agentic: true, // the orchestration itself is real
  };
  return PILLAR_ORDER.map((pillar) => ({
    pillar,
    mode: liveCapable[pillar] ? "Live" : "Simulated",
  }));
}

/** Create and start a simulated pipeline run; returns the runId immediately. */
export function startRun(productIdea: string, options: RunOptions): PipelineRun {
  const trimmed = productIdea.trim();
  const dataset = resolveDataset(trimmed || "custom product");
  const runId = randomUUID();

  const run: ActiveRun = {
    runId,
    productIdea: trimmed,
    executionMode: options.executionMode,
    state: "running",
    dataset,
    pillarStatuses: pillarStatuses(options.executionMode),
    createdAt: Date.now(),
    options,
    emitted: [],
    listeners: new Set(),
    doneListeners: new Set(),
    timers: [],
    finished: false,
  };
  runs.set(runId, run);

  scheduleEvents(run);
  return toPublicRun(run);
}

function scheduleEvents(run: ActiveRun) {
  const { dataset, options } = run;
  const script = dataset.agentScript;
  const speed = options.speed > 0 ? options.speed : 1;

  for (const evt of script) {
    const delay = evt.timestamp / speed;
    const t = setTimeout(() => {
      run.emitted.push(evt);
      for (const l of run.listeners) l(evt);
    }, delay);
    run.timers.push(t);
  }

  const lastTs = script[script.length - 1]?.timestamp ?? 0;
  const finishDelay = lastTs / speed + 1200;
  const finishTimer = setTimeout(() => void finalize(run), finishDelay);
  run.timers.push(finishTimer);
}

/** Build the final creative asset, performing live calls in Live mode. */
async function finalize(run: ActiveRun) {
  if (run.finished) return;
  const { dataset, options } = run;

  try {
    // --- inventory (MCP / file) with fallback to dataset records ---
    const liveInventory = new FileInventoryProvider();
    const mockInventory = new MockInventoryProvider(dataset.inventory);
    const invResult = await runWithFallback({
      enabled: options.executionMode === "Live",
      timeoutMs: config.mcp.timeoutMs,
      attempt: () => liveInventory.getContext(run.productIdea),
      fallback: () => mockInventory.getContext(),
    });

    // --- copy (LLM) with fallback to curated copy ---
    const liveCopy = makeLiveCopyGenerator();
    const mockCopy = new MockCopyGenerator(dataset.copy);
    const copyResult = await runWithFallback({
      enabled: options.executionMode === "Live" && !!liveCopy,
      timeoutMs: config.llm.timeoutMs,
      attempt: () => liveCopy!.generate(run.productIdea, invResult.value),
      fallback: () => mockCopy.generate(),
    });

    // --- image (Diffusion) with fallback to pre-generated hero ---
    const liveImage = makeLiveImageGenerator();
    const mockImage = new MockImageGenerator(dataset.heroImage);
    const prompt = buildImagePrompt(run.productIdea, dataset.palette);
    const imageResult = await runWithFallback({
      enabled: options.executionMode === "Live" && !!liveImage,
      timeoutMs: config.image.timeoutMs,
      attempt: () => liveImage!.generate(prompt),
      fallback: () => mockImage.generate(),
    });

    // a live image with no gradient falls back to the dataset gradient for safety
    const hero = imageResult.value.fallbackGradient
      ? imageResult.value
      : { ...imageResult.value, fallbackGradient: dataset.heroImage.fallbackGradient };

    const asset: CreativeAsset = {
      copy: copyResult.value,
      copyLabel: copyResult.label,
      hero,
      heroLabel: imageResult.label,
      palette: dataset.palette,
    };

    run.asset = asset;
    run.state = "complete";
    run.finished = true;

    // record a semantic-router decision + workspace history (functioning chain)
    recordRoute(
      `Generate copy for "${run.productIdea}"`,
      copyResult.label === "Live" ? (makeLiveCopyGenerator()?.id.split(":")[1] ?? "llama-3.1-8b-instant") : "llama3.1:8b",
      copyResult.label === "Live" ? "high-creativity" : "fallback · cached"
    );
    addHistory({
      campaignId: run.runId,
      name: `${dataset.exampleLabel} campaign`,
      result: `${copyResult.label} copy · ${imageResult.label} hero`,
      status: "live",
    });

    for (const d of run.doneListeners) d(asset);
  } catch {
    // total safety net — never crash a run
    const asset: CreativeAsset = {
      copy: dataset.copy,
      copyLabel: "Simulated",
      hero: dataset.heroImage,
      heroLabel: "Simulated",
      palette: dataset.palette,
    };
    run.asset = asset;
    run.state = "complete";
    run.finished = true;
    for (const d of run.doneListeners) d(asset);
  }
}

export function getRun(runId: string): PipelineRun | undefined {
  const r = runs.get(runId);
  return r ? toPublicRun(r) : undefined;
}

export function getAsset(runId: string): CreativeAsset | undefined {
  return runs.get(runId)?.asset;
}

/** Subscribe to a run's event stream. Replays already-emitted events first. */
export function subscribe(
  runId: string,
  onEvent: EventListener,
  onDone: DoneListener
): (() => void) | null {
  const run = runs.get(runId);
  if (!run) return null;

  // replay buffered events (so late subscribers see the full stream)
  for (const evt of run.emitted) onEvent(evt);
  if (run.finished && run.asset) onDone(run.asset);

  run.listeners.add(onEvent);
  run.doneListeners.add(onDone);

  return () => {
    run.listeners.delete(onEvent);
    run.doneListeners.delete(onDone);
  };
}

function toPublicRun(run: ActiveRun): PipelineRun {
  return {
    runId: run.runId,
    productIdea: run.productIdea,
    executionMode: run.executionMode,
    state: run.state,
    dataset: run.dataset,
    asset: run.asset,
    pillarStatuses: run.pillarStatuses,
    createdAt: run.createdAt,
  };
}

/** Periodic cleanup of finished runs older than 10 minutes. */
export function startRunGc() {
  setInterval(() => {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [id, run] of runs) {
      if (run.finished && run.createdAt < cutoff) {
        run.timers.forEach(clearTimeout);
        runs.delete(id);
      }
    }
  }, 60 * 1000).unref();
}
