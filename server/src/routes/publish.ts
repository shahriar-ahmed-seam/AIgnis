import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { publishCampaign, listPosts, clearPosts, type ChannelId } from "../services/publish.js";

/**
 * Publishing + Published gallery endpoints.
 * NOTE: real auto-posting to TikTok/Instagram needs platform OAuth + app
 * review — simulated here; posts carry simulated:true and links open the
 * platform. Tools: JsonStore persistence.
 */
export async function publishRoutes(app: FastifyInstance) {
  const body = z.object({
    campaignId: z.string().min(1),
    presetId: z.string().default("default"),
    headline: z.string().min(1),
    body: z.string().default(""),
    cta: z.string().default("Learn More"),
    heroSrc: z.string().default("/heroes/default.png"),
    channels: z.array(z.enum(["instagram", "tiktok", "web"])).default(["tiktok", "instagram", "web"]),
  });

  app.post("/publish", async (req, reply) => {
    const parsed = body.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request", details: parsed.error.flatten() });
    const posts = publishCampaign(parsed.data as Required<typeof parsed.data> & { channels: ChannelId[] });
    return reply.code(201).send({ published: posts, note: "Simulated publish — links open each platform." });
  });

  app.get("/published", async () => ({ posts: listPosts() }));

  app.delete("/published", async () => {
    clearPosts();
    return { cleared: true };
  });
}
