# AIgnis — MCP (Model Context Protocol) Usage · detailed sub-form

This is the expanded MCP section. Fill it field-by-field below. All of this is
real — we built and verified the server.

> ✅ Top checkbox: "We built and/or used MCP servers / clients in this build" — TICK IT.

---

## ▸ MCP Servers we BUILT  (+3 each · reuse bonus +2)

Click **+ Add server we built** and fill one card:

**Server name**
```
aignis-inventory
```

**# endpoints / tools**
```
4 (1 resource + 3 tools)
```

**Transport (stdio, HTTP…)**
```
stdio
```

**Language / SDK (TS, Python…)**
```
TypeScript · @modelcontextprotocol/sdk
```

**Repo / deploy URL (optional)**
```
https://github.com/shahriar-ahmed-seam/AIgnis  (server/src/mcp/inventoryServer.ts)
```

**Purpose — what does this server expose and why did you build it?**
```
It securely exposes a brand's local product inventory — stock levels, pricing, margins, materials — to our AI agents through the Model Context Protocol, so the data never has to be pushed into a public cloud. We built it so the Analyst agent can ground its decisions in real business data (e.g. flag low stock, surface margin-aware positioning) during every campaign run. It reads a local inventory.json (swappable for SQLite/Postgres) and is the privacy boundary for sensitive business data in our architecture.
```

**List the tools / endpoints**
```
Resource: inventory://all — the full inventory document (JSON).
Tool: query_inventory — search inventory by free-text query, category, or stock status.
Tool: get_stock — stock level, status, price, and margin for a specific SKU.
Tool: low_stock — list all items that are low or on backorder (restock alert).
```

**☐ Reused across multiple projects / clients**
```
Tick this box. (It's reusable — any MCP-compatible client can connect via stdio:
we verified it with a custom MCP client, and it also drops into Claude Desktop
through a standard mcpServers config entry.)
```

---

## ▸ MCP Servers we USED  (+1 each)

We primarily built and consumed our OWN server. Add it here as a "used" entry
too (it's legitimately both built and used at runtime):

**Server name**
```
aignis-inventory (self-hosted)
```

**Source / vendor (Anthropic, official, OSS…)**
```
Own (built on the official @modelcontextprotocol/sdk)
```

**# endpoints actually called**
```
3 tools called at runtime (query_inventory, get_stock, low_stock)
```

**Capabilities exposed (tools / resources / prompts you consumed)**
```
Consumed the inventory resource and the query_inventory / get_stock / low_stock tools to fetch live stock, pricing, and margin context.
```

**How did you use it? Which agent / IDE / client called it and for what?**
```
The Analyst agent (and our standalone MCP test client) call it during the pipeline run to pull live inventory context, which is injected into the Copywriter's prompt so generated copy is grounded in real stock and can use scarcity/margin signals. We also validated it from a custom MCP client over stdio.
```

> Optional: if you actually connected any third-party MCP server during the
> build (e.g. a Filesystem or GitHub MCP in your IDE), add it as a second
> "used" card — but only if true.

---

## ▸ MCP Clients / Hosts
```
Custom MCP client (our own test client, @modelcontextprotocol/sdk) · Claude Desktop-compatible (standard mcpServers config) · AIgnis Analyst agent
```

## ▸ Transports used
Tick: ✅ stdio
(Leave Streamable HTTP / SSE / WebSocket unticked unless you actually expose those.)

## ▸ Reuse, architecture & integration notes
```
A single MCP server (aignis-inventory) acts as the secure data-access boundary between the agent swarm and sensitive business data. It's composed into the pipeline through an InventoryProvider interface, so the agents call it the same way whether it's the live MCP server or a mock fallback — and the same server can be reused by any MCP client (our agent, our test client, or Claude Desktop) with no code change. The architecture also anticipates AIgnis exposing its own outward-facing MCP server so external tools can call our synthesis engine. Calls are wrapped by a Fallback Controller with a 10s timeout, so an unavailable MCP server degrades gracefully to mock context instead of breaking a run. No auth on the local stdio transport (process-scoped); a hosted HTTP deployment would add token auth + allowlisting.
```

## ▸ Anything else about MCP in this build?
```
MCP is the centerpiece of our "grounded, private-by-design" story: rather than dumping a brand's inventory into a prompt or a cloud DB, the agents query it through a typed protocol with explicit tools. Design decisions: stdio transport for zero-config local privacy; a thin InventoryProvider abstraction so MCP is swappable/fallback-safe; tools shaped around real marketing needs (low-stock alerts, margin-aware lookups) rather than raw table dumps. Next: an HTTP transport with auth for multi-tenant cloud use, plus additional MCP servers for brand-guidelines and campaign-history access.
```

---

## Quick fill order (so you don't miss points)
1. ✅ tick "We built and/or used MCP servers / clients in this build"
2. **+ Add server we built** → fill the BUILT card above → ✅ tick "Reused across multiple projects / clients"
3. **+ Add server we used** → fill the USED card above
4. MCP Clients/Hosts → paste
5. Transports → ✅ stdio
6. Reuse notes + Anything-else → paste
