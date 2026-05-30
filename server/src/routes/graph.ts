import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getGraph, neighbors, traverse, applicableRules } from "../services/graph.js";

/**
 * GraphRAG endpoints over the brand knowledge graph.
 * Tools: in-memory typed property graph (Neo4j-style query shape).
 */
export async function graphRoutes(app: FastifyInstance) {
  // full graph (nodes + edges) for rendering
  app.get("/graph", async () => {
    const g = getGraph();
    return { ...g, stats: { nodes: g.nodes.length, edges: g.edges.length } };
  });

  // direct relationships of a node
  app.get("/graph/node/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = neighbors(id);
    if (!result) return reply.code(404).send({ error: "node_not_found" });
    return result;
  });

  // breadth-first traversal (var-length path)
  app.get("/graph/traverse/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const depth = Number((req.query as { depth?: string }).depth ?? 2);
    const result = traverse(id, Math.min(Math.max(depth, 1), 5));
    if (!result) return reply.code(404).send({ error: "node_not_found" });
    return result;
  });

  // brand-rule gate check for a candidate creative
  const ruleBody = z.object({ text: z.string().min(1) });
  app.post("/graph/rule-check", async (req, reply) => {
    const parsed = ruleBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    return { rules: applicableRules(parsed.data.text) };
  });
}
