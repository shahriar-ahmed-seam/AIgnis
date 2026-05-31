// ---------------------------------------------------------------------------
// AIgnis — batch image generator.
// Generates every image the frontend needs via Pollinations (free, no API key)
// and saves each to its correct path under /public.
//
// Usage:
//   node scripts/generate-images.mjs           # generate only missing images
//   node scripts/generate-images.mjs --force   # regenerate everything
//   node scripts/generate-images.mjs hero      # only items tagged "hero"
//
// Pollinations endpoint: https://image.pollinations.ai/prompt/<prompt>?...
// (Flux model, no key.) If a request fails it's skipped and reported at the end.
// ---------------------------------------------------------------------------

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const tagFilter = args.find((a) => !a.startsWith("--")); // e.g. "hero" | "person" | "brand"

// --- the full manifest ---------------------------------------------------
// out: path under /public · w/h: pixel size · seed: keeps results stable
//
// NOTE: the original campaign heroes (eco-sneakers, cold-brew, ai-fitness,
// default) are 9:16 assets used by the campaign studio — they are intentionally
// NOT in this manifest so this script never regenerates or overwrites them.
const MANIFEST = [
  // ---------- New landing hero scenarios only ----------
  {
    tag: "hero",
    out: "heroes/skincare.webp",
    w: 1280, h: 800, seed: 14,
    prompt:
      "Premium product photograph of a minimalist vitamin-C skincare serum bottle with a frosted glass dropper, warm amber and cream tones, soft spa-like studio lighting, dewy fresh aesthetic, clean background, commercial advertising photography, 8k, generous negative space",
  },
  {
    tag: "hero",
    out: "heroes/headphones.webp",
    w: 1280, h: 800, seed: 15,
    prompt:
      "Premium product photograph of sleek noise-cancelling over-ear headphones, matte dark finish with subtle blue accent lighting, floating on a deep slate-to-black gradient, minimalist focused studio composition, commercial advertising photography, 8k, generous negative space",
  },

  // ---------- 9:16 campaign heroes (new campaign ideas) ----------
  {
    tag: "campaign",
    out: "campaigns/smart-water-bottle.webp",
    w: 768, h: 1344, seed: 201,
    prompt:
      "Vertical 9:16 social ad of a sleek smart water bottle with a glowing hydration-tracking ring, condensation droplets, fresh aqua and white tones, bright airy studio, premium wellness product photography, 8k, clean space at top and bottom for text",
  },
  {
    tag: "campaign",
    out: "campaigns/artisan-chocolate.webp",
    w: 768, h: 1344, seed: 202,
    prompt:
      "Vertical 9:16 social ad of luxury artisan dark chocolate bars with gold foil packaging, rich cocoa and caramel tones, dramatic warm lighting, scattered cocoa nibs, indulgent premium food photography, 8k, calm space top and bottom for text",
  },
  {
    tag: "campaign",
    out: "campaigns/plant-subscription.webp",
    w: 768, h: 1344, seed: 203,
    prompt:
      "Vertical 9:16 social ad of a lush potted monstera houseplant in a minimalist ceramic pot, soft morning light, fresh green and terracotta tones, bright Scandinavian interior, cozy lifestyle product photography, 8k, negative space top and bottom",
  },
  {
    tag: "campaign",
    out: "campaigns/electric-bike.webp",
    w: 768, h: 1344, seed: 204,
    prompt:
      "Vertical 9:16 social ad of a modern matte-charcoal electric city bike, dynamic urban dusk backdrop with neon bokeh, sleek minimalist design, cyan accent lighting, premium mobility product photography, 8k, clean space top and bottom for text",
  },
  {
    tag: "campaign",
    out: "campaigns/luxury-watch.webp",
    w: 768, h: 1344, seed: 205,
    prompt:
      "Vertical 9:16 social ad of an elegant minimalist automatic wristwatch with a sapphire dial, dramatic spotlight on dark marble, deep blue and silver tones, ultra-premium luxury product photography, 8k, calm dark space top and bottom",
  },
  {
    tag: "campaign",
    out: "campaigns/gourmet-burger.webp",
    w: 768, h: 1344, seed: 206,
    prompt:
      "Vertical 9:16 social ad of a gourmet smash burger with melting cheese and fresh toppings, steam rising, warm appetizing lighting, dark rustic backdrop, mouth-watering food photography, 8k, space top and bottom for text",
  },

  // ---------- Testimonial headshots ----------
  {
    tag: "person",
    out: "people/maya.jpg",
    w: 512, h: 512, seed: 31,
    prompt:
      "Professional headshot of a confident East Asian woman in her early 30s, sustainable fashion founder, soft natural studio lighting, neutral blurred background, friendly approachable expression, photorealistic, sharp focus",
  },
  {
    tag: "person",
    out: "people/daniel.jpg",
    w: 512, h: 512, seed: 32,
    prompt:
      "Professional headshot of a friendly white man in his early 30s, startup growth marketer, warm studio lighting, neutral blurred background, subtle smile, photorealistic, sharp focus",
  },
  {
    tag: "person",
    out: "people/aisha.jpg",
    w: 512, h: 512, seed: 33,
    prompt:
      "Professional headshot of a confident South Asian woman in her late 30s, chief marketing officer, elegant, soft studio lighting, neutral blurred background, photorealistic, sharp focus",
  },
];

function pollinationsUrl(prompt, w, h, seed) {
  const enc = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${enc}?model=flux&width=${w}&height=${h}&seed=${seed}&nologo=true`;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function generate(item) {
  const outPath = join(PUBLIC, item.out);
  if (!FORCE && (await exists(outPath))) {
    console.log(`• skip (exists)  ${item.out}`);
    return { ok: true, skipped: true };
  }
  await mkdir(dirname(outPath), { recursive: true });
  const url = pollinationsUrl(item.prompt, item.w, item.h, item.seed);
  process.stdout.write(`… generating     ${item.out} `);
  try {
    const res = await fetch(url, { headers: { Accept: "image/*" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) throw new Error("suspiciously small response");
    await writeFile(outPath, buf);
    console.log(`✓ (${Math.round(buf.length / 1024)} KB)`);
    return { ok: true };
  } catch (err) {
    console.log(`✗ ${err.message}`);
    return { ok: false, item, err: err.message };
  }
}

async function main() {
  let items = MANIFEST;
  if (tagFilter) items = items.filter((i) => i.tag === tagFilter);

  console.log(
    `\nAIgnis image generator — ${items.length} image(s)` +
      (FORCE ? " (force)" : " (missing only)") +
      (tagFilter ? ` · tag="${tagFilter}"` : "") +
      "\n"
  );

  const failures = [];
  // sequential with a tiny gap so we don't hammer the free endpoint
  for (const item of items) {
    const r = await generate(item);
    if (!r.ok) failures.push(r);
    await new Promise((res) => setTimeout(res, 800));
  }

  console.log("\nDone.");
  if (failures.length) {
    console.log(`\n${failures.length} failed — rerun to retry:`);
    failures.forEach((f) => console.log(`  - ${f.item.out} (${f.err})`));
    process.exitCode = 1;
  }
}

main();
