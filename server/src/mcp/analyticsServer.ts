import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getPulse, optimizePulse } from "../services/pulse.js";

// ---------------------------------------------------------------------------
// AIgnis MCP Campaign Analytics Server.
// Exposes post-launch Campaign Pulse (per-channel performance, viewer
// sentiment, the Analyst narrative) over MCP, and lets an agent trigger the
// self-optimization loop. This closes the loop: agents can read real results
// and act on them through the protocol.
//
// Run standalone:   npm run mcp:analytics
// ---------------------------------------------------------------------------

const server = new McpServer({ name: "aignis-campaign-analytics", version: "0.1.0" });

// ---- Tool: get a campaign's pulse (per-channel performance + narrative) ----
server.tool(
  "get_campaign_pulse",
  "Get post-launch performance, viewer reactions, and the Analyst narrative for a campaign.",
  {
    campaignId: z.string().describe("the campaign id"),
    presetId: z.string().optional().describe("dataset preset, e.g. eco-sneakers"),
  },
  async ({ campaignId, presetId }) => {
    const pulse = getPulse(campaignId, presetId ?? "default");
    return { content: [{ type: "text", text: JSON.stringify(pulse, null, 2) }] };
  }
);

// ---- Tool: summarize channel performance ----
server.tool(
  "channel_summary",
  "Summarize the per-channel headline metrics for a campaign (base vs optimized).",
  { campaignId: z.string(), presetId: z.string().optional() },
  async ({ campaignId, presetId }) => {
    const pulse = getPulse(campaignId, presetId ?? "default");
    const summary = pulse.channels.map((c) => ({
      channel: c.name,
      metrics: pulse.optimized ? c.optimized : c.base,
    }));
    return { content: [{ type: "text", text: JSON.stringify({ optimized: pulse.optimized, summary }, null, 2) }] };
  }
);

// ---- Tool: run the optimization loop ----
server.tool(
  "optimize_campaign",
  "Trigger the self-optimization loop for a campaign (rewrites weak creative, reallocates spend).",
  { campaignId: z.string() },
  async ({ campaignId }) => {
    const updated = optimizePulse(campaignId);
    if (!updated) return { content: [{ type: "text", text: `No campaign "${campaignId}". Fetch its pulse first.` }], isError: true };
    return {
      content: [
        {
          type: "text",
          text: `Optimized. Actions: ${updated.optimizationActions.join("; ")}. New headline: "${updated.optimizedHeadline}".`,
        },
      ],
    };
  }
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("[aignis-campaign-analytics] MCP server running on stdio");
}
main().catch((err) => {
  console.error("[aignis-campaign-analytics] fatal:", err);
  process.exit(1);
});
