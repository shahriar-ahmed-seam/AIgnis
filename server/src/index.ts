import Fastify from "fastify";
import cors from "@fastify/cors";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createReadStream } from "node:fs";
import { config, imageEnabled, llmEnabled } from "./config.js";
import { pipelineRoutes } from "./routes/pipeline.js";
import { liveRoutes } from "./routes/live.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { telemetryRoutes } from "./routes/telemetry.js";
import { graphRoutes } from "./routes/graph.js";
import { streamRoutes } from "./routes/streams.js";
import { pulseRoutes } from "./routes/pulse.js";
import { publishRoutes } from "./routes/publish.js";
import { workspaceRoutes } from "./routes/workspace.js";
import { startRunGc } from "./services/orchestrator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, "..", "generated");

async function main() {
  const app = Fastify({ logger: { level: "info", transport: undefined } });

  await app.register(cors, { origin: config.corsOrigin, methods: ["GET", "POST", "OPTIONS"] });

  // Health / capability probe (frontend uses this to pick Local vs Remote source).
  app.get("/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
    capabilities: {
      backendAvailable: true,
      llm: { provider: config.llm.provider, enabled: llmEnabled() },
      image: { provider: config.image.provider, enabled: imageEnabled() },
      mcp: { enabled: true, file: config.mcp.inventoryFile },
    },
  }));

  // Serve generated images (from live diffusion) at /generated/<file>.
  app.get("/generated/:file", async (req, reply) => {
    const { file } = req.params as { file: string };
    if (!/^[\w.-]+\.(png|jpg|jpeg|webp)$/i.test(file)) {
      return reply.code(400).send({ error: "bad_filename" });
    }
    const path = join(GENERATED_DIR, file);
    if (!existsSync(path)) return reply.code(404).send({ error: "not_found" });
    reply.header("Content-Type", "image/png");
    return reply.send(createReadStream(path));
  });

  await app.register(pipelineRoutes);
  await app.register(liveRoutes);
  await app.register(inventoryRoutes);
  await app.register(telemetryRoutes);
  await app.register(graphRoutes);
  await app.register(streamRoutes);
  await app.register(pulseRoutes);
  await app.register(publishRoutes);
  await app.register(workspaceRoutes);

  startRunGc();

  await app.listen({ port: config.port, host: config.host });
  app.log.info(
    `AIgnis backend ready on http://${config.host}:${config.port} ` +
      `| LLM=${config.llm.provider}(${llmEnabled() ? "on" : "off"}) ` +
      `IMAGE=${config.image.provider}(${imageEnabled() ? "on" : "off"})`
  );
}

main().catch((err) => {
  console.error("Failed to start AIgnis backend:", err);
  process.exit(1);
});
