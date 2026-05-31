// Backend client for the AIgnis API. Thin wrapper around fetch + SSE with
// short timeouts, so the UI can fall back to the local engine instantly if the
// backend is unreachable.

import type { AgentEvent, CreativeAsset, PillarStatus } from "../types";

const BASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ??
  "http://localhost:8787";

export const apiBaseUrl = BASE_URL;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const ctrl = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([p, ctrl]);
}

/** Probe the backend. Returns true only if it answers healthy quickly. */
export async function probeBackend(timeoutMs = 1500): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${BASE_URL}/health`, { method: "GET" }), timeoutMs);
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === "ok";
  } catch {
    return false;
  }
}

export interface StartRunResponse {
  runId: string;
  productIdea: string;
  executionMode: "Simulated" | "Live";
  pillarStatuses: PillarStatus[];
  dataset: { presetId: string; tagline: string; palette: string[] };
}

export async function startRun(
  productIdea: string,
  executionMode: "Simulated" | "Live",
  speed: number
): Promise<StartRunResponse> {
  const res = await withTimeout(
    fetch(`${BASE_URL}/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIdea, executionMode, speed }),
    }),
    4000
  );
  if (!res.ok) throw new Error(`startRun failed: ${res.status}`);
  return (await res.json()) as StartRunResponse;
}

export interface RunStreamHandlers {
  onAgentEvent: (evt: AgentEvent) => void;
  onAsset: (asset: CreativeAsset) => void;
  onError?: (err: string) => void;
}

/**
 * Subscribe to a run's SSE stream. Returns a disposer that closes the stream.
 * EventSource is used (the events endpoint is a GET text/event-stream).
 */
export function streamRun(runId: string, handlers: RunStreamHandlers): () => void {
  const es = new EventSource(`${BASE_URL}/pipeline/${runId}/events`);

  es.addEventListener("agent", (e) => {
    try {
      handlers.onAgentEvent(JSON.parse((e as MessageEvent).data) as AgentEvent);
    } catch {
      /* ignore malformed frame */
    }
  });

  es.addEventListener("asset", (e) => {
    try {
      handlers.onAsset(JSON.parse((e as MessageEvent).data) as CreativeAsset);
    } catch {
      /* ignore */
    }
  });

  es.addEventListener("done", () => es.close());
  es.onerror = () => {
    handlers.onError?.("stream_error");
    es.close();
  };

  return () => es.close();
}
