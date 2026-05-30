import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

// Tiny dependency-free JSON document store. Each "collection" is a JSON file
// under server/.data/. Good enough for a demo (persists across restarts)
// without pulling in SQLite/Postgres. Swap for a real DB later if needed.
//
// Tool: Node.js fs (built-in). No external dependency.

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", ".data");

function pathFor(collection: string): string {
  const safe = collection.replace(/[^\w-]/g, "_");
  return isAbsolute(safe) ? safe : join(DATA_DIR, `${safe}.json`);
}

export class JsonStore<T> {
  private cache: T;
  private readonly file: string;

  constructor(
    private readonly collection: string,
    private readonly seed: T
  ) {
    this.file = pathFor(collection);
    this.cache = this.load();
  }

  private load(): T {
    try {
      if (existsSync(this.file)) {
        return JSON.parse(readFileSync(this.file, "utf8")) as T;
      }
    } catch {
      /* fall through to seed */
    }
    return structuredClone(this.seed);
  }

  get(): T {
    return this.cache;
  }

  set(value: T): void {
    this.cache = value;
    this.persist();
  }

  update(fn: (current: T) => T): T {
    this.cache = fn(this.cache);
    this.persist();
    return this.cache;
  }

  private persist(): void {
    try {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(this.file, JSON.stringify(this.cache, null, 2), "utf8");
    } catch (err) {
      // persistence is best-effort; never crash the request path
      console.error(`[store:${this.collection}] persist failed:`, err);
    }
  }
}
