import { motion } from "framer-motion";
import { Wordmark } from "../components/layout/BrandMark";
import { useScreen } from "../stores/screenStore";
import { play, primeAudio } from "../lib/sound";

/**
 * Public marketing landing — the first screen any visitor sees (no app shell).
 * Communicates the product, shows the pillars, and routes to auth.
 */
export function WelcomeView() {
  const goAuth = useScreen((s) => s.goAuth);

  const start = (mode: "login" | "register") => {
    primeAudio();
    play("tick");
    goAuth(mode);
  };

  return (
    <div className="relative z-10 min-h-screen overflow-y-auto">
      {/* top nav */}
      <header className="flex items-center justify-between px-8 py-5">
        <Wordmark />
        <div className="flex items-center gap-3">
          <button onClick={() => start("login")} className="btn-ghost text-sm">
            Log in
          </button>
          <button onClick={() => start("register")} className="btn-primary text-sm">
            Get started
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="flex flex-col items-center px-6 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_#22d3ee]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-300">
            Autonomous Multimodal Marketing Engine
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="max-w-5xl font-display text-7xl font-extrabold leading-[1.04] tracking-tight text-balance"
        >
          One idea in. <br />
          <span className="text-gradient">A whole campaign</span> out.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mt-7 max-w-2xl text-xl leading-relaxed text-ink-300"
        >
          AIgnis deploys a swarm of specialized AI agents that research your market, write
          your copy, render your creative, and optimize the launch — autonomously.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-9 flex items-center gap-4"
        >
          <button onClick={() => start("register")} className="btn-primary px-8 py-3.5 text-base">
            Start free →
          </button>
          <button onClick={() => start("login")} className="btn-ghost px-6 py-3.5 text-base">
            I have an account
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 font-mono text-xs text-ink-500"
        >
          No credit card · free Starter tier · ~60s to your first campaign
        </motion.div>
      </section>

      {/* pillar cards */}
      <section className="mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-5 px-6 md:grid-cols-3 lg:grid-cols-5">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="panel panel-hover p-5"
          >
            <div className="text-2xl" style={{ color: p.color }}>
              {p.glyph}
            </div>
            <div className="mt-3 text-sm font-bold text-ink-100">{p.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-ink-300">{p.desc}</div>
          </motion.div>
        ))}
      </section>

      {/* how it works */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <h2 className="text-center font-display text-3xl font-bold text-ink-100">
          From prompt to published in four moves
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative panel p-5"
            >
              <div className="font-display text-3xl font-extrabold text-gradient">0{i + 1}</div>
              <div className="mt-2 text-sm font-bold text-ink-100">{s.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-300">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto my-24 max-w-3xl px-6 text-center">
        <div className="panel glow-violet p-10">
          <h2 className="font-display text-4xl font-extrabold text-balance">
            Ready to forge your first campaign?
          </h2>
          <p className="mt-3 text-ink-300">Free to start. Your launch is one prompt away.</p>
          <button onClick={() => start("register")} className="btn-primary mt-7 px-8 py-3.5 text-base">
            Create your account →
          </button>
        </div>
        <div className="mt-8 font-mono text-[11px] text-ink-500">
          Prototype · AIgnis — Multimodal Content Engine
        </div>
      </section>
    </div>
  );
}

const PILLARS = [
  { glyph: "◈", title: "MCP", color: "#a78bfa", desc: "Secure access to your live inventory & brand rules." },
  { glyph: "◎", title: "RAG", color: "#22d3ee", desc: "Grounded market & sentiment intelligence." },
  { glyph: "❖", title: "Diffusion", color: "#fb923c", desc: "On-brand hero creative, rendered to spec." },
  { glyph: "⬡", title: "Agentic", color: "#a3e635", desc: "A stateful swarm that runs the whole loop." },
  { glyph: "✦", title: "LLM", color: "#f472b6", desc: "Brand voice, narrative & messaging." },
];

const STEPS = [
  { title: "Describe it", desc: "Type or speak a raw product idea." },
  { title: "Watch the swarm", desc: "Five agents research, write & design live." },
  { title: "Get the creative", desc: "Copy + hero image + channel-ready reels." },
  { title: "Publish & optimize", desc: "Ship to channels, then self-optimize." },
];
