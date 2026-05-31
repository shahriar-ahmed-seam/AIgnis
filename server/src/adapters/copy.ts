import type { CopyGenerator, InventoryRecord, MarketingCopy } from "../types.js";
import { config } from "../config.js";
import { fetchWithTimeout } from "../lib/fallback.js";
import { recordCall, estimateTokens } from "../services/telemetry.js";

// ---------------------------------------------------------------------------
// LLM copy generators. All FREE options. The MCP inventory is injected into
// the prompt so the copy is grounded in real stock/margin context.
//
// Providers:
//   - Groq        : free, fast hosted Llama 3.x          (OpenAI-compatible)
//   - OpenRouter  : free ":free" models incl. Llama 3.1  (OpenAI-compatible)
//   - Ollama      : fully local Llama, no key, no internet
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the Copywriter agent in AIgnis, an autonomous marketing engine.
Write punchy, on-brand marketing copy for the given product idea.
Use the provided inventory context to stay grounded (mention scarcity if stock is low, etc.).
Respond ONLY with strict JSON: {"headline": string (max 6 words), "body": string (max 32 words), "cta": string (max 4 words)}.
No markdown, no commentary.`;

function buildUserPrompt(idea: string, inventory: InventoryRecord[]): string {
  const inv = inventory
    .map((i) => `- ${i.name} (${i.sku}): ${i.stock} in stock [${i.status}]`)
    .join("\n");
  return `Product idea: "${idea}"\n\nLive inventory context:\n${inv || "(none)"}\n\nReturn the JSON now.`;
}

/** Robustly extract the JSON object from a model response. */
function parseCopy(text: string): MarketingCopy {
  const match = text.match(/\{[\s\S]*\}/);
  const raw = match ? match[0] : text;
  const obj = JSON.parse(raw);
  const clean = (s: unknown, fallback: string) =>
    typeof s === "string" && s.trim() ? s.trim() : fallback;
  return {
    headline: clean(obj.headline, "Built For What's Next."),
    body: clean(obj.body, "An on-brand campaign, generated in one pass."),
    cta: clean(obj.cta, "Learn More"),
  };
}

// ---- OpenAI-compatible chat (Groq + OpenRouter share this shape) ----
async function openAiCompatChat(args: {
  url: string;
  apiKey: string;
  model: string;
  idea: string;
  inventory: InventoryRecord[];
  timeoutMs: number;
  extraHeaders?: Record<string, string>;
}): Promise<MarketingCopy> {
  const started = Date.now();
  const userPrompt = buildUserPrompt(args.idea, args.inventory);
  try {
    const res = await fetchWithTimeout(args.url, {
      method: "POST",
      timeoutMs: args.timeoutMs,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${args.apiKey}`,
        ...args.extraHeaders,
      },
      body: JSON.stringify({
        model: args.model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content ?? "";
    // prefer provider-reported usage; otherwise estimate
    const usage = data?.usage ?? {};
    recordCall({
      kind: "llm",
      model: args.model,
      latencyMs: Date.now() - started,
      promptTokens: usage.prompt_tokens ?? estimateTokens(SYSTEM_PROMPT + userPrompt),
      completionTokens: usage.completion_tokens ?? estimateTokens(content),
      ok: true,
    });
    return parseCopy(content);
  } catch (err) {
    recordCall({ kind: "llm", model: args.model, latencyMs: Date.now() - started, ok: false });
    throw err;
  }
}

export class GroqCopyGenerator implements CopyGenerator {
  readonly id = `groq:${config.llm.groqModel}`;
  generate(idea: string, inventory: InventoryRecord[]) {
    return openAiCompatChat({
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: config.llm.groqKey,
      model: config.llm.groqModel,
      idea,
      inventory,
      timeoutMs: config.llm.timeoutMs,
    });
  }
}

export class OpenRouterCopyGenerator implements CopyGenerator {
  readonly id = `openrouter:${config.llm.openrouterModel}`;
  generate(idea: string, inventory: InventoryRecord[]) {
    return openAiCompatChat({
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: config.llm.openrouterKey,
      model: config.llm.openrouterModel,
      idea,
      inventory,
      timeoutMs: config.llm.timeoutMs,
      extraHeaders: {
        "HTTP-Referer": "https://aignis.local",
        "X-Title": "AIgnis",
      },
    });
  }
}

export class OllamaCopyGenerator implements CopyGenerator {
  readonly id = `ollama:${config.llm.ollamaModel}`;
  async generate(idea: string, inventory: InventoryRecord[]): Promise<MarketingCopy> {
    const started = Date.now();
    const userPrompt = buildUserPrompt(idea, inventory);
    try {
      const res = await fetchWithTimeout(`${config.llm.ollamaBaseUrl}/api/chat`, {
        method: "POST",
        timeoutMs: config.llm.timeoutMs,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.llm.ollamaModel,
          stream: false,
          format: "json",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as any;
      const content = data?.message?.content ?? "";
      recordCall({
        kind: "llm",
        model: config.llm.ollamaModel,
        latencyMs: Date.now() - started,
        promptTokens: data?.prompt_eval_count ?? estimateTokens(SYSTEM_PROMPT + userPrompt),
        completionTokens: data?.eval_count ?? estimateTokens(content),
        ok: true,
      });
      return parseCopy(content);
    } catch (err) {
      recordCall({ kind: "llm", model: config.llm.ollamaModel, latencyMs: Date.now() - started, ok: false });
      throw err;
    }
  }
}

/** Mock copy generator — always succeeds. Used as the Fallback. */
export class MockCopyGenerator implements CopyGenerator {
  readonly id = "mock:curated";
  constructor(private readonly fallbackCopy: MarketingCopy) {}
  async generate(): Promise<MarketingCopy> {
    return this.fallbackCopy;
  }
}

/** Pick the configured live copy generator, or null if none/unconfigured. */
export function makeLiveCopyGenerator(): CopyGenerator | null {
  switch (config.llm.provider) {
    case "groq":
      return config.llm.groqKey ? new GroqCopyGenerator() : null;
    case "openrouter":
      return config.llm.openrouterKey ? new OpenRouterCopyGenerator() : null;
    case "ollama":
      return new OllamaCopyGenerator();
    default:
      return null;
  }
}
