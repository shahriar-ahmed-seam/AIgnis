import type { FastifyInstance } from "fastify";
import { snapshot, COST_TABLE } from "../telemetry/telemetry.js";

/**
 * LLMOps observability endpoints. Returns REAL metered metrics from actual
 * model calls (latency, tokens, cost, cache, semantic-router decisions),
 * blended with seeded baselines so the dashboard is populated even before any
 * live call. Tools: in-process telemetry recorder + JsonStore (Node fs).
 */
export async function telemetryRoutes(app: FastifyInstance) {
  app.get("/observability/metrics", async () => {
    const snap = snapshot();
    return {
      ...snap,
      costEstimateNote: "Cost uses public list prices; local models are free.",
    };
  });

  app.get("/observability/models", async () => ({
    models: Object.entries(COST_TABLE).map(([model, row]) => ({
      model,
      tier: row.tier,
      inputPer1M: row.inPer1M,
      outputPer1M: row.outPer1M,
    })),
  }));
}
