import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ImageGenerator, ImageRef } from "../types.js";
import { config } from "../config.js";
import { fetchWithTimeout } from "../lib/fallback.js";
import { recordCall } from "../telemetry/telemetry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Generated images are written here and served statically at /generated/*
const OUTPUT_DIR = join(__dirname, "..", "..", "generated");

async function saveImage(bytes: ArrayBuffer, name: string): Promise<string> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const file = join(OUTPUT_DIR, name);
  await writeFile(file, Buffer.from(bytes));
  return `/generated/${name}`;
}

// ---------------------------------------------------------------------------
// Pollinations — FREE, NO KEY. Hosted Flux/SD via a simple GET URL.
// We can either hand back the URL directly (zero latency) or download it so
// the asset lives locally. We download so the demo works offline afterward.
// ---------------------------------------------------------------------------
export class PollinationsImageGenerator implements ImageGenerator {
  readonly id = `pollinations:${config.image.pollinationsModel}`;
  async generate(prompt: string): Promise<ImageRef> {
    const started = Date.now();
    try {
      const enc = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${enc}?model=${config.image.pollinationsModel}&width=1024&height=1024&nologo=true`;
      const res = await fetchWithTimeout(url, { method: "GET", timeoutMs: config.image.timeoutMs });
      if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
      const bytes = await res.arrayBuffer();
      const src = await saveImage(bytes, `hero-${Date.now()}.png`);
      recordCall({ kind: "image", model: config.image.pollinationsModel, latencyMs: Date.now() - started, ok: true });
      return { src, alt: prompt.slice(0, 120), fallbackGradient: "" };
    } catch (err) {
      recordCall({ kind: "image", model: config.image.pollinationsModel, latencyMs: Date.now() - started, ok: false });
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// Hugging Face Inference API — FREE tier with a token. Returns raw image bytes.
// ---------------------------------------------------------------------------
export class HuggingFaceImageGenerator implements ImageGenerator {
  readonly id = `huggingface:${config.image.hfModel}`;
  async generate(prompt: string): Promise<ImageRef> {
    const started = Date.now();
    try {
      const res = await fetchWithTimeout(
        `https://api-inference.huggingface.co/models/${config.image.hfModel}`,
        {
          method: "POST",
          timeoutMs: config.image.timeoutMs,
          headers: {
            Authorization: `Bearer ${config.image.hfToken}`,
            "Content-Type": "application/json",
            Accept: "image/png",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );
      if (!res.ok) throw new Error(`HuggingFace HTTP ${res.status}: ${await res.text()}`);
      const bytes = await res.arrayBuffer();
      const src = await saveImage(bytes, `hero-${Date.now()}.png`);
      recordCall({ kind: "image", model: config.image.hfModel, latencyMs: Date.now() - started, ok: true });
      return { src, alt: prompt.slice(0, 120), fallbackGradient: "" };
    } catch (err) {
      recordCall({ kind: "image", model: config.image.hfModel, latencyMs: Date.now() - started, ok: false });
      throw err;
    }
  }
}

/** Mock image generator — always succeeds with the dataset's pre-gen hero. */
export class MockImageGenerator implements ImageGenerator {
  readonly id = "mock:pregenerated";
  constructor(private readonly fallbackImage: ImageRef) {}
  async generate(): Promise<ImageRef> {
    return this.fallbackImage;
  }
}

export function makeLiveImageGenerator(): ImageGenerator | null {
  switch (config.image.provider) {
    case "pollinations":
      return new PollinationsImageGenerator();
    case "huggingface":
      return config.image.hfToken ? new HuggingFaceImageGenerator() : null;
    default:
      return null;
  }
}

/** Build a diffusion prompt from the idea + brand palette. */
export function buildImagePrompt(idea: string, palette: string[]): string {
  return [
    `Premium product hero photograph for a marketing campaign: ${idea}.`,
    "Cinematic studio lighting, ultra-detailed, commercial advertising quality, 8k,",
    "clean minimalist composition, generous negative space in the lower-left third.",
    palette.length ? `Brand palette accents: ${palette.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
