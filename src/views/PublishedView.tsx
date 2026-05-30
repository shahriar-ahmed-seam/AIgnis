import { motion } from "framer-motion";
import { SectionHeader } from "./GraphView";
import { usePublish, channelHandle } from "../publishStore";
import { useNav } from "../navStore";
import { ChannelIcon } from "../components/ChannelIcon";
import { HeroImage } from "../components/HeroImage";
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
        <div className="grid flex-1 grid-cols-3 gap-5 overflow-y-auto pb-2">
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
              className="panel panel-hover group flex flex-col overflow-hidden"
            >
              {/* preview */}
              <div className="relative h-44 overflow-hidden">
                <HeroImage image={post.hero} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur">
                  <ChannelIcon id={post.channel} size={16} />
                  <span className="font-mono text-[10px] text-white/90">
                    {CHANNEL_NAME[post.channel]}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="line-clamp-2 font-display text-sm font-bold text-white drop-shadow">
                    {post.headline}
                  </div>
                </div>
              </div>

              {/* meta */}
              <div className="flex flex-1 flex-col p-4">
                <div className="font-mono text-[10px] text-ink-500">{channelHandle(post.channel)}</div>
                <div className="mt-2 flex items-center gap-4 text-xs text-ink-300">
                  <span>👁 {post.views.toLocaleString()}</span>
                  <span>♥ {post.likes.toLocaleString()}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="font-mono text-[10px] text-ink-500">
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
      )}

      <p className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-[10px] leading-relaxed text-ink-500">
        Note: live posting to TikTok/Instagram requires platform OAuth + app review. In this
        prototype, publishing is simulated and links open each platform's site.
      </p>
    </div>
  );
}
