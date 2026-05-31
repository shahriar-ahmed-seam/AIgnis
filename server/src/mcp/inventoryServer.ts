import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "../config.js";

// ---------------------------------------------------------------------------
// AInigma MCP Inventory Server.
// Exposes the local inventory.json over the Model Context Protocol (stdio) so
// an AI agent / MCP client can securely read live stock, pricing and margin
// without the data ever touching a public cloud.
//
// Run standalone:   npm run mcp
// Or wire into an MCP client (Claude Desktop, etc.) via stdio.
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));

function inventoryPath(): string {
  const p = config.mcp.inventoryFile;
  return isAbsolute(p) ? p : join(__dirname, "..", "..", p);
}

interface RawItem {
  sku: string;
  name: string;
  category: string;
  stock: number;
  status: string;
  price: number;
  margin: number;
  material: string;
}

async function loadInventory(): Promise<{ items: RawItem[]; updatedAt: string; warehouse: string }> {
  const raw = await readFile(inventoryPath(), "utf8");
  return JSON.parse(raw);
}

const server = new McpServer({
  name: "aignis-inventory",
  version: "0.1.0",
});

// ---- Resource: the full inventory document ----
server.resource(
  "inventory",
  "inventory://all",
  { description: "Full product inventory with stock, pricing and margin", mimeType: "application/json" },
  async (uri) => {
    const data = await loadInventory();
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// ---- Tool: query inventory by keyword / category / status ----
server.tool(
  "query_inventory",
  "Search the product inventory. Optionally filter by free-text query, category, or stock status.",
  {
    query: z.string().optional().describe("free-text match against SKU / name / material"),
    category: z.string().optional().describe("e.g. footwear | beverage | subscription"),
    status: z.enum(["ready", "low", "backorder"]).optional(),
  },
  async ({ query, category, status }) => {
    const { items } = await loadInventory();
    const q = (query ?? "").toLowerCase();
    const filtered = items.filter((i) => {
      const matchesQ =
        !q ||
        i.sku.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.material.toLowerCase().includes(q);
      const matchesCat = !category || i.category === category;
      const matchesStatus = !status || i.status === status;
      return matchesQ && matchesCat && matchesStatus;
    });
    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
    };
  }
);

// ---- Tool: stock level for a specific SKU ----
server.tool(
  "get_stock",
  "Get the current stock level and status for a specific SKU.",
  { sku: z.string().describe("the product SKU, e.g. TERRA-RUN-01") },
  async ({ sku }) => {
    const { items } = await loadInventory();
    const item = items.find((i) => i.sku.toLowerCase() === sku.toLowerCase());
    if (!item) {
      return { content: [{ type: "text", text: `No item found for SKU "${sku}".` }], isError: true };
    }
    return {
      content: [
        {
          type: "text",
          text: `${item.name} (${item.sku}): ${item.stock} units — ${item.status}. Price $${item.price}, margin ${(item.margin * 100).toFixed(0)}%.`,
        },
      ],
    };
  }
);

// ---- Tool: low-stock alert ----
server.tool(
  "low_stock",
  "List all items that are low or on backorder (need restocking).",
  {},
  async () => {
    const { items } = await loadInventory();
    const low = items.filter((i) => i.status === "low" || i.status === "backorder");
    return { content: [{ type: "text", text: JSON.stringify(low, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe for logs (stdout is the MCP channel)
  console.error("[aignis-inventory] MCP server running on stdio");
}

main().catch((err) => {
  console.error("[aignis-inventory] fatal:", err);
  process.exit(1);
});
