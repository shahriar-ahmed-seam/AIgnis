import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config, imageEnabled, llmEnabled } from "../config.js";
import { runWithFallback } from "../lib/fallback.js";
import { MockCopyGenerator, makeLiveCopyGenerator } from "../adapters/copy.js";
import { MockImageGenerator, makeLiveImageGenerator, buildImagePrompt } from "../adapters/image.js";
import { FileInventoryProvider, MockInventoryProvider } from "../adapters/inventory.js";
import { resolveDataset } from "../data/datasets.js";

const bodySchema = z.object({
  productIdea: z.string().min(1).transform((s) => s.trim()),
});

/**
 * Live Pass endpoints — perform a single real model call on demand (the Q&A
 * trump card). Each is guarded by the Fallback Controller so it never fails:
 * if the provider is unconfigured/slow/errors, it returns the curated mock and
 * labels the output "Simulated".
 */
export async function liveRoutes(app: FastifyInstance) {
  // Real LLM copy generation (one invocation).
  app.post("/live/copy", async (req, reply) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    const idea = parsed.data.productIdea;
    const dataset = resolveDataset(idea);

    const inv = new FileInventoryProvider();
    const mockInv = new MockInventoryProvider(dataset.inventory);
    const inventory = await runWithFallback({
      enabled: true,
      timeoutMs: config.mcp.timeoutMs,
      attempt: () => inv.getContext(idea),
      fallback: () => mockInv.getContext(),
    });

    const live = makeLiveCopyGenerator();
    const result = await runWithFallback({
      enabled: !!live,
      timeoutMs: config.llm.timeoutMs,
      attempt: () => live!.generate(idea, inventory.value),
      fallback: () => new MockCopyGenerator(dataset.copy).generate(),
    });

    return reply.send({
      copy: result.value,
      label: result.label,
      fellBack: result.fellBack,
      reason: result.reason ?? null,
      provider: live?.id ?? "mock:curated",
    });
  });

  // Real diffusion image generation (one invocation).
  app.post("/live/image", async (req, reply) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    const idea = parsed.data.productIdea;
    const dataset = resolveDataset(idea);
    const prompt = buildImagePrompt(idea, dataset.palette);

    const live = makeLiveImageGenerator();
    const result = await runWithFallback({
      enabled: !!live,
      timeoutMs: config.image.timeoutMs,
      attempt: () => live!.generate(prompt),
      fallback: () => new MockImageGenerator(dataset.heroImage).generate(),
    });

    const hero = result.value.fallbackGradient
      ? result.value
      : { ...result.value, fallbackGradient: dataset.heroImage.fallbackGradient };

    return reply.send({
      hero,
      label: result.label,
      fellBack: result.fellBack,
      reason: result.reason ?? null,
      provider: live?.id ?? "mock:pregenerated",
      prompt,
    });
  });

  // Capability report — what's actually live right now.
  app.get("/live/capabilities", async () => ({
    llm: {
      provider: config.llm.provider,
      enabled: llmEnabled(),
      model:
        config.llm.provider === "groq"
          ? config.llm.groqModel
          : config.llm.provider === "openrouter"
            ? config.llm.openrouterModel
            : config.llm.provider === "ollama"
              ? config.llm.ollamaModel
              : null,
    },
    image: {
      provider: config.image.provider,
      enabled: imageEnabled(),
      model:
        config.image.provider === "pollinations"
          ? config.image.pollinationsModel
          : config.image.provider === "huggingface"
            ? config.image.hfModel
            : null,
    },
  }));
}
