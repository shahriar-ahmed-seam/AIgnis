import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getGraph, neighbors, traverse, applicableRules } from "../services/graph.js";

// ---------------------------------------------------------------------------
// AIgnis MCP Brand Guidelines Server.
// Exposes the brand knowledge graph (GraphRAG) over the Model Context Protocol
// so agents can read brand rules, audiences, channels, and competitors — and
// check a candidate creative against brand-compliance rules — before generating.
//
// Run standalone:   npm run mcp:brand
// ---------------------------------------------------------------------------

const server = new McpServer({ name: "aignis-brand-guidelines", version: "0.1.0" });

// ---- Resource: the full brand knowledge graph ----
server.resource(
  "brand-graph",
  "brand://graph",
  { description: "Full brand knowledge graph: audiences, rules, channels, competitors", mimeType: "application/json" },
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(getGraph(), null, 2) }],
  })
);

// ---- Tool: list active brand rules ----
server.tool(
  "list_brand_rules",
  "List the brand's compliance and style rules (tone, claims, palette, etc.).",
  {},
  async () => {
    const rules = getGraph().nodes.filter((n) => n.type === "rule");
    return { content: [{ type: "text", text: JSON.stringify(rules, null, 2) }] };
  }
);

// ---- Tool: check a candidate creative against brand rules ----
server.tool(
  "check_compliance",
  "Check a candidate copy/creative string against brand rules. Returns which rules are triggered.",
  { text: z.string().describe("the candidate headline/copy to validate") },
  async ({ text }) => {
    const result = applicableRules(text);
    const triggered = result.filter((r) => r.triggered).map((r) => r.rule.label);
    const verdict = triggered.length
      ? `Review needed — triggers: ${triggered.join(", ")}`
      : "Passes brand-rule gate.";
    return { content: [{ type: "text", text: `${verdict}\n\n${JSON.stringify(result, null, 2)}` }] };
  }
);

// ---- Tool: get the relationships of a brand entity ----
server.tool(
  "get_relationships",
  "Get the direct relationships of a graph node (e.g. which channels reach an audience).",
  { id: z.string().describe("node id, e.g. brand | aud-genz | chan-tiktok | rule-tone") },
  async ({ id }) => {
    const r = neighbors(id);
    if (!r) return { content: [{ type: "text", text: `No node "${id}".` }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

// ---- Tool: traverse the graph from a node ----
server.tool(
  "traverse_graph",
  "Breadth-first traversal from a node up to N hops (relationship-aware retrieval).",
  { id: z.string().describe("start node id"), depth: z.number().min(1).max(5).optional() },
  async ({ id, depth }) => {
    const r = traverse(id, depth ?? 2);
    if (!r) return { content: [{ type: "text", text: `No node "${id}".` }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  }
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("[aignis-brand-guidelines] MCP server running on stdio");
}
main().catch((err) => {
  console.error("[aignis-brand-guidelines] fatal:", err);
  process.exit(1);
});
