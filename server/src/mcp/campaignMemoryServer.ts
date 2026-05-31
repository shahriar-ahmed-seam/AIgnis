import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getWorkspace, addLearning, addHistory } from "../services/workspace.js";

// ---------------------------------------------------------------------------
// AIgnis MCP Campaign Memory Server.
// Exposes the persistent Brand Workspace (profile, confidence-ranked learnings,
// campaign history) over MCP so agents can recall what's been learned about a
// brand over time and append new learnings/campaigns. This is the "memory"
// that makes outputs more on-brand each run.
//
// Run standalone:   npm run mcp:memory
// ---------------------------------------------------------------------------

const server = new McpServer({ name: "aignis-campaign-memory", version: "0.1.0" });

// ---- Resource: the full workspace memory ----
server.resource(
  "workspace",
  "memory://workspace",
  { description: "Brand profile, learnings, and campaign history", mimeType: "application/json" },
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(getWorkspace(), null, 2) }],
  })
);

// ---- Tool: get the brand profile ----
server.tool("get_brand_profile", "Get the brand's profile (name, tagline, voice, palette).", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(getWorkspace().profile, null, 2) }],
}));

// ---- Tool: recall top learnings about the brand ----
server.tool(
  "recall_learnings",
  "Recall what AIgnis has learned about the brand, ranked by confidence.",
  { limit: z.number().min(1).max(30).optional() },
  async ({ limit }) => {
    const learnings = [...getWorkspace().learnings]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit ?? 5);
    return { content: [{ type: "text", text: JSON.stringify(learnings, null, 2) }] };
  }
);

// ---- Tool: list past campaigns ----
server.tool("list_campaigns", "List the brand's past campaigns and their results.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(getWorkspace().history, null, 2) }],
}));

// ---- Tool: record a new learning ----
server.tool(
  "record_learning",
  "Append a new learning about the brand (memory compounds over time).",
  { text: z.string(), confidence: z.number().min(0).max(100).optional() },
  async ({ text, confidence }) => {
    const l = addLearning(text, confidence ?? 80);
    return { content: [{ type: "text", text: `Recorded: ${JSON.stringify(l)}` }] };
  }
);

// ---- Tool: record a campaign in history ----
server.tool(
  "record_campaign",
  "Append a completed campaign to the brand's history.",
  {
    campaignId: z.string(),
    name: z.string(),
    result: z.string().optional(),
    status: z.enum(["live", "optimized", "archived"]).optional(),
  },
  async ({ campaignId, name, result, status }) => {
    const h = addHistory({ campaignId, name, result: result ?? "", status: status ?? "live" });
    return { content: [{ type: "text", text: `Recorded: ${JSON.stringify(h)}` }] };
  }
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("[aignis-campaign-memory] MCP server running on stdio");
}
main().catch((err) => {
  console.error("[aignis-campaign-memory] fatal:", err);
  process.exit(1);
});
