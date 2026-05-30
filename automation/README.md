# AIgnis — n8n Workflow Automation

These are real, importable [n8n](https://n8n.io) workflows that wire AIgnis's
data + agent layer into an automation platform. They cover the scheduled
ingestion and webhook automation referenced in the architecture.

## Import
1. Open n8n (self-hosted or cloud) → **Workflows → Import from File**.
2. Import each `*.json` in this folder.
3. Set the `AIGNIS_API` environment variable (or edit the HTTP nodes) to point
   at the backend, e.g. `http://localhost:8787`.
4. Activate the workflows.

## Workflows

### 1. `competitor-ingest.workflow.json` — Scheduled market ingestion
- **Trigger:** Schedule (every 6 hours).
- **Flow:** Schedule → HTTP scrape competitor sources → Function (normalize) →
  HTTP POST to `/inventory`-style ingest → log.
- **Why:** keeps the RAG market data fresh without manual runs.

### 2. `campaign-publish.workflow.json` — Publish webhook
- **Trigger:** Webhook (`POST /webhook/aignis-publish`).
- **Flow:** Webhook → validate payload → HTTP POST `/publish` → respond.
- **Why:** lets external tools (or the app) publish a campaign via a single
  webhook call; n8n handles retries + fan-out to channels.

### 3. `pulse-optimize.workflow.json` — Post-launch optimization loop
- **Trigger:** Schedule (every 2 hours) OR webhook.
- **Flow:** Schedule → HTTP GET pulse for active campaigns → IF performance
  below threshold → HTTP POST `/pulse/:id/optimize` → notify.
- **Why:** automates the self-optimization loop on a cadence.

> These are templates with the AIgnis API as the integration target. They run
> against the backend in `../server`. Endpoints used: `/publish`,
> `/pulse/:campaignId`, `/pulse/:campaignId/optimize`, `/inventory`.
