import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Quick smoke test: spawn the MCP inventory server over stdio, list its tools,
// and call a couple of them. Run:  npx tsx src/mcp/testClient.ts

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath, // node
    args: [
      // run the server via tsx loader
      new URL("../../node_modules/tsx/dist/cli.mjs", import.meta.url).pathname.replace(/^\//, ""),
      new URL("./inventoryServer.ts", import.meta.url).pathname.replace(/^\//, ""),
    ],
  });

  const client = new Client({ name: "ainigma-test-client", version: "0.1.0" });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log("TOOLS:", tools.tools.map((t) => t.name).join(", "));

  const resources = await client.listResources();
  console.log("RESOURCES:", resources.resources.map((r) => r.uri).join(", "));

  const low = await client.callTool({ name: "low_stock", arguments: {} });
  console.log("low_stock ->", JSON.stringify(low.content).slice(0, 200), "…");

  const stock = await client.callTool({ name: "get_stock", arguments: { sku: "TERRA-RUN-01" } });
  console.log("get_stock ->", JSON.stringify(stock.content));

  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("MCP test client error:", err);
  process.exit(1);
});
