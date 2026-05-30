import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { InventoryProvider, InventoryRecord } from "../types.js";
import { config } from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveInventoryPath(): string {
  const p = config.mcp.inventoryFile;
  return isAbsolute(p) ? p : join(__dirname, "..", "..", p);
}

interface RawItem {
  sku: string;
  name: string;
  stock: number;
  status?: string;
  category?: string;
}

function toRecord(i: RawItem): InventoryRecord {
  const status: InventoryRecord["status"] =
    i.status === "ready" || i.status === "low" || i.status === "backorder"
      ? i.status
      : i.stock <= 0
        ? "backorder"
        : i.stock < 500
          ? "low"
          : "ready";
  return { sku: i.sku, name: i.name, stock: i.stock, status };
}

/**
 * Reads inventory directly from the local JSON file. This is the same data the
 * MCP server exposes — useful when the pipeline wants inventory context without
 * spawning the MCP process.
 */
export class FileInventoryProvider implements InventoryProvider {
  readonly id = "file:inventory.json";
  async getContext(idea: string): Promise<InventoryRecord[]> {
    const raw = await readFile(resolveInventoryPath(), "utf8");
    const json = JSON.parse(raw) as { items: RawItem[] };
    const all = json.items.map(toRecord);
    // light relevance filter by keyword, else return all
    const q = idea.toLowerCase();
    const filtered = all.filter((r) => q && r.name.toLowerCase().split(/\s+/).some((w) => q.includes(w)));
    return filtered.length ? filtered : all;
  }
}

/** Mock inventory provider — always succeeds with the dataset's records. */
export class MockInventoryProvider implements InventoryProvider {
  readonly id = "mock:dataset";
  constructor(private readonly fallback: InventoryRecord[]) {}
  async getContext(): Promise<InventoryRecord[]> {
    return this.fallback;
  }
}
