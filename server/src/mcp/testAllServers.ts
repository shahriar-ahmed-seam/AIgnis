import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Smoke-test every AIgnis MCP server: spawn over stdio, list tools/resources.
// Run: npx tsx src/mcp/testAllServers.ts

const tsx = new URL("../../node_modules/tsx/dist/cli.mjs", import.meta.url).pathname.replace(/^\//, "");
const here = (f: string) => new URL(`./${f}`, import.meta.url).pathname.replace(/^\//, "");

const SERVERS = [
  { name: "inventory", file: "inventoryServer.ts" },
  { name: "brand-guidelines", file: "brandGuidelinesServer.ts" },
  { name: "campaign-memory", file: "campaignMemoryServer.ts" },
  { name: "market-intel", file: "marketIntelServer.ts" },
  { name: "campaign-analytics", file: "analyticsServer.ts" },
];

async function check(name: string, file: string) {
  const client = new Client({ name: "aignis-smoke", version: "0.1.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [tsx, here(file)] }));
  const tools = await client.listTools();
  let resources: string[] = [];
  try {
    resources = (await client.listResources()).resources.map((r) => r.uri);
  } catch {
    /* some servers expose no resources */
  }
  console.log(`✓ ${name}: tools=[${tools.tools.map((t) => t.name).join(", ")}] resources=[${resources.join(", ")}]`);
  await client.close();
}

async function main() {
  for (const s of SERVERS) {
    try {
      await check(s.name, s.file);
    } catch (err) {
      console.error(`✗ ${s.name}:`, err instanceof Error ? err.message : err);
    }
  }
  process.exit(0);
}
main();
