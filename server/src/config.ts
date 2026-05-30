// Minimal .env loader (no dependency) + typed config. Reads server/.env if
// present; otherwise uses process.env / safe defaults. Everything optional.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");

function loadEnvFile() {
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const env = process.env;

export type LlmProvider = "groq" | "openrouter" | "ollama" | "none";
export type ImageProvider = "pollinations" | "huggingface" | "none";

export const config = {
  port: Number(env.PORT ?? 8787),
  host: env.HOST ?? "0.0.0.0",
  corsOrigin: (env.CORS_ORIGIN ?? "http://localhost:5173").split(",").map((s) => s.trim()),

  llm: {
    provider: (env.LLM_PROVIDER ?? "none") as LlmProvider,
    groqKey: env.GROQ_API_KEY ?? "",
    groqModel: env.GROQ_MODEL ?? "llama-3.1-8b-instant",
    openrouterKey: env.OPENROUTER_API_KEY ?? "",
    openrouterModel: env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct:free",
    ollamaBaseUrl: env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    ollamaModel: env.OLLAMA_MODEL ?? "llama3.1:8b",
    timeoutMs: Number(env.LLM_TIMEOUT_MS ?? 20000),
  },

  image: {
    provider: (env.IMAGE_PROVIDER ?? "none") as ImageProvider,
    pollinationsModel: env.POLLINATIONS_MODEL ?? "flux",
    hfToken: env.HF_API_TOKEN ?? "",
    hfModel: env.HF_MODEL ?? "black-forest-labs/FLUX.1-schnell",
    timeoutMs: Number(env.IMAGE_TIMEOUT_MS ?? 60000),
  },

  mcp: {
    inventoryFile: env.MCP_INVENTORY_FILE ?? "./data/inventory.json",
    timeoutMs: Number(env.MCP_TIMEOUT_MS ?? 10000),
  },
} as const;

/** Whether a real LLM is configured (so Live copy is possible). */
export function llmEnabled(): boolean {
  const l = config.llm;
  if (l.provider === "groq") return !!l.groqKey;
  if (l.provider === "openrouter") return !!l.openrouterKey;
  if (l.provider === "ollama") return true; // local, no key
  return false;
}

/** Whether a real image generator is configured. */
export function imageEnabled(): boolean {
  const i = config.image;
  if (i.provider === "pollinations") return true; // no key needed
  if (i.provider === "huggingface") return !!i.hfToken;
  return false;
}
