import type { FastifyInstance } from "fastify";
import { FileInventoryProvider } from "../adapters/inventory.js";
import { config } from "../config.js";
import { runWithFallback } from "../lib/fallback.js";

/**
 * HTTP view of the MCP inventory data. The canonical MCP interface lives in
 * src/mcp/inventoryServer.ts (stdio). This route lets the frontend read the
 * same local inventory file over HTTP without spawning the MCP process.
 */
export async function inventoryRoutes(app: FastifyInstance) {
  app.get("/inventory", async (req, reply) => {
    const { q } = req.query as { q?: string };
    const provider = new FileInventoryProvider();
    const result = await runWithFallback({
      enabled: true,
      timeoutMs: config.mcp.timeoutMs,
      attempt: () => provider.getContext(q ?? ""),
      fallback: () => [],
    });
    return reply.send({
      records: result.value,
      label: result.label,
      source: provider.id,
      fellBack: result.fellBack,
    });
  });
}
