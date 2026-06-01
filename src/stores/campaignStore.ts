import { create } from "zustand";
import type { ChannelId, ImageRef, MarketingCopy } from "../types";

// ---------------------------------------------------------------------------
// CAMPAIGN STORE — the keystone. A user owns a PORTFOLIO of campaigns that
// persist across sessions, carry version history, accumulate performance over
// time, and are tended by agents 24/7 (an always-on activity feed). This is
// what turns AIgnis from "a tool you run once" into "a product you manage".
//
// Persisted to localStorage (later: backend/DB via the same shape).
// ---------------------------------------------------------------------------

export type CampaignStatus = "draft" | "active" | "paused" | "archived";

export interface CampaignVersion {
  v: number;
  copy: MarketingCopy;
  note: string; // what changed in this version
  createdAt: number;
}

export interface CampaignPerf {
  reach: number;
  engagements: number;
  clicks: number;
  conversions: number;
  /** rolling reach series (oldest → newest) for sparklines */
  series: number[];
}

export interface Campaign {
  id: string;
  name: string; // short label, e.g. "Terra Runner launch"
  idea: string; // the product idea prompt
  presetId: string;
  status: CampaignStatus;
  channels: ChannelId[];
  copy: MarketingCopy;
  hero: ImageRef;
  reelVideo?: string;
  versions: CampaignVersion[];
  perf: CampaignPerf;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityEntry {
  id: string;
  ts: number;
  agent: "Researcher" | "Analyst" | "Copywriter" | "Visual_Director" | "Operations";
  campaignId?: string;
  message: string;
}

interface CampaignStore {
  campaigns: Campaign[];
  activity: ActivityEntry[];
  lastSeen: number;
  started: boolean;

  start: () => void;
  /** Create + save a campaign from a finished run. Returns its id. */
  saveCampaign: (input: {
    idea: string;
    presetId: string;
    name: string;
    copy: MarketingCopy;
    hero: ImageRef;
    reelVideo?: string;
    channels: ChannelId[];
    status?: CampaignStatus;
  }) => string;
  /** Append an optimized version (keeps history). */
  addVersion: (id: string, copy: MarketingCopy, note: string) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
  markSeen: () => void;
  getById: (id: string) => Campaign | undefined;
  /** delta of reach/conversions since `lastSeen` (the "while you were away"). */
  sinceLastSeen: () => { reach: number; conversions: number; topMover?: Campaign };

  _timer?: number;
}

const STORAGE_KEY = "aignis.campaigns";
const SEEN_KEY = "aignis.lastSeen";
const HOUR = 3600_000;

let cid = 0;
let aid = 0;
const uid = (p: string) => `${p}-${cid++}`;
const actId = () => `act-${aid++}`;

// -------- persistence --------
function load(): { campaigns: Campaign[]; activity: ActivityEntry[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function save(campaigns: Campaign[], activity: ActivityEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ campaigns, activity: activity.slice(0, 60) }));
  } catch {
    /* ignore */
  }
}
function loadSeen(): number {
  try {
    const v = localStorage.getItem(SEEN_KEY);
    return v ? Number(v) : Date.now() - 9 * HOUR; // first visit: pretend 9h ago
  } catch {
    return Date.now() - 9 * HOUR;
  }
}

// -------- seed a believable returning-Pro portfolio --------
const G = {
  sneaker: "radial-gradient(120% 120% at 30% 20%, #134e4a 0%, #0f766e 35%, #052e2b 75%)",
  brew: "radial-gradient(120% 120% at 70% 20%, #422006 0%, #1c1917 45%, #0c0a09 80%)",
  choc: "radial-gradient(120% 120% at 40% 20%, #7c2d12 0%, #422006 40%, #1c1917 82%)",
  watch: "radial-gradient(120% 120% at 50% 10%, #0c4a6e 0%, #1e293b 45%, #020617 82%)",
};

function series(base: number, n = 10): number[] {
  return Array.from({ length: n }, (_, i) =>
    Math.round(base * (0.4 + (i / (n - 1)) * 0.6) * (0.92 + Math.random() * 0.16))
  );
}

function seedCampaigns(): Campaign[] {
  const now = Date.now();
  return [
    {
      id: "camp-terra",
      name: "Terra Runner — Reef",
      idea: "eco-friendly sneakers for city runners",
      presetId: "eco-sneakers",
      status: "active",
      channels: ["tiktok", "instagram", "web"],
      copy: { headline: "Run Lighter. Tread Kinder.", body: "Performance sneakers spun from ocean-bound plastic and plant foam.", cta: "Claim Your Pair" },
      hero: { src: "/campaigns/eco-sneakers.webp", alt: "Eco sneakers", fallbackGradient: G.sneaker },
      reelVideo: "/reels/Black Shoes.mp4",
      versions: [
        { v: 1, copy: { headline: "Sustainable Speed.", body: "Recycled performance running shoes.", cta: "Shop Now" }, note: "Initial launch copy", createdAt: now - 70 * HOUR },
        { v: 2, copy: { headline: "Run Lighter. Tread Kinder.", body: "Performance sneakers spun from ocean-bound plastic and plant foam.", cta: "Claim Your Pair" }, note: "Rewrote hook performance-first after IG CTR dip", createdAt: now - 9 * HOUR },
      ],
      perf: { reach: 938000, engagements: 41200, clicks: 18400, conversions: 1840, series: series(120000) },
      createdAt: now - 72 * HOUR,
      updatedAt: now - 9 * HOUR,
    },
    {
      id: "camp-brew",
      name: "Nocturne Nitro Brew",
      idea: "small-batch nitro cold brew coffee",
      presetId: "cold-brew",
      status: "active",
      channels: ["instagram", "tiktok"],
      copy: { headline: "Slow Brewed. Fast Living.", body: "Small-batch nitro cold brew for people who refuse to slow down.", cta: "Taste the Pour" },
      hero: { src: "/campaigns/cold-brew.webp", alt: "Cold brew", fallbackGradient: G.brew },
      reelVideo: "/reels/Drinks.mp4",
      versions: [
        { v: 1, copy: { headline: "Slow Brewed. Fast Living.", body: "Small-batch nitro cold brew for people who refuse to slow down.", cta: "Taste the Pour" }, note: "Initial launch copy", createdAt: now - 30 * HOUR },
      ],
      perf: { reach: 412000, engagements: 22600, clicks: 9800, conversions: 760, series: series(60000) },
      createdAt: now - 30 * HOUR,
      updatedAt: now - 30 * HOUR,
    },
    {
      id: "camp-choc",
      name: "Maison Cacao — Gift Set",
      idea: "luxury artisan dark chocolate",
      presetId: "artisan-chocolate",
      status: "paused",
      channels: ["instagram", "web"],
      copy: { headline: "Indulge, Unapologetically.", body: "Single-origin dark chocolate wrapped in gold. No mass-market markup.", cta: "Taste the Collection" },
      hero: { src: "/campaigns/artisan-chocolate.webp", alt: "Artisan chocolate", fallbackGradient: G.choc },
      reelVideo: "/reels/sweet_shop.mp4",
      versions: [
        { v: 1, copy: { headline: "Indulge, Unapologetically.", body: "Single-origin dark chocolate wrapped in gold. No mass-market markup.", cta: "Taste the Collection" }, note: "Initial launch copy", createdAt: now - 120 * HOUR },
      ],
      perf: { reach: 286000, engagements: 18100, clicks: 7200, conversions: 540, series: series(48000) },
      createdAt: now - 120 * HOUR,
      updatedAt: now - 96 * HOUR,
    },
    {
      id: "camp-watch",
      name: "Aurum Automatic (draft)",
      idea: "a minimalist automatic luxury watch",
      presetId: "luxury-watch",
      status: "draft",
      channels: ["instagram", "web"],
      copy: { headline: "Time, Perfected.", body: "A minimalist automatic watch with a sapphire dial.", cta: "Discover" },
      hero: { src: "/campaigns/luxury-watch.webp", alt: "Luxury watch", fallbackGradient: G.watch },
      reelVideo: "/reels/Aura.mp4",
      versions: [
        { v: 1, copy: { headline: "Time, Perfected.", body: "A minimalist automatic watch with a sapphire dial.", cta: "Discover" }, note: "Draft — not yet published", createdAt: now - 4 * HOUR },
      ],
      perf: { reach: 0, engagements: 0, clicks: 0, conversions: 0, series: series(1) },
      createdAt: now - 4 * HOUR,
      updatedAt: now - 4 * HOUR,
    },
  ];
}

function seedActivity(): ActivityEntry[] {
  const now = Date.now();
  const mk = (mins: number, agent: ActivityEntry["agent"], campaignId: string | undefined, message: string): ActivityEntry => ({
    id: actId(),
    ts: now - mins * 60_000,
    agent,
    campaignId,
    message,
  });
  return [
    mk(14, "Analyst", "camp-terra", "Flagged Instagram CTR dip (-12%) on Terra Runner; queued a rewrite."),
    mk(38, "Copywriter", "camp-terra", "Drafted a performance-first hook variant (v2) for review."),
    mk(95, "Researcher", undefined, "Ingested 1,240 new review signals across footwear & beverage."),
    mk(150, "Operations", "camp-brew", "Auto-scheduled the next Nocturne reel drop for Friday 09:00."),
    mk(220, "Researcher", "camp-brew", "Detected #coldbrewseason velocity +180% — boosted TikTok weighting."),
    mk(310, "Analyst", "camp-choc", "Maison Cacao paused: gift-set inventory backordered; alerted owner."),
    mk(480, "Visual_Director", "camp-watch", "Rendered 3 hero variants for the Aurum draft."),
  ];
}

const persisted = load();

export const useCampaigns = create<CampaignStore>((set, get) => ({
  campaigns: persisted?.campaigns ?? seedCampaigns(),
  activity: persisted?.activity ?? seedActivity(),
  lastSeen: loadSeen(),
  started: false,
  _timer: undefined,

  start: () => {
    if (get().started) return;
    // agents keep working: grow active campaigns + occasionally log activity
    const id = window.setInterval(() => {
      set((s) => {
        const campaigns = s.campaigns.map((c) => {
          if (c.status !== "active") return c;
          const nextReach = Math.round(c.perf.reach * (1 + 0.004 + Math.random() * 0.01));
          const grew = nextReach - c.perf.reach;
          return {
            ...c,
            perf: {
              ...c.perf,
              reach: nextReach,
              engagements: c.perf.engagements + Math.round(grew * 0.04),
              clicks: c.perf.clicks + Math.round(grew * 0.018),
              conversions: c.perf.conversions + (Math.random() < 0.3 ? 1 : 0),
              series: [...c.perf.series.slice(1), nextReach],
            },
          };
        });
        save(campaigns, s.activity);
        return { campaigns };
      });
    }, 3000);
    set({ started: true, _timer: id });
  },

  saveCampaign: (input) => {
    const now = Date.now();
    const id = uid("camp");
    const campaign: Campaign = {
      id,
      name: input.name,
      idea: input.idea,
      presetId: input.presetId,
      status: input.status ?? "active",
      channels: input.channels,
      copy: input.copy,
      hero: input.hero,
      reelVideo: input.reelVideo,
      versions: [{ v: 1, copy: input.copy, note: "Initial campaign", createdAt: now }],
      perf: { reach: 0, engagements: 0, clicks: 0, conversions: 0, series: series(1) },
      createdAt: now,
      updatedAt: now,
    };
    set((s) => {
      const campaigns = [campaign, ...s.campaigns];
      const activity: ActivityEntry[] = [
        { id: actId(), ts: now, agent: "Operations", campaignId: id, message: `Published "${input.name}" to ${input.channels.length} channel${input.channels.length > 1 ? "s" : ""}.` },
        ...s.activity,
      ];
      save(campaigns, activity);
      return { campaigns, activity };
    });
    return id;
  },

  addVersion: (id, copy, note) => {
    const now = Date.now();
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === id
          ? { ...c, copy, versions: [...c.versions, { v: c.versions.length + 1, copy, note, createdAt: now }], updatedAt: now }
          : c
      );
      const target = campaigns.find((c) => c.id === id);
      const activity: ActivityEntry[] = [
        { id: actId(), ts: now, agent: "Copywriter", campaignId: id, message: `Optimized "${target?.name ?? "campaign"}" → v${target?.versions.length}. ${note}` },
        ...s.activity,
      ];
      save(campaigns, activity);
      return { campaigns, activity };
    });
  },

  setStatus: (id, status) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) => (c.id === id ? { ...c, status, updatedAt: Date.now() } : c));
      save(campaigns, s.activity);
      return { campaigns };
    });
  },

  markSeen: () => {
    const t = Date.now();
    try {
      localStorage.setItem(SEEN_KEY, String(t));
    } catch {
      /* ignore */
    }
    set({ lastSeen: t });
  },

  getById: (id) => get().campaigns.find((c) => c.id === id),

  sinceLastSeen: () => {
    // synthetic but believable delta since last visit
    const since = get().lastSeen;
    const hrs = Math.max(0.5, (Date.now() - since) / HOUR);
    const active = get().campaigns.filter((c) => c.status === "active");
    const reach = Math.round(active.reduce((a, c) => a + c.perf.reach, 0) * 0.02 * Math.min(hrs, 12) / 12);
    const conversions = Math.round(active.reduce((a, c) => a + c.perf.conversions, 0) * 0.03 * Math.min(hrs, 12) / 12);
    const topMover = [...active].sort((a, b) => b.perf.reach - a.perf.reach)[0];
    return { reach, conversions, topMover };
  },
}));
