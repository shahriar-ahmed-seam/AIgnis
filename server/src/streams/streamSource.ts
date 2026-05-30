// Live data-stream event generators. Simulates real-time ingestion sources:
//   - CDC      : Postgres WAL-style change events (Debezium-style shape)
//   - scraper  : headless competitor storefront scrapes
//   - reviews  : customer reviews embedded into a vector store
//   - social   : trend-velocity signals
//
// Tools: in-process generators pushed over real server SSE (so it's a genuine
// server→client stream, unlike the frontend's local timers).

export type StreamSource = "cdc" | "scraper" | "reviews" | "social";

export interface StreamEvent {
  id: string;
  source: StreamSource;
  ts: number;
  message: string;
  meta?: string;
}

export const SOURCE_INFO: Record<StreamSource, { label: string; tech: string; cadenceMs: number }> = {
  cdc: { label: "CDC · Postgres WAL", tech: "Debezium-style change capture", cadenceMs: 1100 },
  scraper: { label: "Web Scraper", tech: "Headless Playwright", cadenceMs: 2600 },
  reviews: { label: "Review Stream", tech: "Embedded → pgvector", cadenceMs: 1700 },
  social: { label: "Social Signals", tech: "Trend API pull", cadenceMs: 3200 },
};

const SKUS = ["TERRA-RUN-01", "TERRA-RUN-02", "TERRA-TRL-01", "NOCT-NITRO-12", "PULSE-PRO"];
const COMPETITORS = ["Allbirds", "Veja", "On Running", "Hoka", "Athletic Brewing"];
const REVIEW_FRAGMENTS = [
  "finally a recycled shoe that performs",
  "love it but wish it came in more colors",
  "the nitro pour is hypnotic",
  "adaptive plan actually kept me consistent",
  "is this greenwashing or legit?",
  "checkout was a little slow on mobile",
];
const TRENDS = ["#ecoperformance", "#coldbrewseason", "#recoverytraining", "#oceanplastic", "#nitrocoffee"];

let seq = 0;
const uid = () => `ev-${Date.now()}-${seq++}`;
const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function makeEvent(source: StreamSource): StreamEvent {
  const ts = Date.now();
  switch (source) {
    case "cdc": {
      const sku = rand(SKUS);
      const delta = Math.floor(Math.random() * 40) - 10;
      return {
        id: uid(),
        source,
        ts,
        message: `UPDATE inventory SET stock = stock ${delta >= 0 ? "+" : "-"} ${Math.abs(delta)} WHERE sku = '${sku}'`,
        meta: "txn committed",
      };
    }
    case "scraper": {
      const comp = rand(COMPETITORS);
      const price = (Math.random() * 60 + 80).toFixed(0);
      return { id: uid(), source, ts, message: `scraped ${comp} storefront → new price $${price}`, meta: "200 OK · 1 page" };
    }
    case "reviews":
      return { id: uid(), source, ts, message: `"${rand(REVIEW_FRAGMENTS)}"`, meta: "embedded → 1536-d vector" };
    case "social": {
      const lift = (Math.random() * 200 + 20).toFixed(0);
      return { id: uid(), source, ts, message: `${rand(TRENDS)} velocity +${lift}% (last 1h)`, meta: "trend signal" };
    }
  }
}

export const ALL_SOURCES: StreamSource[] = ["cdc", "scraper", "reviews", "social"];
