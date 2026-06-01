import { create } from "zustand";
import type { ChannelId, ImageRef, MarketingCopy } from "../types";
import { play } from "../lib/sound";
import { toast } from "./toastStore";

export interface PublishedPost {
  id: string;
  campaignId: string;
  channel: ChannelId;
  headline: string;
  body: string;
  cta: string;
  hero: ImageRef;
  presetId: string;
  postedAt: number;
  // outbound link to where it would live on the platform
  url: string;
  views: number;
  likes: number;
}

// Where each channel's posts "live". These open the real platform (we can't
// truly post without OAuth + app review, so publishing is simulated and the
// links open the platform home — clearly labeled in the UI).
const CHANNEL_URL: Record<ChannelId, string> = {
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
  web: "https://www.google.com/",
};

const CHANNEL_HANDLE: Record<ChannelId, string> = {
  instagram: "instagram.com/terra.official",
  tiktok: "tiktok.com/@terra.run",
  web: "terra.run/launch",
};

interface PublishStore {
  posts: PublishedPost[];
  publishCampaign: (args: {
    copy: MarketingCopy;
    hero: ImageRef;
    presetId: string;
    channels: ChannelId[];
  }) => void;
  clear: () => void;
}

let pid = 0;

export const channelUrl = (c: ChannelId) => CHANNEL_URL[c];
export const channelHandle = (c: ChannelId) => CHANNEL_HANDLE[c];

// ---------------------------------------------------------------------------
// Seed campaigns — so Published is always a full, living gallery (not empty
// until you run a campaign). These use the curated campaign creatives; the
// carousel loops through them. A real run prepends fresh campaigns on top.
// ---------------------------------------------------------------------------
const HOUR = 3600_000;
interface Seed {
  headline: string;
  body: string;
  cta: string;
  img: string;
  gradient: string;
  presetId: string;
  channels: ChannelId[];
  ageHours: number;
}
const SEED_CAMPAIGNS: Seed[] = [
  {
    headline: "Run Lighter. Tread Kinder.",
    body: "Performance sneakers spun from ocean-bound plastic and plant foam.",
    cta: "Claim Your Pair",
    img: "/campaigns/eco-sneakers.webp",
    gradient: "radial-gradient(120% 120% at 30% 20%, #134e4a 0%, #0f766e 35%, #052e2b 75%)",
    presetId: "eco-sneakers",
    channels: ["tiktok", "instagram", "web"],
    ageHours: 2,
  },
  {
    headline: "Slow Brewed. Fast Living.",
    body: "Small-batch nitro cold brew for people who refuse to slow down.",
    cta: "Taste the Pour",
    img: "/campaigns/cold-brew.webp",
    gradient: "radial-gradient(120% 120% at 70% 20%, #422006 0%, #1c1917 45%, #0c0a09 80%)",
    presetId: "cold-brew",
    channels: ["instagram", "tiktok"],
    ageHours: 6,
  },
  {
    headline: "Indulge, Unapologetically.",
    body: "Single-origin dark chocolate wrapped in gold. No mass-market markup.",
    cta: "Taste the Collection",
    img: "/campaigns/artisan-chocolate.webp",
    gradient: "radial-gradient(120% 120% at 40% 20%, #7c2d12 0%, #422006 40%, #1c1917 82%)",
    presetId: "artisan-chocolate",
    channels: ["instagram", "tiktok", "web"],
    ageHours: 20,
  },
  {
    headline: "Own Every Street.",
    body: "A modern electric city bike built for the dusk commute.",
    cta: "Ride Now",
    img: "/campaigns/electric-bike.webp",
    gradient: "radial-gradient(120% 120% at 60% 20%, #155e75 0%, #1e293b 45%, #020617 82%)",
    presetId: "electric-bike",
    channels: ["tiktok", "web"],
    ageHours: 28,
  },
  {
    headline: "Time, Perfected.",
    body: "A minimalist automatic watch with a sapphire dial.",
    cta: "Discover",
    img: "/campaigns/luxury-watch.webp",
    gradient: "radial-gradient(120% 120% at 50% 10%, #0c4a6e 0%, #1e293b 45%, #020617 82%)",
    presetId: "luxury-watch",
    channels: ["instagram", "web"],
    ageHours: 46,
  },
  {
    headline: "Drink Smarter.",
    body: "A smart bottle that tracks every sip and glows when it's time.",
    cta: "Hydrate",
    img: "/campaigns/smart-water-bottle.webp",
    gradient: "radial-gradient(120% 120% at 50% 15%, #155e75 0%, #0e7490 40%, #042f2e 82%)",
    presetId: "smart-water-bottle",
    channels: ["tiktok", "instagram", "web"],
    ageHours: 70,
  },
];

function buildSeed(): PublishedPost[] {
  const now = Date.now();
  const out: PublishedPost[] = [];
  SEED_CAMPAIGNS.forEach((s, ci) => {
    const postedAt = now - s.ageHours * HOUR;
    s.channels.forEach((channel, i) => {
      out.push({
        id: `seed-${pid++}`,
        campaignId: `seed-camp-${ci}`,
        channel,
        headline: s.headline,
        body: s.body,
        cta: s.cta,
        hero: { src: s.img, alt: s.headline, fallbackGradient: s.gradient },
        presetId: s.presetId,
        postedAt: postedAt + i,
        url: CHANNEL_URL[channel],
        views: Math.floor(Math.random() * 40000 + 12000),
        likes: Math.floor(Math.random() * 4000 + 600),
      });
    });
  });
  return out;
}

export const usePublish = create<PublishStore>((set) => ({
  posts: buildSeed(),
  publishCampaign: ({ copy, hero, presetId, channels }) => {
    play("deploy");
    const now = Date.now();
    const campaignId = `camp-${now}`;
    const fresh: PublishedPost[] = channels.map((channel, i) => ({
      id: `post-${pid++}`,
      campaignId,
      channel,
      headline: copy.headline,
      body: copy.body,
      cta: copy.cta,
      hero,
      presetId,
      postedAt: now + i,
      url: CHANNEL_URL[channel],
      views: Math.floor(Math.random() * 40000 + 8000),
      likes: Math.floor(Math.random() * 4000 + 400),
    }));
    set((s) => ({ posts: [...fresh, ...s.posts] }));
    toast({
      tone: "success",
      title: `Published to ${channels.length} channel${channels.length > 1 ? "s" : ""}`,
      detail: "Your campaign is live. View it in Published.",
      glyph: "↗",
    });
  },
  clear: () => set({ posts: [] }),
}));
