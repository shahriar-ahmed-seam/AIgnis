import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// Dev-only middleware: serve POST /api/generate locally (same contract as the
// Vercel serverless function in /api/generate.js) so real Groq copy works
// during `npm run dev`. On Vercel the real function handles this route; this
// plugin is a no-op in the production build.
//
// The Groq key is resolved (in order) from:
//   process.env.GROQ_API_KEY → root .env.local → server/.env
// so local dev "just works" using the key you already have in server/.env.
// ---------------------------------------------------------------------------
function devApiPlugin(): Plugin {
  function readEnvFile(path: string): Record<string, string> {
    const out: Record<string, string> = {};
    if (!existsSync(path)) return out;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
    return out;
  }

  function resolveGroq(): { key: string; model: string } {
    const root = process.cwd();
    const local = readEnvFile(resolve(root, ".env.local"));
    const server = readEnvFile(resolve(root, "server", ".env"));
    const key = process.env.GROQ_API_KEY || local.GROQ_API_KEY || server.GROQ_API_KEY || "";
    const model =
      process.env.GROQ_MODEL || local.GROQ_MODEL || server.GROQ_MODEL || "llama-3.1-8b-instant";
    return { key, model };
  }

  const SYSTEM_PROMPT = `You are the Copywriter agent in AIgnis, an autonomous marketing engine.
Write punchy, on-brand marketing copy for the given product idea.
Use the provided inventory context to stay grounded (mention scarcity if stock is low, etc.).
Respond ONLY with strict JSON: {"headline": string (max 6 words), "body": string (max 32 words), "cta": string (max 4 words)}.
No markdown, no commentary.`;

  return {
    name: "dev-api-generate",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/generate", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, reason: "method" }));
          return;
        }
        const { key, model } = resolveGroq();
        const send = (code: number, obj: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(obj));
        };
        if (!key) return send(200, { ok: false, reason: "no_key" });

        try {
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
          const idea = (body.idea || "").toString().slice(0, 400);
          if (!idea.trim()) return send(400, { ok: false, reason: "no_idea" });

          const inv = Array.isArray(body.inventory)
            ? body.inventory
                .map((i: { name: string; sku: string; stock: number; status: string }) =>
                  `- ${i.name} (${i.sku}): ${i.stock} in stock [${i.status}]`
                )
                .join("\n")
            : "";
          const userPrompt = `Product idea: "${idea}"\n\nLive inventory context:\n${inv || "(none)"}\n\nReturn the JSON now.`;

          const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({
              model,
              temperature: 0.8,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
            }),
          });
          if (!r.ok) return send(200, { ok: false, reason: `groq_${r.status}` });
          const data = await r.json();
          const content = data?.choices?.[0]?.message?.content ?? "";
          const m = content.match(/\{[\s\S]*\}/);
          const obj = JSON.parse(m ? m[0] : content);
          const clean = (s: unknown, fb: string) =>
            typeof s === "string" && s.trim() ? s.trim() : fb;
          return send(200, {
            ok: true,
            model,
            copy: {
              headline: clean(obj.headline, "Built For What's Next."),
              body: clean(obj.body, "An on-brand campaign, generated in one pass."),
              cta: clean(obj.cta, "Learn More"),
            },
          });
        } catch (err) {
          return send(200, { ok: false, reason: "exception", detail: String(err).slice(0, 200) });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
