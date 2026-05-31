import type { MockDataset } from "../types";
import { buildScript } from "./scriptBuilder";
import { buildPulse } from "./pulseBuilder";
import { artisanChocolate, glowSkincare, signatureFragrance } from "./datasets.extra";

// ---------------------------------------------------------------------------
// MOCK DATA LAYER
// Curated synthetic datasets that drive a complete pipeline run with zero
// network access. Each preset has its own agent script, copy, hero image
// reference (CSS gradient fallback until you drop a real render in /public),
// and analytics bundle.
//
// To use real generated images: place files in /public/heroes/<name>.png and
// the <src> below will pick them up automatically. Until then the
// fallbackGradient renders a polished placeholder. See ASSET_PROMPTS.md.
// ---------------------------------------------------------------------------

const sneakers: MockDataset = {
  presetId: "eco-sneakers",
  exampleLabel: "Eco-friendly sneakers",
  matchKeywords: ["shoe", "sneaker", "eco", "sustainable", "footwear"],
  tagline: "Sustainable footwear brand launch",
  intel: {
    signals: [
      { label: "Ocean-plastic materials", detail: "search interest surging across DTC footwear", trend: "+210%" },
      { label: "'Performance + eco'", detail: "unmet need — buyers refuse to trade speed for green", trend: "+88%" },
      { label: "Resale / circularity", detail: "Gen Z expects take-back programs", trend: "+47%" },
    ],
    reviews: [
      { source: "r/RunningShoes", text: "I want sustainable but they always feel like cardboard.", sentiment: "negative" },
      { source: "Trustpilot", text: "Finally a recycled shoe that actually performs on long runs.", sentiment: "positive" },
      { source: "Instagram", text: "Obsessed with the look but is it actually eco or greenwashing?", sentiment: "neutral" },
    ],
    inventory: [
      { sku: "TERRA-RUN-01", name: "Terra Runner — Reef", stock: 1840, status: "ready" },
      { sku: "TERRA-RUN-02", name: "Terra Runner — Slate", stock: 320, status: "low" },
      { sku: "TERRA-TRL-01", name: "Terra Trail — Moss", stock: 0, status: "backorder" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "Run Lighter. Leave Nothing Behind.",
    narrativeBase: [
      "Launch is live across 3 channels. TikTok is outperforming Instagram ~3:1 on the eco-performance hook.",
      "Under-25 viewers are the strongest responders; comments cluster around 'finally performance + sustainable'.",
      "Web landing CTR is healthy but bounce is high — the hero loads slower than the social creatives.",
    ],
    narrativeOptimized: [
      "Reallocated 40% of spend to TikTok and rewrote the Instagram hook to lead with performance.",
      "Engagement up across the board; the rewritten headline lifted Instagram CTR by ~70%.",
      "Web conversions climbed after surfacing the recycled-materials proof point above the fold.",
    ],
    optimizationActions: [
      "Shifted 40% budget Instagram → TikTok",
      "Rewrote Instagram headline (performance-first)",
      "Promoted 'ocean-plastic' proof point on web",
    ],
    channels: [
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@terra.run",
        lift: 0.35,
        base: { impressions: 412000, engagementRate: 7.2, ctr: 3.1, conversions: 1840 },
        spark: [20, 35, 48, 70, 88, 120, 160],
        comments: [
          { handle: "@maya.runs", text: "ok the ocean plastic thing is actually genius", sentiment: "positive" },
          { handle: "@sneakerhead_99", text: "but do they last though?? need durability proof", sentiment: "neutral" },
          { handle: "@ecoluke", text: "bought instantly. this is the future of footwear", sentiment: "positive" },
        ],
      },
      {
        id: "instagram",
        name: "Instagram",
        handle: "@terra.official",
        lift: 0.5,
        base: { impressions: 268000, engagementRate: 3.4, ctr: 1.6, conversions: 720 },
        spark: [30, 32, 34, 33, 36, 38, 40],
        comments: [
          { handle: "@cityrunner", text: "love the look but the caption didn't grab me", sentiment: "neutral" },
          { handle: "@green.steps", text: "the pastel studio shots are gorgeous 😍", sentiment: "positive" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "terra.run",
        lift: 0.28,
        base: { impressions: 156000, engagementRate: 2.1, ctr: 2.4, conversions: 540 },
        spark: [40, 44, 46, 45, 48, 52, 55],
        comments: [
          { handle: "analytics", text: "High intent traffic; bounce rate 58% on mobile.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Run Lighter. Tread Kinder.",
    body: "Meet TERRA — performance sneakers spun from ocean-bound plastic and plant foam. Zero compromise on speed, zero footprint left behind.",
    cta: "Claim Your First Pair",
  },
  heroImage: {
    src: "/heroes/eco-sneakers.webp",
    alt: "Floating eco-friendly sneaker on a misty pastel studio backdrop",
    fallbackGradient:
      "radial-gradient(120% 120% at 30% 20%, #134e4a 0%, #0f766e 30%, #052e2b 70%), linear-gradient(135deg, #22d3ee33, #a3e63522)",
  },
  reelVideo: "/reels/Black Shoes.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "4.8%", delta: "+1.9pp", positive: true },
      { label: "Brand Fit", value: "92", delta: "+12", positive: true },
      { label: "Est. CAC", value: "$11.40", delta: "-23%", positive: true },
      { label: "Reach", value: "1.2M", delta: "+340K", positive: true },
    ],
    market: {
      id: "market",
      title: "Market Trend Index",
      xLabel: "Week",
      yLabel: "Interest",
      accent: "#22d3ee",
      points: [
        { x: "W1", y: 32 },
        { x: "W2", y: 41 },
        { x: "W3", y: 47 },
        { x: "W4", y: 58 },
        { x: "W5", y: 71 },
        { x: "W6", y: 86 },
      ],
    },
    audience: {
      id: "audience",
      title: "Audience Resonance",
      xLabel: "Segment",
      yLabel: "Score",
      accent: "#a78bfa",
      points: [
        { x: "Gen Z", y: 88 },
        { x: "Millennial", y: 76 },
        { x: "Eco", y: 94 },
        { x: "Athlete", y: 69 },
        { x: "Urban", y: 81 },
      ],
    },
    predictedPerformance: {
      id: "perf",
      title: "Predicted Campaign Lift",
      xLabel: "Day",
      yLabel: "Conversions",
      accent: "#a3e635",
      points: [
        { x: "D1", y: 120 },
        { x: "D3", y: 210 },
        { x: "D5", y: 360 },
        { x: "D7", y: 540 },
        { x: "D9", y: 720 },
        { x: "D11", y: 910 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher",
      pillar: "RAG",
      logs: [
        "retrieving 2,481 market signals across sustainable footwear…",
        "RAG match: 'ocean plastic' trending +210% QoQ",
        "top consumer pain point → 'eco but still want performance'",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst",
      pillar: "MCP",
      logs: [
        "MCP query → local inventory: 14 SKUs, 3 ready to ship",
        "segmenting audience: Gen Z + urban athletes score highest",
        "sentiment vector locked: aspirational / guilt-free",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter",
      pillar: "LLM",
      logs: [
        "drafting 6 headline candidates…",
        "selected: 'Run Lighter. Tread Kinder.' (resonance 0.94)",
        "CTA tuned for conversion intent",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director",
      pillar: "Diffusion",
      logs: [
        "composing art direction brief: misty pastel studio, hero float",
        "diffusion prompt assembled → 1024×1024, brand palette locked",
        "rendering hero frame…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations",
      pillar: "Agentic",
      logs: [
        "assembling multimodal asset bundle",
        "QA pass: brand compliance ✓  contrast ✓  legibility ✓",
        "campaign ready for launch",
      ],
    },
  ]),
};

const coldBrew: MockDataset = {
  presetId: "cold-brew",
  exampleLabel: "Cold brew coffee startup",
  matchKeywords: ["coffee", "brew", "cold brew", "drink", "beverage", "cafe"],
  tagline: "Craft beverage DTC launch",
  intel: {
    signals: [
      { label: "Nitro cold brew", detail: "premium signal — willingness to pay +30%", trend: "+162%" },
      { label: "'Evening cold brew'", detail: "whitespace — no brand owns the night occasion", trend: "new" },
      { label: "Single-origin storytelling", detail: "drives repeat-purchase loyalty", trend: "+74%" },
    ],
    reviews: [
      { source: "Amazon", text: "Smooth but every brand tastes the same after a while.", sentiment: "neutral" },
      { source: "TikTok", text: "This nitro can hits different, genuinely addictive.", sentiment: "positive" },
      { source: "Reddit", text: "Wish there was a low-acid option for the evening.", sentiment: "negative" },
    ],
    inventory: [
      { sku: "NOCT-NITRO-12", name: "Nocturne Nitro 12pk", stock: 2600, status: "ready" },
      { sku: "NOCT-DECAF-12", name: "Nocturne Decaf 12pk", stock: 410, status: "low" },
      { sku: "NOCT-OAT-12", name: "Nocturne Oat-Milk 12pk", stock: 0, status: "backorder" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "Your Evening Just Got an Upgrade.",
    narrativeBase: [
      "Campaign live on 3 channels. The 'evening cold brew' angle is novel and TikTok is eating it up.",
      "Creators are the top segment; lots of duet/stitch activity around the nitro pour shot.",
      "Instagram skews older and engagement is softer on the noir aesthetic.",
    ],
    narrativeOptimized: [
      "Doubled down on the night-occasion story and pushed the nitro pour as the lead frame.",
      "Reframed the Instagram creative toward the morning ritual for its older audience.",
      "Conversions jumped as the decaf SKU was surfaced for the evening crowd.",
    ],
    optimizationActions: [
      "Promoted nitro-pour as lead frame (TikTok)",
      "Reframed Instagram → morning ritual",
      "Surfaced decaf SKU for evening intent",
    ],
    channels: [
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@nocturne.brew",
        lift: 0.38,
        base: { impressions: 388000, engagementRate: 8.1, ctr: 3.4, conversions: 1620 },
        spark: [25, 40, 60, 85, 110, 140, 175],
        comments: [
          { handle: "@latteart_kel", text: "cold brew at NIGHT? why did no one do this sooner", sentiment: "positive" },
          { handle: "@gym.rat.dan", text: "the pour shot is hypnotic ngl", sentiment: "positive" },
          { handle: "@sleepyhead", text: "won't this keep me up lol", sentiment: "neutral" },
        ],
      },
      {
        id: "instagram",
        name: "Instagram",
        handle: "@drinknocturne",
        lift: 0.45,
        base: { impressions: 224000, engagementRate: 3.0, ctr: 1.4, conversions: 600 },
        spark: [28, 29, 30, 31, 30, 33, 35],
        comments: [
          { handle: "@coffee.snob", text: "single origin? respect. caption felt a bit dark though", sentiment: "neutral" },
          { handle: "@morningperson", text: "i'd buy this for mornings not nights tbh", sentiment: "neutral" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "nocturne.coffee",
        lift: 0.3,
        base: { impressions: 142000, engagementRate: 2.3, ctr: 2.6, conversions: 480 },
        spark: [38, 42, 44, 46, 48, 50, 54],
        comments: [
          { handle: "analytics", text: "Strong add-to-cart, checkout drop-off at shipping cost.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Slow Brewed. Fast Living.",
    body: "NOCTURNE cold brew steeps for 20 hours so your morning takes 20 seconds. Single-origin, nitro-smooth, ridiculously awake.",
    cta: "Start Your Ritual",
  },
  heroImage: {
    src: "/heroes/cold-brew.webp",
    alt: "Frosted cold brew can with condensation on a dark moody backdrop",
    fallbackGradient:
      "radial-gradient(120% 120% at 70% 20%, #422006 0%, #1c1917 45%, #0c0a09 80%), linear-gradient(135deg, #f59e0b22, #8b5cf622)",
  },
  reelVideo: "/reels/Drinks.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "5.3%", delta: "+2.1pp", positive: true },
      { label: "Brand Fit", value: "89", delta: "+9", positive: true },
      { label: "Est. CAC", value: "$9.10", delta: "-31%", positive: true },
      { label: "Reach", value: "880K", delta: "+210K", positive: true },
    ],
    market: {
      id: "market",
      title: "Market Trend Index",
      xLabel: "Week",
      yLabel: "Interest",
      accent: "#f59e0b",
      points: [
        { x: "W1", y: 44 },
        { x: "W2", y: 49 },
        { x: "W3", y: 55 },
        { x: "W4", y: 63 },
        { x: "W5", y: 78 },
        { x: "W6", y: 91 },
      ],
    },
    audience: {
      id: "audience",
      title: "Audience Resonance",
      xLabel: "Segment",
      yLabel: "Score",
      accent: "#a78bfa",
      points: [
        { x: "Remote", y: 91 },
        { x: "Students", y: 84 },
        { x: "Creators", y: 88 },
        { x: "Fitness", y: 72 },
        { x: "Foodie", y: 79 },
      ],
    },
    predictedPerformance: {
      id: "perf",
      title: "Predicted Campaign Lift",
      xLabel: "Day",
      yLabel: "Conversions",
      accent: "#a3e635",
      points: [
        { x: "D1", y: 90 },
        { x: "D3", y: 180 },
        { x: "D5", y: 320 },
        { x: "D7", y: 500 },
        { x: "D9", y: 690 },
        { x: "D11", y: 870 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher",
      pillar: "RAG",
      logs: [
        "scanning 1,930 reviews across DTC coffee brands…",
        "RAG insight: 'nitro' + 'single origin' = premium signal",
        "gap found → nobody owns 'evening cold brew'",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst",
      pillar: "MCP",
      logs: [
        "MCP query → roast inventory + margin table",
        "audience cluster: remote workers, creators, students",
        "price elasticity sweet spot: $3.80/can",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter",
      pillar: "LLM",
      logs: [
        "generating brand voice: confident, nocturnal, witty",
        "headline locked: 'Slow Brewed. Fast Living.'",
        "microcopy + CTA generated",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director",
      pillar: "Diffusion",
      logs: [
        "art direction: moody noir, condensation, rim light",
        "diffusion prompt → product hero, 4:5 social ratio",
        "rendering…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations",
      pillar: "Agentic",
      logs: [
        "bundling 3 channel variants (IG, TikTok, web)",
        "QA: legibility ✓  brand palette ✓",
        "campaign packaged",
      ],
    },
  ]),
};

const fitnessApp: MockDataset = {
  presetId: "ai-fitness",
  exampleLabel: "AI fitness coaching app",
  matchKeywords: ["fitness", "workout", "gym", "health", "app", "coach", "training"],
  tagline: "Consumer health app launch",
  intel: {
    signals: [
      { label: "Recovery-based training", detail: "fastest-growing fitness search category", trend: "+180%" },
      { label: "'Plans don't adapt'", detail: "#1 cited reason for app churn", trend: "critical" },
      { label: "Adaptive AI coaching", detail: "premium-tier conversion driver", trend: "+93%" },
    ],
    reviews: [
      { source: "App Store", text: "Great workouts but it never adjusts when I'm exhausted.", sentiment: "negative" },
      { source: "Product Hunt", text: "The adaptive plan actually kept me consistent for 3 months.", sentiment: "positive" },
      { source: "Twitter/X", text: "Decent app, onboarding asks too many questions though.", sentiment: "neutral" },
    ],
    inventory: [
      { sku: "PULSE-FREE", name: "Pulse Free Tier", stock: 99999, status: "ready" },
      { sku: "PULSE-PRO", name: "Pulse Pro (monthly)", stock: 99999, status: "ready" },
      { sku: "PULSE-COACH", name: "Pulse + Human Coach", stock: 120, status: "low" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "The Only Workout You'll Actually Finish.",
    narrativeBase: [
      "Launched across 3 channels. The 'adapts to your recovery' message is resonating with busy professionals.",
      "TikTok drives installs; Instagram drives saves but fewer installs.",
      "Web sign-ups are strong but the free→pro upgrade prompt is being missed.",
    ],
    narrativeOptimized: [
      "Led with the 'never skip again' angle and added a recovery-score demo clip.",
      "Installs accelerated; the rewritten headline reduced cost-per-install by ~30%.",
      "Moved the upgrade prompt to post-first-workout — pro conversions rose.",
    ],
    optimizationActions: [
      "Added recovery-score demo clip (TikTok)",
      "Rewrote headline → 'never skip again'",
      "Moved upgrade prompt post-first-workout",
    ],
    channels: [
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@pulse.ai",
        lift: 0.4,
        base: { impressions: 520000, engagementRate: 6.8, ctr: 3.6, conversions: 2400 },
        spark: [30, 50, 75, 100, 140, 185, 240],
        comments: [
          { handle: "@busybee.kate", text: "an app that knows when i'm too tired? sold", sentiment: "positive" },
          { handle: "@liftbro", text: "does it actually change the plan or just say it does", sentiment: "neutral" },
          { handle: "@comeback.fit", text: "started again because of this. day 9 streak 🔥", sentiment: "positive" },
        ],
      },
      {
        id: "instagram",
        name: "Instagram",
        handle: "@pulse.training",
        lift: 0.48,
        base: { impressions: 310000, engagementRate: 4.1, ctr: 1.8, conversions: 900 },
        spark: [35, 38, 40, 42, 41, 44, 47],
        comments: [
          { handle: "@wellness.amy", text: "saved this! the HUD overlay looks so premium", sentiment: "positive" },
          { handle: "@skeptic.sam", text: "every app says 'AI' now though", sentiment: "negative" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "pulse.app",
        lift: 0.33,
        base: { impressions: 198000, engagementRate: 2.6, ctr: 2.9, conversions: 1020 },
        spark: [42, 46, 50, 52, 55, 58, 62],
        comments: [
          { handle: "analytics", text: "Free sign-ups high; pro upgrade prompt seen by only 31%.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Your Coach Never Sleeps.",
    body: "PULSE reads your recovery, mood, and schedule to build the only workout you'll actually do today. Adaptive AI training that meets you where you are.",
    cta: "Train Smarter Free",
  },
  heroImage: {
    src: "/heroes/ai-fitness.webp",
    alt: "Athlete mid-motion with glowing data overlays on a dark gradient",
    fallbackGradient:
      "radial-gradient(120% 120% at 50% 10%, #1e1b4b 0%, #312e81 35%, #09090b 80%), linear-gradient(135deg, #8b5cf633, #22d3ee22)",
  },
  reelVideo: "/reels/fitness.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "6.1%", delta: "+2.6pp", positive: true },
      { label: "Brand Fit", value: "94", delta: "+15", positive: true },
      { label: "Est. CAC", value: "$7.80", delta: "-38%", positive: true },
      { label: "Reach", value: "2.4M", delta: "+610K", positive: true },
    ],
    market: {
      id: "market",
      title: "Market Trend Index",
      xLabel: "Week",
      yLabel: "Interest",
      accent: "#8b5cf6",
      points: [
        { x: "W1", y: 51 },
        { x: "W2", y: 58 },
        { x: "W3", y: 66 },
        { x: "W4", y: 72 },
        { x: "W5", y: 84 },
        { x: "W6", y: 95 },
      ],
    },
    audience: {
      id: "audience",
      title: "Audience Resonance",
      xLabel: "Segment",
      yLabel: "Score",
      accent: "#22d3ee",
      points: [
        { x: "Beginners", y: 90 },
        { x: "Busy Pros", y: 93 },
        { x: "Athletes", y: 78 },
        { x: "Wellness", y: 85 },
        { x: "Comeback", y: 88 },
      ],
    },
    predictedPerformance: {
      id: "perf",
      title: "Predicted Campaign Lift",
      xLabel: "Day",
      yLabel: "Installs",
      accent: "#a3e635",
      points: [
        { x: "D1", y: 200 },
        { x: "D3", y: 410 },
        { x: "D5", y: 680 },
        { x: "D7", y: 1020 },
        { x: "D9", y: 1480 },
        { x: "D11", y: 1990 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher",
      pillar: "RAG",
      logs: [
        "retrieving fitness-app churn studies + app-store reviews…",
        "RAG insight: #1 churn reason = 'plans don't adapt'",
        "trend: recovery-based training +180% search",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst",
      pillar: "MCP",
      logs: [
        "MCP query → feature flags + pricing tiers",
        "audience: busy professionals score 0.93",
        "positioning: 'adaptive' over 'intense'",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter",
      pillar: "LLM",
      logs: [
        "voice: motivating but never preachy",
        "headline locked: 'Your Coach Never Sleeps.'",
        "value props distilled to 3 lines",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director",
      pillar: "Diffusion",
      logs: [
        "art direction: kinetic motion, HUD data overlays",
        "diffusion prompt → athlete hero, electric accents",
        "rendering…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations",
      pillar: "Agentic",
      logs: [
        "compiling app-store + paid-social creative set",
        "QA: accessibility ✓  motion-safe ✓",
        "launch bundle ready",
      ],
    },
  ]),
};

// Generic fallback for any idea that doesn't match a preset (Req 6.4).
const defaultDataset: MockDataset = {
  presetId: "default",
  exampleLabel: "Custom product idea",
  matchKeywords: [],
  tagline: "Custom brand launch",
  intel: {
    signals: [
      { label: "Category momentum", detail: "rising consumer interest detected", trend: "+96%" },
      { label: "Competitor whitespace", detail: "underserved positioning angle found", trend: "open" },
      { label: "Differentiator signal", detail: "3 unique hooks surfaced from retrieval", trend: "+58%" },
    ],
    reviews: [
      { source: "Web", text: "The options out there all feel a bit generic to me.", sentiment: "negative" },
      { source: "Forum", text: "If someone nailed this I'd switch in a heartbeat.", sentiment: "positive" },
      { source: "Survey", text: "Interested, but I'd need to understand the value first.", sentiment: "neutral" },
    ],
    inventory: [
      { sku: "SKU-001", name: "Core Product — A", stock: 1200, status: "ready" },
      { sku: "SKU-002", name: "Core Product — B", stock: 280, status: "low" },
      { sku: "SKU-003", name: "Core Product — C", stock: 0, status: "backorder" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "Built For What's Next — And It's Working.",
    narrativeBase: [
      "Campaign is live across 3 channels. Early signal: the differentiation hook is landing on short-form video.",
      "TikTok leads on reach and engagement; web converts best per visit.",
      "Instagram engagement is soft — the message may be too broad for that audience.",
    ],
    narrativeOptimized: [
      "Sharpened the Instagram message to the single strongest differentiator.",
      "Engagement and CTR improved across channels after the rewrite.",
      "Web conversions rose once the proof point moved above the fold.",
    ],
    optimizationActions: [
      "Sharpened Instagram message (1 differentiator)",
      "Rewrote underperforming headline",
      "Moved proof point above the fold (web)",
    ],
    channels: [
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@yourbrand",
        lift: 0.34,
        base: { impressions: 320000, engagementRate: 6.0, ctr: 2.9, conversions: 1400 },
        spark: [22, 38, 55, 78, 100, 130, 165],
        comments: [
          { handle: "@earlyadopter", text: "this is exactly what i've been looking for", sentiment: "positive" },
          { handle: "@curious_cat", text: "interesting but how is it different really?", sentiment: "neutral" },
        ],
      },
      {
        id: "instagram",
        name: "Instagram",
        handle: "@yourbrand",
        lift: 0.46,
        base: { impressions: 210000, engagementRate: 3.1, ctr: 1.5, conversions: 640 },
        spark: [30, 31, 32, 31, 33, 35, 37],
        comments: [
          { handle: "@design.daily", text: "clean visuals, message didn't quite click for me", sentiment: "neutral" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "yourbrand.com",
        lift: 0.3,
        base: { impressions: 138000, engagementRate: 2.2, ctr: 2.7, conversions: 520 },
        spark: [38, 41, 43, 45, 47, 49, 53],
        comments: [
          { handle: "analytics", text: "Good intent signal; conversion sensitive to headline clarity.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Built For What's Next.",
    body: "AInigma turned your idea into a complete, on-brand campaign — copy, creative, and channel strategy — in a single autonomous pass.",
    cta: "Launch Campaign",
  },
  heroImage: {
    src: "/heroes/default.webp",
    alt: "Abstract premium product hero on a cyan-violet gradient",
    fallbackGradient:
      "radial-gradient(120% 120% at 50% 15%, #155e75 0%, #4c1d95 45%, #09090b 82%), linear-gradient(135deg, #22d3ee33, #e879f922)",
  },
  reelVideo: "/reels/default_nebula.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "4.4%", delta: "+1.6pp", positive: true },
      { label: "Brand Fit", value: "87", delta: "+8", positive: true },
      { label: "Est. CAC", value: "$12.20", delta: "-18%", positive: true },
      { label: "Reach", value: "960K", delta: "+180K", positive: true },
    ],
    market: {
      id: "market",
      title: "Market Trend Index",
      xLabel: "Week",
      yLabel: "Interest",
      accent: "#22d3ee",
      points: [
        { x: "W1", y: 38 },
        { x: "W2", y: 44 },
        { x: "W3", y: 52 },
        { x: "W4", y: 61 },
        { x: "W5", y: 73 },
        { x: "W6", y: 84 },
      ],
    },
    audience: {
      id: "audience",
      title: "Audience Resonance",
      xLabel: "Segment",
      yLabel: "Score",
      accent: "#a78bfa",
      points: [
        { x: "Seg A", y: 82 },
        { x: "Seg B", y: 75 },
        { x: "Seg C", y: 88 },
        { x: "Seg D", y: 70 },
        { x: "Seg E", y: 79 },
      ],
    },
    predictedPerformance: {
      id: "perf",
      title: "Predicted Campaign Lift",
      xLabel: "Day",
      yLabel: "Conversions",
      accent: "#a3e635",
      points: [
        { x: "D1", y: 110 },
        { x: "D3", y: 200 },
        { x: "D5", y: 330 },
        { x: "D7", y: 500 },
        { x: "D9", y: 660 },
        { x: "D11", y: 820 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher",
      pillar: "RAG",
      logs: [
        "retrieving market signals for your concept…",
        "RAG synthesis: 3 differentiators surfaced",
        "competitor whitespace identified",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst",
      pillar: "MCP",
      logs: [
        "MCP query → local context store",
        "audience segments ranked by fit",
        "positioning angle locked",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter",
      pillar: "LLM",
      logs: [
        "generating brand voice + headline options",
        "selecting highest-resonance variant",
        "CTA optimized for intent",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director",
      pillar: "Diffusion",
      logs: [
        "art direction brief composed",
        "diffusion prompt assembled with brand palette",
        "rendering hero…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations",
      pillar: "Agentic",
      logs: [
        "assembling multimodal campaign bundle",
        "QA pass complete",
        "ready for launch",
      ],
    },
  ]),
};

export const PRESETS: MockDataset[] = [
  sneakers,
  coldBrew,
  fitnessApp,
  artisanChocolate,
  glowSkincare,
  signatureFragrance,
];
export const DEFAULT_DATASET = defaultDataset;

/** Resolve a dataset for a free-text idea. Always returns a dataset (Req 6.4). */
export function resolveDataset(idea: string): MockDataset {
  const q = idea.toLowerCase();
  for (const ds of PRESETS) {
    if (ds.matchKeywords.some((k) => q.includes(k))) return ds;
  }
  return DEFAULT_DATASET;
}
