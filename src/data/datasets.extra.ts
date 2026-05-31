import type { MockDataset } from "../types";
import { buildScript } from "./scriptBuilder";
import { buildPulse } from "./pulseBuilder";

// ---------------------------------------------------------------------------
// EXTRA MOCK DATASETS
// Three more fully-built campaigns (chocolate, skincare, fragrance) so the
// Campaign Studio has six polished demo options that each run end-to-end:
// matched hero still (/public/heroes) + reel (/public/reels) + agent script +
// copy + analytics + channel pulse. Same shape as the core datasets in
// datasets.ts — registered into PRESETS there.
// ---------------------------------------------------------------------------

// ----------------------------------------------------------------- chocolate
export const artisanChocolate: MockDataset = {
  presetId: "artisan-chocolate",
  exampleLabel: "Artisan dark chocolate",
  matchKeywords: ["chocolate", "cocoa", "cacao", "candy", "sweet", "confection", "dessert", "truffle"],
  tagline: "Premium confectionery DTC launch",
  intel: {
    signals: [
      { label: "Single-origin cacao", detail: "provenance storytelling driving premium DTC sales", trend: "+165%" },
      { label: "'Bean-to-bar'", detail: "craft narrative outsells mass brands on margin", trend: "+92%" },
      { label: "Gifting occasions", detail: "self-gifting + small-batch sets surging off-season", trend: "+54%" },
    ],
    reviews: [
      { source: "r/chocolate", text: "most 'luxury' bars are just expensive Hershey. show me real origin.", sentiment: "negative" },
      { source: "Trustpilot", text: "the 72% Madagascar bar is the best chocolate I've ever had, full stop.", sentiment: "positive" },
      { source: "Instagram", text: "the gold packaging is stunning but is it worth the price?", sentiment: "neutral" },
    ],
    inventory: [
      { sku: "COCOA-72-MAD", name: "72% Madagascar — Single Origin", stock: 1260, status: "ready" },
      { sku: "COCOA-85-PERU", name: "85% Peru — Dark Reserve", stock: 280, status: "low" },
      { sku: "COCOA-GIFT-04", name: "Tasting Flight — Gift Set", stock: 0, status: "backorder" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "Taste the Origin. Not the Markup.",
    narrativeBase: [
      "Launch is live across 3 channels. Instagram is leading on the gold-foil unboxing hook.",
      "Foodie + gifting segments respond strongest; comments cluster around 'single-origin' provenance.",
      "Web CTR is solid but the gift set sells out, capping conversions late in the week.",
    ],
    narrativeOptimized: [
      "Leaned the Instagram creative into the bean-to-bar origin story and surfaced restock alerts.",
      "Engagement climbed; the provenance-led headline lifted Instagram CTR by ~60%.",
      "Backorder waitlist captured demand the sold-out gift set was leaking.",
    ],
    optimizationActions: [
      "Reframed hero around single-origin provenance",
      "Added restock waitlist for the gift set",
      "Promoted '72% Madagascar' as the hero SKU",
    ],
    channels: [
      {
        id: "instagram",
        name: "Instagram",
        handle: "@maison.cacao",
        lift: 0.42,
        base: { impressions: 318000, engagementRate: 5.1, ctr: 2.4, conversions: 1180 },
        spark: [28, 34, 40, 52, 61, 78, 96],
        comments: [
          { handle: "@dessertfirst", text: "that gold foil unboxing is everything 😍", sentiment: "positive" },
          { handle: "@cocoa.snob", text: "finally a brand that names the origin. instant buy", sentiment: "positive" },
          { handle: "@budget.bites", text: "looks incredible but pricey for a bar", sentiment: "neutral" },
        ],
      },
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@maison.cacao",
        lift: 0.36,
        base: { impressions: 286000, engagementRate: 6.4, ctr: 2.8, conversions: 960 },
        spark: [22, 30, 44, 58, 70, 88, 110],
        comments: [
          { handle: "@snackqueen", text: "the snap test asmr sold me ngl", sentiment: "positive" },
          { handle: "@foodie.dad", text: "ordering the tasting flight for the holidays", sentiment: "positive" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "maison-cacao.com",
        lift: 0.3,
        base: { impressions: 142000, engagementRate: 2.0, ctr: 2.6, conversions: 520 },
        spark: [38, 42, 45, 47, 49, 53, 57],
        comments: [
          { handle: "analytics", text: "Gift set page converts 2x site average before stockout.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Indulge, Unapologetically.",
    body: "Meet MAISON CACAO — small-batch, single-origin dark chocolate wrapped in gold. Real provenance, real depth, none of the mass-market markup.",
    cta: "Taste the Collection",
  },
  heroImage: {
    src: "/heroes/artisan-chocolate.webp",
    alt: "Luxury dark chocolate bars with gold foil and scattered cocoa nibs",
    fallbackGradient:
      "radial-gradient(120% 120% at 40% 20%, #7c2d12 0%, #422006 40%, #1c1917 82%), linear-gradient(135deg, #fb923c22, #f59e0b22)",
  },
  reelVideo: "/reels/sweet_shop.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "4.5%", delta: "+1.7pp", positive: true },
      { label: "Brand Fit", value: "90", delta: "+11", positive: true },
      { label: "Est. CAC", value: "$13.10", delta: "-19%", positive: true },
      { label: "Reach", value: "880K", delta: "+220K", positive: true },
    ],
    market: {
      id: "market", title: "Market Trend Index", xLabel: "Week", yLabel: "Interest", accent: "#fb923c",
      points: [
        { x: "W1", y: 30 }, { x: "W2", y: 38 }, { x: "W3", y: 49 },
        { x: "W4", y: 57 }, { x: "W5", y: 68 }, { x: "W6", y: 82 },
      ],
    },
    audience: {
      id: "audience", title: "Audience Resonance", xLabel: "Segment", yLabel: "Score", accent: "#a78bfa",
      points: [
        { x: "Foodie", y: 92 }, { x: "Gifting", y: 84 }, { x: "Luxury", y: 88 },
        { x: "Millennial", y: 74 }, { x: "Gen Z", y: 69 },
      ],
    },
    predictedPerformance: {
      id: "perf", title: "Predicted Campaign Lift", xLabel: "Day", yLabel: "Conversions", accent: "#a3e635",
      points: [
        { x: "D1", y: 100 }, { x: "D3", y: 190 }, { x: "D5", y: 320 },
        { x: "D7", y: 470 }, { x: "D9", y: 640 }, { x: "D11", y: 800 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher", pillar: "RAG",
      logs: [
        "retrieving 1,920 signals across premium confectionery…",
        "RAG match: 'single-origin' provenance trending +165%",
        "top pain point → 'luxury bars that aren't actually premium'",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst", pillar: "MCP",
      logs: [
        "MCP query → local inventory: 3 SKUs, gift set on backorder",
        "segmenting audience: foodies + gifting score highest",
        "sentiment vector locked: indulgent / authentic",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter", pillar: "LLM",
      logs: [
        "drafting 6 headline candidates…",
        "selected: 'Indulge, Unapologetically.' (resonance 0.92)",
        "CTA tuned toward tasting-set discovery",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director", pillar: "Diffusion",
      logs: [
        "art direction brief: gold foil, moody warm key light",
        "diffusion prompt assembled → brand palette locked",
        "rendering hero frame…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations", pillar: "Agentic",
      logs: [
        "assembling multimodal asset bundle",
        "QA pass: brand compliance ✓  appetite-appeal ✓  legibility ✓",
        "campaign ready for launch",
      ],
    },
  ]),
};

// ------------------------------------------------------------------ skincare
export const glowSkincare: MockDataset = {
  presetId: "glow-skincare",
  exampleLabel: "Nourishing body cream",
  matchKeywords: ["skincare", "skin", "cream", "lotion", "body cream", "moisturizer", "beauty", "serum", "lotion"],
  tagline: "Clean beauty DTC launch",
  intel: {
    signals: [
      { label: "Skin-barrier repair", detail: "ceramide + squalane formulas dominate clean-beauty search", trend: "+178%" },
      { label: "'Fragrance-free'", detail: "sensitive-skin buyers actively filter for it", trend: "+96%" },
      { label: "Refillable packaging", detail: "sustainability now a purchase driver in beauty", trend: "+61%" },
    ],
    reviews: [
      { source: "r/SkincareAddiction", text: "every 'whipped' cream pills under makeup. I've given up.", sentiment: "negative" },
      { source: "Trustpilot", text: "absorbs in seconds and my eczema calmed down in a week.", sentiment: "positive" },
      { source: "Instagram", text: "gorgeous jar but is it actually fragrance-free or 'naturally scented'?", sentiment: "neutral" },
    ],
    inventory: [
      { sku: "GLOW-BODY-01", name: "Ceramide Body Cream — Unscented", stock: 2140, status: "ready" },
      { sku: "GLOW-BODY-02", name: "Squalane Body Cream — Refill", stock: 410, status: "low" },
      { sku: "GLOW-FACE-01", name: "Barrier Repair Face Cream", stock: 0, status: "backorder" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "Barrier-First. Fragrance-Free. Finally.",
    narrativeBase: [
      "Launch is live across 3 channels. TikTok 'texture test' clips are the strongest hook.",
      "Sensitive-skin + clean-beauty segments respond best; comments ask about fragrance and pilling.",
      "Instagram saves are high but CTR lags — the hook leads with aesthetics over efficacy.",
    ],
    narrativeOptimized: [
      "Rewrote the Instagram hook to lead with 'fragrance-free barrier repair' over aesthetics.",
      "Engagement and CTR climbed; the efficacy-first headline lifted Instagram CTR by ~65%.",
      "Refill SKU promoted to the front, capturing the sustainability-driven segment.",
    ],
    optimizationActions: [
      "Rewrote Instagram hook (efficacy-first)",
      "Surfaced 'fragrance-free' proof point",
      "Promoted refillable SKU on web",
    ],
    channels: [
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@glow.ritual",
        lift: 0.38,
        base: { impressions: 372000, engagementRate: 6.8, ctr: 3.0, conversions: 1520 },
        spark: [24, 33, 47, 62, 76, 95, 124],
        comments: [
          { handle: "@skintegrity", text: "the absorption test sold me, no white cast!", sentiment: "positive" },
          { handle: "@ecz.ema", text: "does it sting on broken skin? need to know", sentiment: "neutral" },
          { handle: "@cleanbeautyfan", text: "fragrance-free AND refillable?? adding to cart", sentiment: "positive" },
        ],
      },
      {
        id: "instagram",
        name: "Instagram",
        handle: "@glow.ritual",
        lift: 0.5,
        base: { impressions: 244000, engagementRate: 3.6, ctr: 1.7, conversions: 660 },
        spark: [30, 31, 33, 34, 36, 39, 42],
        comments: [
          { handle: "@minimal.skin", text: "the jar is so pretty but tell me what it DOES", sentiment: "neutral" },
          { handle: "@derm.curious", text: "ceramides + squalane is a great combo honestly", sentiment: "positive" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "glowritual.com",
        lift: 0.29,
        base: { impressions: 168000, engagementRate: 2.2, ctr: 2.5, conversions: 590 },
        spark: [40, 43, 45, 46, 49, 52, 56],
        comments: [
          { handle: "analytics", text: "Refill subscribers show 3x LTV vs one-time buyers.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Skin, Restored.",
    body: "Meet GLOW RITUAL — a fragrance-free ceramide body cream that repairs your skin barrier and sinks in fast. Clean, refillable, and made for sensitive skin.",
    cta: "Start Your Ritual",
  },
  heroImage: {
    src: "/heroes/skin-cream.webp",
    alt: "Minimalist whipped body cream jar with a soft cream swirl in warm light",
    fallbackGradient:
      "radial-gradient(120% 120% at 35% 20%, #78350f 0%, #92400e 35%, #1c1917 80%), linear-gradient(135deg, #fbbf2422, #f472b622)",
  },
  reelVideo: "/reels/bodyCream.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "4.9%", delta: "+2.0pp", positive: true },
      { label: "Brand Fit", value: "93", delta: "+13", positive: true },
      { label: "Est. CAC", value: "$10.80", delta: "-26%", positive: true },
      { label: "Reach", value: "1.1M", delta: "+300K", positive: true },
    ],
    market: {
      id: "market", title: "Market Trend Index", xLabel: "Week", yLabel: "Interest", accent: "#f472b6",
      points: [
        { x: "W1", y: 34 }, { x: "W2", y: 43 }, { x: "W3", y: 51 },
        { x: "W4", y: 63 }, { x: "W5", y: 76 }, { x: "W6", y: 90 },
      ],
    },
    audience: {
      id: "audience", title: "Audience Resonance", xLabel: "Segment", yLabel: "Score", accent: "#a78bfa",
      points: [
        { x: "Sensitive", y: 94 }, { x: "Clean", y: 89 }, { x: "Gen Z", y: 82 },
        { x: "Millennial", y: 78 }, { x: "Luxury", y: 71 },
      ],
    },
    predictedPerformance: {
      id: "perf", title: "Predicted Campaign Lift", xLabel: "Day", yLabel: "Conversions", accent: "#a3e635",
      points: [
        { x: "D1", y: 130 }, { x: "D3", y: 220 }, { x: "D5", y: 370 },
        { x: "D7", y: 560 }, { x: "D9", y: 740 }, { x: "D11", y: 930 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher", pillar: "RAG",
      logs: [
        "retrieving 2,640 signals across clean beauty…",
        "RAG match: 'skin-barrier repair' trending +178%",
        "top pain point → 'whipped creams that pill under makeup'",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst", pillar: "MCP",
      logs: [
        "MCP query → local inventory: 3 SKUs, refill running low",
        "segmenting audience: sensitive-skin + clean-beauty score highest",
        "sentiment vector locked: calm / trustworthy / efficacious",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter", pillar: "LLM",
      logs: [
        "drafting 6 headline candidates…",
        "selected: 'Skin, Restored.' (resonance 0.95)",
        "CTA tuned toward ritual / subscription intent",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director", pillar: "Diffusion",
      logs: [
        "art direction brief: soft spa light, warm cream tones",
        "diffusion prompt assembled → brand palette locked",
        "rendering hero frame…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations", pillar: "Agentic",
      logs: [
        "assembling multimodal asset bundle",
        "QA pass: brand compliance ✓  claims-safe ✓  legibility ✓",
        "campaign ready for launch",
      ],
    },
  ]),
};

// ----------------------------------------------------------------- fragrance
export const signatureFragrance: MockDataset = {
  presetId: "signature-fragrance",
  exampleLabel: "Signature fragrance",
  matchKeywords: ["fragrance", "perfume", "scent", "cologne", "eau de parfum", "aroma", "parfum"],
  tagline: "Luxury fragrance brand launch",
  intel: {
    signals: [
      { label: "'Skin scent' niche", detail: "subtle, intimate fragrances outpacing loud designer scents", trend: "+143%" },
      { label: "Gender-free fragrance", detail: "unisex positioning expands addressable market", trend: "+88%" },
      { label: "Scent storytelling", detail: "note-by-note narratives drive premium conversion", trend: "+57%" },
    ],
    reviews: [
      { source: "r/fragrance", text: "every 'unisex' launch smells like the same generic woody amber.", sentiment: "negative" },
      { source: "Trustpilot", text: "the opening is unreal and it actually lasts 8 hours on me.", sentiment: "positive" },
      { source: "Instagram", text: "bottle is art but I can't smell it through a screen — risky buy.", sentiment: "neutral" },
    ],
    inventory: [
      { sku: "AURA-EDP-50", name: "AURA Eau de Parfum — 50ml", stock: 980, status: "ready" },
      { sku: "AURA-EDP-100", name: "AURA Eau de Parfum — 100ml", stock: 240, status: "low" },
      { sku: "AURA-DISC-05", name: "Discovery Set — 5 vials", stock: 0, status: "backorder" },
    ],
  },
  pulse: buildPulse({
    optimizedHeadline: "Your Scent. No One Else's.",
    narrativeBase: [
      "Launch is live across 3 channels. Instagram's bottle-as-art visuals drive the most saves.",
      "Fragrance enthusiasts + gifting segments respond best; comments ask 'how does it actually smell'.",
      "Conversion lags because shoppers can't sample — the discovery set sells out fast.",
    ],
    narrativeOptimized: [
      "Pushed the discovery set as the entry offer to solve the 'can't smell it' objection.",
      "Engagement held and CTR rose; the sampling-led angle lifted web conversions ~58%.",
      "Note-by-note storytelling reels gave enthusiasts the depth they were asking for.",
    ],
    optimizationActions: [
      "Promoted the discovery set as entry offer",
      "Added note-by-note scent storytelling reel",
      "Reframed hook around individuality / skin scent",
    ],
    channels: [
      {
        id: "instagram",
        name: "Instagram",
        handle: "@aura.parfums",
        lift: 0.4,
        base: { impressions: 298000, engagementRate: 5.4, ctr: 2.2, conversions: 880 },
        spark: [26, 32, 41, 53, 64, 80, 100],
        comments: [
          { handle: "@scent.diary", text: "that bottle belongs on a shelf as art honestly", sentiment: "positive" },
          { handle: "@niche.noses", text: "need the note breakdown before I commit", sentiment: "neutral" },
          { handle: "@edp.addict", text: "got the discovery set, the amber one is incredible", sentiment: "positive" },
        ],
      },
      {
        id: "tiktok",
        name: "TikTok",
        handle: "@aura.parfums",
        lift: 0.34,
        base: { impressions: 256000, engagementRate: 6.0, ctr: 2.6, conversions: 720 },
        spark: [20, 28, 40, 52, 66, 82, 102],
        comments: [
          { handle: "@perfumetok", text: "the way you told the scent story... sold", sentiment: "positive" },
          { handle: "@frag.curious", text: "is it giving clean girl or smoky? need to know", sentiment: "neutral" },
        ],
      },
      {
        id: "web",
        name: "Web Banner",
        handle: "aura-parfums.com",
        lift: 0.31,
        base: { impressions: 150000, engagementRate: 2.1, ctr: 2.5, conversions: 500 },
        spark: [38, 41, 44, 46, 48, 52, 55],
        comments: [
          { handle: "analytics", text: "Discovery set converts to full-size at 34% within 30 days.", sentiment: "neutral" },
        ],
      },
    ],
  }),
  copy: {
    headline: "Bottle Your Aura.",
    body: "Meet AURA — a gender-free eau de parfum built around a luminous skin-scent accord. Intimate, long-wearing, and unmistakably yours.",
    cta: "Find Your Scent",
  },
  heroImage: {
    src: "/heroes/fragrance.webp",
    alt: "Elegant faceted perfume bottle in soft mist with violet rim lighting",
    fallbackGradient:
      "radial-gradient(120% 120% at 45% 18%, #4c1d95 0%, #1e1b4b 45%, #09090b 82%), linear-gradient(135deg, #a78bfa22, #e879f922)",
  },
  reelVideo: "/reels/Aura.mp4",
  analytics: {
    label: "Simulated",
    kpis: [
      { label: "Predicted CTR", value: "4.3%", delta: "+1.5pp", positive: true },
      { label: "Brand Fit", value: "91", delta: "+12", positive: true },
      { label: "Est. CAC", value: "$15.40", delta: "-15%", positive: true },
      { label: "Reach", value: "820K", delta: "+190K", positive: true },
    ],
    market: {
      id: "market", title: "Market Trend Index", xLabel: "Week", yLabel: "Interest", accent: "#a78bfa",
      points: [
        { x: "W1", y: 31 }, { x: "W2", y: 39 }, { x: "W3", y: 48 },
        { x: "W4", y: 59 }, { x: "W5", y: 70 }, { x: "W6", y: 83 },
      ],
    },
    audience: {
      id: "audience", title: "Audience Resonance", xLabel: "Segment", yLabel: "Score", accent: "#e879f9",
      points: [
        { x: "Enthusiast", y: 90 }, { x: "Gifting", y: 83 }, { x: "Luxury", y: 87 },
        { x: "Gen Z", y: 76 }, { x: "Millennial", y: 80 },
      ],
    },
    predictedPerformance: {
      id: "perf", title: "Predicted Campaign Lift", xLabel: "Day", yLabel: "Conversions", accent: "#a3e635",
      points: [
        { x: "D1", y: 95 }, { x: "D3", y: 180 }, { x: "D5", y: 300 },
        { x: "D7", y: 450 }, { x: "D9", y: 610 }, { x: "D11", y: 770 },
      ],
    },
  },
  agentScript: buildScript([
    {
      agent: "Researcher", pillar: "RAG",
      logs: [
        "retrieving 2,210 signals across niche fragrance…",
        "RAG match: 'skin scent' trending +143%",
        "top pain point → 'every unisex launch smells the same'",
      ],
      handoffTo: "Analyst",
    },
    {
      agent: "Analyst", pillar: "MCP",
      logs: [
        "MCP query → local inventory: 3 SKUs, discovery set on backorder",
        "segmenting audience: enthusiasts + gifting score highest",
        "sentiment vector locked: intimate / individual / luxurious",
      ],
      handoffTo: "Copywriter",
    },
    {
      agent: "Copywriter", pillar: "LLM",
      logs: [
        "drafting 6 headline candidates…",
        "selected: 'Bottle Your Aura.' (resonance 0.93)",
        "CTA tuned toward discovery-set entry",
      ],
      handoffTo: "Visual_Director",
    },
    {
      agent: "Visual_Director", pillar: "Diffusion",
      logs: [
        "art direction brief: faceted glass, violet rim light, soft mist",
        "diffusion prompt assembled → brand palette locked",
        "rendering hero frame…",
      ],
      handoffTo: "Operations",
    },
    {
      agent: "Operations", pillar: "Agentic",
      logs: [
        "assembling multimodal asset bundle",
        "QA pass: brand compliance ✓  luxury tone ✓  legibility ✓",
        "campaign ready for launch",
      ],
    },
  ]),
};
