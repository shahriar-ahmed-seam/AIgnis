# Database — decision note (for backend wiring, NOT yet implemented)

Target users are online, so we need a real hosted database. Current persistence
uses a dependency-free `JsonStore` (Node `fs`) which is fine for the demo but
must be swapped for a hosted DB before multi-user use.

## Recommendation: Neon (serverless Postgres)

**Why Neon:**
- Serverless Postgres with a generous free tier — ideal for hackathon + online users.
- Scales to zero (no idle cost), instant provisioning, branching for dev/preview.
- Standard Postgres, so it pairs naturally with **pgvector** for the RAG pillar
  (store review/market embeddings in the same DB — no separate vector service).
- Works over HTTP/serverless drivers, so it fits Fastify and edge deploys.
- Matches the spec (design.md): "Relational (Postgres) + Vector DB (pgvector)".

**Alternatives considered:**
- Supabase — also Postgres + pgvector + auth + realtime; heavier, more batteries.
  Good fallback if we want built-in auth + realtime out of the box.
- PlanetScale (MySQL) — great scaling but no native pgvector; weaker RAG story.
- Turso/SQLite — cheapest, but less natural for concurrent online users.

**Pick:** Neon for the relational + vector store; consider Supabase only if we
decide we want its bundled auth + realtime.

## What to migrate when we wire it
Replace each `JsonStore` collection with a Postgres table (via Neon):

| Current JsonStore (`.data/*.json`) | Future table | Notes |
| --- | --- | --- |
| `workspace` | `brands`, `learnings`, `campaign_history` | per-user brand memory |
| `published` | `published_posts` | gallery; index by `campaign_id`, `channel` |
| `pulse` | `campaign_pulse`, `channel_metrics` | post-launch performance |
| `telemetry` | `llm_calls`, `route_decisions` | observability; consider time-series |
| (new) | `users`, `sessions` | auth — needed for multi-user online |
| (new) | `embeddings` (pgvector) | RAG over reviews/market — the real RAG pillar |

## Suggested stack for wiring
- **Driver:** `@neondatabase/serverless` (HTTP) or `postgres`/`pg` for Node.
- **Query/ORM:** Drizzle ORM (lightweight, TS-first, great with Neon) or Prisma.
- **Vectors:** `pgvector` extension on Neon for embeddings + similarity search.
- **Migrations:** Drizzle Kit (or Prisma Migrate).
- **Env:** add `DATABASE_URL=postgres://…neon…` to `.env`.
- Keep `JsonStore` as an interface so we can swap the implementation without
  touching route code (repository pattern).

> Action item: when we start backend wiring, introduce a `Repository` interface
> with two implementations — `JsonRepo` (current) and `NeonRepo` (target) — and
> flip via env. No route changes required.
