import type { FastifyInstance } from "fastify";
import { ALL_SOURCES, makeEvent, SOURCE_INFO } from "../streams/streamSource.js";

/**
 * Live Data Streams endpoints.
 *   GET /streams/info    — source metadata + cadences
 *   GET /streams/live    — real server-pushed SSE feed of ingestion events
 * Tools: in-process generators + server SSE (text/event-stream).
 */
export async function streamRoutes(app: FastifyInstance) {
  app.get("/streams/info", async () => ({
    sources: ALL_SOURCES.map((s) => ({ id: s, ...SOURCE_INFO[s] })),
  }));

  app.get("/streams/live", async (req, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const counts: Record<string, number> = { cdc: 0, scraper: 0, reviews: 0, social: 0 };

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    send("hello", { sources: ALL_SOURCES.map((s) => ({ id: s, ...SOURCE_INFO[s] })) });

    // one interval per source, each at its own cadence
    const timers = ALL_SOURCES.map((src) =>
      setInterval(() => {
        const evt = makeEvent(src);
        counts[src] += 1;
        send("event", { ...evt, count: counts[src] });
      }, SOURCE_INFO[src].cadenceMs)
    );

    const heartbeat = setInterval(() => reply.raw.write(": ping\n\n"), 15000);

    req.raw.on("close", () => {
      timers.forEach(clearInterval);
      clearInterval(heartbeat);
    });
  });
}
