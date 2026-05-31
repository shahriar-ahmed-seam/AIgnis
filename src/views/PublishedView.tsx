import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { usePublish, channelHandle } from "../stores/publishStore";
import { useNav } from "../stores/navStore";
import { ChannelIcon } from "../components/ui/ChannelIcon";
import { HeroImage } from "../components/features/HeroImage";
import { play } from "../lib/sound";

const CHANNEL_NAME: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  web: "Web",
};

/**
 * Published — the user's live posts. Each card links OUT to the platform where
 * it lives. (Actually posting needs OAuth + platform app review, so publishing
 * is simulated; links open the platform — labeled honestly.)
 */
export function PublishedView() {
  const posts = usePublish((s) => s.posts);
  const setSection = useNav((s) => s.setSection);

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <SectionHeader
        title="Published"
        subtitle="Your live posts across channels · open each one on its platform"
        pillar="Cross-channel publishing"
      />

      {posts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl opacity-40">📡</div>
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
        <div className="flex flex-1 items-center overflow-y-auto pb-2">
          <div className="grid w-full grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => play("tick")}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="panel panel-hover group relative mx-auto aspect-[9/16] w-full max-h-[calc(100vh-180px)] overflow-hidden"
              >
                {/* the posted reel — full 9:16 */}
                <HeroImage image={post.hero} />

                {/* scrims for legibility (top + bottom) */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* channel badge */}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur">
                  <ChannelIcon id={post.channel} size={16} />
                  <span className="font-mono text-[10px] text-white/90">
                    {CHANNEL_NAME[post.channel]}
                  </span>
                </div>

                {/* overlaid post info at the bottom */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="font-display text-lg font-bold leading-tight text-white drop-shadow">
                    {post.headline}
                  </div>
                  <div className="mt-2 font-mono text-[10px] text-white/60">
                    {channelHandle(post.channel)}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-white/85">
                    <span>👁 {post.views.toLocaleString()}</span>
                    <span>♥ {post.likes.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-mono text-[10px] text-white/50">
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-violet-glow transition-transform group-hover:translate-x-0.5">
                      Open on platform ↗
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-[10px] leading-relaxed text-ink-500">
        Note: live posting to TikTok/Instagram requires platform OAuth + app review. In this
        prototype, publishing is simulated and links open each platform's site.
      </p>
    </div>
  );
}
