import { create } from "zustand";
import type { ChannelId, ImageRef, MarketingCopy } from "../types";
import { play } from "../lib/sound";

export interface PublishedPost {
  id: string;
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

export const usePublish = create<PublishStore>((set) => ({
  posts: [],
  publishCampaign: ({ copy, hero, presetId, channels }) => {
    play("deploy");
    const now = Date.now();
    const fresh: PublishedPost[] = channels.map((channel, i) => ({
      id: `post-${pid++}`,
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
  },
  clear: () => set({ posts: [] }),
}));
