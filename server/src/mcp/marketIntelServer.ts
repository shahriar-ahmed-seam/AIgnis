import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ALL_SOURCES, makeEvent, SOURCE_INFO, type StreamSource } from "../services/streamSource.js";

// ---------------------------------------------------------------------------
// AIgnis MCP Market Intelligence Server.
// Exposes the real-time ingestion sources (CDC, web scraper, review stream,
// social signals) over MCP so the Researcher agent can pull a fresh batch of
// market signals on demand instead of waiting for the live stream.
//
// Run standalone:   npm run mcp:market
// ---------------------------------------------------------------------------

const server = new McpServer({ name: "aignis-market-intel", version: "0.1.0" });

// ---- Resource: ingestion source catalog ----
server.resource(
  "sources",
  "market://sources",
  { description: "Catalog of market ingestion sources + cadence/tech", mimeType: "application/json" },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(ALL_SOURCES.map((s) => ({ id: s, ...SOURCE_INFO[s] })), null, 2),
      },
    ],
  })
);

// ---- Tool: pull a batch of recent signals (optionally from one source) ----
server.tool(
  "pull_signals",
  "Pull a batch of recent market signals. Optionally restrict to one source.",
  {
    source: z.enum(["cdc", "scraper", "reviews", "social"]).optional(),
    count: z.number().min(1).max(50).optional(),
  },
  async ({ source, count }) => {
    const n = count ?? 10;
    const sources: StreamSource[] = source ? [source] : ALL_SOURCES;
    const batch = Array.from({ length: n }, () => makeEvent(sources[Math.floor(Math.random() * sources.length)]));
    return { content: [{ type: "text", text: JSON.stringify(batch, null, 2) }] };
  }
);

// ---- Tool: pull only the review stream (for sentiment/RAG) ----
server.tool(
  "pull_reviews",
  "Pull a batch of customer review signals (for sentiment analysis / RAG).",
  { count: z.number().min(1).max(50).optional() },
  async ({ count }) => {
    const batch = Array.from({ length: count ?? 8 }, () => makeEvent("reviews"));
    return { content: [{ type: "text", text: JSON.stringify(batch, null, 2) }] };
  }
);

// ---- Tool: pull trending social signals ----
server.tool(
  "trending_signals",
  "Pull current trending social signals with velocity.",
  { count: z.number().min(1).max(20).optional() },
  async ({ count }) => {
    const batch = Array.from({ length: count ?? 5 }, () => makeEvent("social"));
    return { content: [{ type: "text", text: JSON.stringify(batch, null, 2) }] };
  }
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("[aignis-market-intel] MCP server running on stdio");
}
main().catch((err) => {
  console.error("[aignis-market-intel] fatal:", err);
  process.exit(1);
});
