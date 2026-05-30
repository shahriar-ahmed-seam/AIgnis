import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getWorkspace, addHistory, addLearning, updateProfile } from "../workspace/workspace.js";

/**
 * Brand Workspace endpoints — persistent brand memory.
 * Tools: JsonStore persistence (Node fs).
 */
export async function workspaceRoutes(app: FastifyInstance) {
  app.get("/workspace", async () => getWorkspace());

  app.post("/workspace/history", async (req, reply) => {
    const schema = z.object({
      campaignId: z.string().min(1),
      name: z.string().min(1),
      result: z.string().default(""),
      status: z.enum(["live", "optimized", "archived"]).default("live"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    return reply.code(201).send(addHistory(parsed.data));
  });

  app.post("/workspace/learning", async (req, reply) => {
    const schema = z.object({ text: z.string().min(1), confidence: z.number().min(0).max(100).default(80) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    return reply.code(201).send(addLearning(parsed.data.text, parsed.data.confidence));
  });

  app.patch("/workspace/profile", async (req, reply) => {
    const schema = z.object({
      name: z.string().optional(),
      tagline: z.string().optional(),
      voice: z.string().optional(),
      palette: z.array(z.string()).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    return reply.send(updateProfile(parsed.data));
  });
}
