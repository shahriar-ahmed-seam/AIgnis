import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { usePublish, channelHandle, type PublishedPost } from "../stores/publishStore";
import { useNav } from "../stores/navStore";
import { ChannelIcon } from "../components/ui/ChannelIcon";
import { HeroImage } from "../components/features/HeroImage";
import { CountUp } from "../components/ui/CountUp";
import { play } from "../lib/sound";

const CHANNEL_NAME: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  web: "Web",
};

interface Campaign {
  campaignId: string;
  headline: string;
  body: string;
  cta: string;
  hero: PublishedPost["hero"];
  postedAt: number;
  posts: PublishedPost[];
  views: number;
  likes: number;
}

/**
 * Published — the brand's live campaigns. One card per campaign (a single
 * publish that fanned out to several channels), the creative shown once with
 * the channels it hit as clickable chips and aggregate reach. This mirrors how
 * real publishing tools (Buffer / Later) present a post, instead of repeating
 * the same creative once per channel.
 */
export function PublishedView() {
  const posts = usePublish((s) => s.posts);
  const setSection = useNav((s) => s.setSection);

  // group posts into campaigns (newest first)
  const campaigns = useMemo<Campaign[]>(() => {
    const map = new Map<string, Campaign>();
    for (const p of posts) {
      const key = p.campaignId ?? `${p.headline}-${p.postedAt}`;
      const c = map.get(key);
      if (c) {
        c.posts.push(p);
        c.views += p.views;
        c.likes += p.likes;
      } else {
        map.set(key, {
          campaignId: key,
          headline: p.headline,
          body: p.body,
          cta: p.cta,
          hero: p.hero,
          postedAt: p.postedAt,
          posts: [p],
          views: p.views,
          likes: p.likes,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.postedAt - a.postedAt);
  }, [posts]);

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="Published"
        subtitle="Your live campaigns across every channel"
        pillar="Cross-channel publishing"
      />

      {campaigns.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl text-ink-600">↗</div>
          <h3 className="font-display text-xl font-bold text-ink-100">Nothing published yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-300">
            Forge a campaign in the Studio, then publish it to see your live posts here with
            direct links to each platform.
          </p>
          <button onClick={() => setSection("studio")} className="btn-primary mt-5">
            Go to Campaign Studio
          </button>
        </div>
      ) : (
        <CampaignCarousel campaigns={campaigns} />
      )}

      <p className="mt-4 flex items-center gap-2 font-mono text-[10px] leading-relaxed text-ink-600">
        <span className="h-1 w-1 rounded-full bg-ink-700" />
        Prototype — links open each platform; live posting needs platform OAuth + app review.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Auto-sliding 3-up carousel. Advances right→left and loops; any    */
/* click/hover pauses it for a while so the user can read/click,     */
/* then it resumes on its own.                                       */
/* ---------------------------------------------------------------- */
function CampaignCarousel({ campaigns }: { campaigns: Campaign[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number>();
  const n = campaigns.length;

  // how many cards are visible (responsive); window of `perView`
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 900 ? 1 : w < 1280 ? 2 : 3);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // auto-advance one card at a time
  useEffect(() => {
    if (paused || n <= perView) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), 3200);
    return () => window.clearInterval(id);
  }, [paused, n, perView]);

  // pause helper — pauses, then schedules a resume
  const pauseAwhile = (ms = 7000) => {
    setPaused(true);
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), ms);
  };
  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const go = (dir: number) => {
    setIndex((i) => (i + dir + n) % n);
    pauseAwhile();
  };

  // build the visible window (wraps around) as a render list
  const windowCards = Array.from({ length: Math.min(perView, n) }, (_, k) => {
    const c = campaigns[(index + k) % n];
    return c;
  });

  const cardBasis = perView === 1 ? "100%" : perView === 2 ? "calc(50% - 10px)" : "calc(33.333% - 14px)";

  return (
    <div
      className="relative flex-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* arrows */}
      {n > perView && (
        <>
          <button
            onClick={() => { play("tick"); go(-1); }}
            aria-label="Previous"
            className="absolute -left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-void-800/70 text-ink-200 backdrop-blur-md transition-colors hover:border-white/30 hover:text-ink-100"
          >
            ‹
          </button>
          <button
            onClick={() => { play("tick"); go(1); }}
            aria-label="Next"
            className="absolute -right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-void-800/70 text-ink-200 backdrop-blur-md transition-colors hover:border-white/30 hover:text-ink-100"
          >
            ›
          </button>
        </>
      )}

      {/* sliding window */}
      <div className="flex gap-5 overflow-hidden pb-2 pt-1">
        <AnimatePresence initial={false} mode="popLayout">
          {windowCards.map((c) => (
            <motion.div
              key={c.campaignId}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{ flex: `0 0 ${cardBasis}` }}
            >
              <CampaignCard campaign={c} onInteract={() => pauseAwhile()} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* progress dots */}
      {n > perView && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {campaigns.map((_, i) => {
            const isActive = i === index;
            return (
              <button
                key={i}
                aria-label={`Go to campaign ${i + 1}`}
                onClick={() => { setIndex(i); pauseAwhile(); play("tick"); }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 24 : 8,
                  background: isActive ? "linear-gradient(90deg,#22d3ee,#a78bfa)" : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, onInteract }: { campaign: Campaign; onInteract?: () => void }) {
  const primary = campaign.posts[0];

  return (
    <div className="panel group flex h-full flex-col overflow-hidden">
      {/* creative — shown once, 16:10 letterbox so cards stay compact & uniform */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <HeroImage image={campaign.hero} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {/* channels it shipped to (top-left chips) */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {campaign.posts.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 backdrop-blur"
              title={CHANNEL_NAME[p.channel]}
            >
              <ChannelIcon id={p.channel} size={14} />
            </span>
          ))}
        </div>

        {/* live badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-lime/30 bg-black/45 px-2.5 py-1 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-lime">live</span>
        </div>

        {/* headline overlaid on the creative */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="font-display text-lg font-bold leading-tight text-white drop-shadow">
            {campaign.headline}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-4">
        {/* aggregate reach */}
        <div className="grid grid-cols-2 gap-3">
          <div className="inset p-2.5">
            <div className="label-mono">Total reach</div>
            <div className="mt-1 font-display text-lg font-bold text-ink-100">
              <CountUp value={campaign.views} format />
            </div>
          </div>
          <div className="inset p-2.5">
            <div className="label-mono">Engagement</div>
            <div className="mt-1 font-display text-lg font-bold text-ink-100">
              <CountUp value={campaign.likes} format />
            </div>
          </div>
        </div>

        {/* per-channel open links */}
        <div className="mt-3 space-y-1.5">
          {campaign.posts.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { play("tick"); onInteract?.(); }}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
            >
              <ChannelIcon id={p.channel} size={20} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-ink-200">{CHANNEL_NAME[p.channel]}</div>
                <div className="truncate font-mono text-[10px] text-ink-500">
                  {channelHandle(p.channel)}
                </div>
              </div>
              <span className="font-mono text-[10px] text-violet-glow opacity-0 transition-opacity group-hover:opacity-100">
                open ↗
              </span>
            </a>
          ))}
        </div>

        {/* footer */}
        <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[10px] text-ink-500">
            {timeAgo(campaign.postedAt)}
          </span>
          <span className="font-mono text-[10px] text-ink-500">
            {campaign.posts.length} channel{campaign.posts.length > 1 ? "s" : ""}
            {primary ? ` · ${CHANNEL_NAME[primary.channel]} lead` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
