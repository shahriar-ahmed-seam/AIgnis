import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  getAsset,
  getRun,
  startRun,
  subscribe,
} from "../pipeline/orchestrator.js";
import { PRESETS, DEFAULT_DATASET } from "../data/datasets.js";

const runBodySchema = z.object({
  productIdea: z.string().min(1, "productIdea must have at least 1 non-whitespace char").transform((s) => s.trim()),
  executionMode: z.enum(["Simulated", "Live"]).default("Simulated"),
  speed: z.number().min(0.25).max(8).default(1),
});

export async function pipelineRoutes(app: FastifyInstance) {
  // List preset datasets (for the landing presets).
  app.get("/presets", async () => ({
    presets: PRESETS.map((p) => ({
      presetId: p.presetId,
      exampleLabel: p.exampleLabel,
      tagline: p.tagline,
    })),
    default: { presetId: DEFAULT_DATASET.presetId, exampleLabel: DEFAULT_DATASET.exampleLabel },
  }));

  // Start a simulated (or live-attempt) pipeline run.
  app.post("/pipeline/run", async (req, reply) => {
    const parsed = runBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request", details: parsed.error.flatten() });
    }
    const { productIdea, executionMode, speed } = parsed.data;
    const run = startRun(productIdea, { executionMode, speed });
    return reply.code(201).send({
      runId: run.runId,
      productIdea: run.productIdea,
      executionMode: run.executionMode,
      pillarStatuses: run.pillarStatuses,
      dataset: {
        presetId: run.dataset.presetId,
        tagline: run.dataset.tagline,
        palette: run.dataset.palette,
        inventory: run.dataset.inventory,
      },
    });
  });

  // Server-Sent Events: stream agent events in timestamp order, then the asset.
  app.get("/pipeline/:runId/events", async (req, reply) => {
    const { runId } = req.params as { runId: string };
    const run = getRun(runId);
    if (!run) return reply.code(404).send({ error: "run_not_found" });

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    send("hello", { runId, pillarStatuses: run.pillarStatuses });

    const unsubscribe = subscribe(
      runId,
      (evt) => send("agent", evt),
      (asset) => {
        send("asset", asset);
        send("done", { runId });
        reply.raw.end();
      }
    );

    if (!unsubscribe) {
      send("error", { error: "run_not_found" });
      return reply.raw.end();
    }

    // heartbeat to keep the connection alive
    const heartbeat = setInterval(() => reply.raw.write(": ping\n\n"), 15000);

    req.raw.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });

  // Fetch the final creative asset for a run.
  app.get("/pipeline/:runId/asset", async (req, reply) => {
    const { runId } = req.params as { runId: string };
    const run = getRun(runId);
    if (!run) return reply.code(404).send({ error: "run_not_found" });
    const asset = getAsset(runId);
    if (!asset) return reply.code(202).send({ status: "pending", state: run.state });
    return reply.send({ runId, asset, state: run.state });
  });
}
