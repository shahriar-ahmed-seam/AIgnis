// Synthetic event generators for the Live Data Streams console. Each source
// emits plausible records on an interval to simulate real-time ingestion
// (CDC mutations, web scraping, review streams, social signals).

export type StreamSource = "cdc" | "scraper" | "reviews" | "social";

export interface StreamEvent {
  id: string;
  source: StreamSource;
  ts: number;
  message: string;
  meta?: string;
}

export const SOURCE_META: Record<
  StreamSource,
  { label: string; color: string; glyph: string; tech: string }
> = {
  cdc: { label: "CDC · Postgres WAL", color: "#22d3ee", glyph: "⟲", tech: "Debezium-style change capture" },
  scraper: { label: "Web Scraper", color: "#fb923c", glyph: "◇", tech: "Headless Playwright" },
  reviews: { label: "Review Stream", color: "#a3e635", glyph: "✦", tech: "Embedded → pgvector" },
  social: { label: "Social Signals", color: "#f472b6", glyph: "≋", tech: "Trend API pull" },
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
const uid = () => `ev-${seq++}`;
const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

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
      return {
        id: uid(),
        source,
        ts,
        message: `scraped ${comp} storefront → new price $${price}`,
        meta: "200 OK · 1 page",
      };
    }
    case "reviews": {
      return {
        id: uid(),
        source,
        ts,
        message: `"${rand(REVIEW_FRAGMENTS)}"`,
        meta: "embedded → 1536-d vector",
      };
    }
    case "social": {
      const t = rand(TRENDS);
      const lift = (Math.random() * 200 + 20).toFixed(0);
      return {
        id: uid(),
        source,
        ts,
        message: `${t} velocity +${lift}% (last 1h)`,
        meta: "trend signal",
      };
    }
  }
}

export const ALL_SOURCES: StreamSource[] = ["cdc", "scraper", "reviews", "social"];
