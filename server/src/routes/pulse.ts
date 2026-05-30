import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPulse, optimizePulse } from "../pulse/pulse.js";

/**
 * Campaign Pulse + optimization-loop endpoints.
 * Tools: in-process pulse model + JsonStore persistence.
 */
export async function pulseRoutes(app: FastifyInstance) {
  const q = z.object({ presetId: z.string().default("default") });

  // get-or-create pulse for a campaign
  app.get("/pulse/:campaignId", async (req, reply) => {
    const { campaignId } = req.params as { campaignId: string };
    const parsed = q.safeParse(req.query);
    const presetId = parsed.success ? parsed.data.presetId : "default";
    return reply.send(getPulse(campaignId, presetId));
  });

  // run the self-optimization loop
  app.post("/pulse/:campaignId/optimize", async (req, reply) => {
    const { campaignId } = req.params as { campaignId: string };
    const updated = optimizePulse(campaignId);
    if (!updated) return reply.code(404).send({ error: "campaign_not_found" });
    return reply.send(updated);
  });
}
