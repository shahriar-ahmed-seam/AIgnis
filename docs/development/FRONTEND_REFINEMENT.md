# Frontend Refinement — Page by Page

We refine one **page** at a time, including the components that appear on it.
For each: review what exists → Kiro proposes improvements → user suggests edits
→ build. Then move to the next page.

Status: ⬜ todo · 🔄 in progress · ✅ done

---

## Global shell (wraps every page)
- AppShell (header) · Sidebar · Backdrop · BrandMark/Wordmark · PillarBar ·
  ModeIndicator · PillarDrawer · SoundToggle
- We'll refine these alongside the first page they matter on, or at the end.

---

## PAGE 0a — Welcome / Marketing landing (PUBLIC)  ✅ built (refine later)
First screen any visitor sees. No sidebar/header. CTAs → auth.
Components on this page:
- `WelcomeView` (hero, capability cards, how-it-works, CTAs)

## PAGE 0b — Auth (login / register) (PUBLIC)  ✅ built (refine later)
Components on this page:
- `AuthView` (login + register toggle, fields, social buttons, prototype note)
- `authStore` (mock auth, persists to localStorage; real auth + Neon noted for later)
- `UserMenu` (header chip + logout, shown once authenticated)
- `screenStore` (welcome ↔ auth routing before login)

## PAGE 1 — Campaign Studio start (in-app, after login)  ⬜
Components on this page:
- `LandingView` (hero, headline, idea input, voice mic, preset chips, footer stats)
- uses: Backdrop, AppShell header, BrandMark

## PAGE 2 — Agent Activity (the swarm)  ⬜
Components on this page:
- `AgentActivityView` (layout, idea bar, speed control, progress rail)
- `AgentGraph` (5-node pentagon)
- `LogStream` (streaming console)
- `IntelRail` (RAG signals + MCP inventory)

## PAGE 3 — Creative (the ad reveal)  ⬜
Components on this page:
- `CreativeView` (ad layout, typed copy, palette, CTA, launch toast)
- `HeroImage` (blur-to-resolve loader)
- `AnalyticsDashboard` (charts)

## PAGE 4 — Video Studio  ⬜
Components on this page:
- `VideoView` (format tabs, voiceover, publish panel)
- `VideoReel` (animated reel preview)
- `ChannelIcon`

## PAGE 5 — Campaign Pulse  ⬜
Components on this page:
- `PulseView` (AI narrative, channel cards, optimize loop)
- `Sparkline`, `CountUp`, `ChannelIcon`, `AnalyticsDashboard`

## PAGE 6 — Knowledge Graph (GraphRAG)  ⬜
Components on this page:
- `GraphView` (node graph canvas, inspector, legend, stats)
- `SectionHeader`

## PAGE 7 — Live Data Streams  ⬜
Components on this page:
- `StreamsView` (source cards, unified feed, pause control)

## PAGE 8 — LLMOps  ⬜
Components on this page:
- `ObservabilityView` (KPIs, latency chart, semantic router, model fleet)

## PAGE 9 — Brand Workspace  ⬜
Components on this page:
- `WorkspaceView` (brand profile, learnings, campaign history)

## PAGE 10 — Published  ⬜
Components on this page:
- `PublishedView` (post gallery cards, outbound links, empty state)

## PAGE 11 — Plans & Billing  ⬜
Components on this page:
- `PricingView` (plan cards, performance model, usage meters)

---

## Decisions log
(Agreed changes recorded per page as we go.)

### PAGE 1 — Landing (in progress)
