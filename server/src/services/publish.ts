// Publishing + Published gallery. Persists "published" posts per channel with
// an outbound URL to the platform. (Real auto-posting requires platform OAuth
// + app review — out of scope; here publishing is simulated and links open the
// platform. Clearly labeled as such in responses.)
//
// Tools: JsonStore persistence (Node fs).

import { randomUUID } from "node:crypto";
import { JsonStore } from "../lib/store.js";

export type ChannelId = "instagram" | "tiktok" | "web";

export interface PublishedPost {
  id: string;
  campaignId: string;
  channel: ChannelId;
  headline: string;
  body: string;
  cta: string;
  heroSrc: string;
  presetId: string;
  postedAt: number;
  url: string;
  handle: string;
  simulated: true;
  views: number;
  likes: number;
}

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

const store = new JsonStore<PublishedPost[]>("published", []);

export function publishCampaign(args: {
  campaignId: string;
  presetId: string;
  headline: string;
  body: string;
  cta: string;
  heroSrc: string;
  channels: ChannelId[];
}): PublishedPost[] {
  const now = Date.now();
  const fresh: PublishedPost[] = args.channels.map((channel, i) => ({
    id: randomUUID(),
    campaignId: args.campaignId,
    channel,
    headline: args.headline,
    body: args.body,
    cta: args.cta,
    heroSrc: args.heroSrc,
    presetId: args.presetId,
    postedAt: now + i,
    url: CHANNEL_URL[channel],
    handle: CHANNEL_HANDLE[channel],
    simulated: true,
    views: Math.floor(Math.random() * 40000 + 8000),
    likes: Math.floor(Math.random() * 4000 + 400),
  }));
  store.update((s) => [...fresh, ...s]);
  return fresh;
}

export function listPosts(): PublishedPost[] {
  return store.get();
}

export function clearPosts(): void {
  store.set([]);
}
