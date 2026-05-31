// Vercel serverless function — real LLM copy generation for the deployed site.
//
// The localhost backend (with the Groq key) isn't reachable from Vercel, so
// this same-origin function lets judges get genuine Groq/Llama-written copy
// for any idea they type or speak. Image + reel stay on the curated default.
//
// Env vars (set in the Vercel dashboard → Project → Settings → Environment):
//   GROQ_API_KEY   (required)  your Groq key
//   GROQ_MODEL     (optional)  defaults to llama-3.1-8b-instant
//
// Returns: { ok: true, copy: {headline, body, cta}, model } on success,
//          { ok: false, reason } otherwise (frontend falls back to curated).

const SYSTEM_PROMPT = `You are the Copywriter agent in AIgnis, an autonomous marketing engine.
Write punchy, on-brand marketing copy for the given product idea.
Use the provided inventory context to stay grounded (mention scarcity if stock is low, etc.).
Respond ONLY with strict JSON: {"headline": string (max 6 words), "body": string (max 32 words), "cta": string (max 4 words)}.
No markdown, no commentary.`;

function buildUserPrompt(idea, inventory) {
  const inv = Array.isArray(inventory)
    ? inventory
        .map((i) => `- ${i.name} (${i.sku}): ${i.stock} in stock [${i.status}]`)
        .join("\n")
    : "";
  return `Product idea: "${idea}"\n\nLive inventory context:\n${inv || "(none)"}\n\nReturn the JSON now.`;
}

function parseCopy(text) {
  const match = text.match(/\{[\s\S]*\}/);
  const raw = match ? match[0] : text;
  const obj = JSON.parse(raw);
  const clean = (s, fallback) =>
    typeof s === "string" && s.trim() ? s.trim() : fallback;
  return {
    headline: clean(obj.headline, "Built For What's Next."),
    body: clean(obj.body, "An on-brand campaign, generated in one pass."),
    cta: clean(obj.cta, "Learn More"),
  };
}

export default async function handler(req, res) {
  // CORS (same-origin in practice, but harmless and helps local testing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, reason: "method" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(200).json({ ok: false, reason: "no_key" });

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    // body may already be parsed by Vercel; handle both cases
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const idea = (body.idea || "").toString().slice(0, 400);
    if (!idea.trim()) return res.status(400).json({ ok: false, reason: "no_idea" });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(idea, body.inventory) },
        ],
      }),
    }).finally(() => clearTimeout(timer));

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(200).json({ ok: false, reason: `groq_${r.status}`, detail: detail.slice(0, 200) });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const copy = parseCopy(content);
    return res.status(200).json({ ok: true, copy, model });
  } catch (err) {
    return res.status(200).json({ ok: false, reason: "exception", detail: String(err).slice(0, 200) });
  }
}
