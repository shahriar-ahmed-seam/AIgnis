import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "../components/layout/BrandMark";
import { useScreen } from "../stores/screenStore";
import { play, primeAudio } from "../lib/sound";

/**
 * Public marketing landing — the first screen any visitor sees (no app shell).
 * Premium SaaS layout: hero with a live product preview, trust band, agent
 * showcase, feature blocks, metrics, testimonials, and a final CTA.
 */
export function WelcomeView() {
  const goAuth = useScreen((s) => s.goAuth);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById("welcome-scroll");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 12);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (mode: "login" | "register") => {
    primeAudio();
    play("tick");
    goAuth(mode);
  };

  return (
    <div id="welcome-scroll" className="relative z-10 h-screen overflow-y-auto">
      {/* sticky nav */}
      <header
        className={`sticky top-0 z-30 transition-colors duration-300 ${
          scrolled ? "border-b border-white/[0.06] bg-void-900/70 backdrop-blur-md" : ""
        }`}
      >
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-8">
          {/* left: brand */}
          <Wordmark />

          {/* center: nav links (truly centered) */}
          <nav className="hidden items-center justify-center gap-10 md:flex">
            {["Product", "Agents", "How it works", "Gallery", "Pricing"].map((l) => (
              <a
                key={l}
                href={`#${l.replace(/\s+/g, "-").toLowerCase()}`}
                className="group relative text-sm font-medium text-ink-300 transition-colors hover:text-ink-100"
              >
                {l}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-cyan to-violet transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* right: log in — continuously flowing gradient text */}
          <div className="flex items-center justify-end">
            <button onClick={() => go("login")} className="group flex items-center gap-2">
              <span className="text-gradient-flow animate-gradient-flow text-sm font-bold tracking-wide">
                Log in
              </span>
              <span className="text-gradient-flow animate-gradient-flow text-sm font-bold transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-12 px-8 pt-16 lg:grid-cols-[1fr_0.92fr] lg:pt-20">
        <div className="flex flex-col items-start justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5"
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
            className="font-display text-6xl font-extrabold leading-[1.04] tracking-tight text-balance lg:text-7xl"
          >
            One idea in.
            <br />
            <span className="text-gradient-flow animate-gradient-flow">A whole campaign</span> out.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300"
          >
            Describe a product in a sentence. A swarm of specialized AI agents researches the
            market, writes the copy, renders the creative, cuts the video, and ships it — then
            reads the results and improves itself.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-10"
          >
            {/* boxless innovative CTA: big text + animated gradient underline +
                a circular arrow that fills on hover */}
            <button onClick={() => go("login")} className="group inline-flex items-center gap-4">
              <span className="relative font-display text-2xl font-bold text-ink-100">
                Start free
                <span className="absolute -bottom-1.5 left-0 h-[3px] w-full origin-left scale-x-100 rounded-full bg-gradient-to-r from-cyan via-violet to-magenta" />
                <span className="absolute -bottom-1.5 left-0 h-[3px] w-full origin-left scale-x-0 rounded-full bg-white/80 transition-transform duration-500 group-hover:scale-x-100" />
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-lg text-ink-100 transition-colors duration-300 group-hover:border-transparent">
                <span className="absolute inset-0 scale-0 rounded-full bg-gradient-to-br from-cyan to-violet opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.36 }}
            className="mt-6 font-mono text-xs text-ink-500"
          >
            No credit card · free Starter tier · ~60s to your first campaign
          </motion.div>
        </div>

        {/* hero product preview */}
        <HeroPreview />
      </section>

      {/* stats — open inline row, no box */}
      <section className="mx-auto mt-24 max-w-5xl px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:justify-between">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-baseline gap-3"
            >
              <span className="font-display text-5xl font-extrabold text-gradient">{s.value}</span>
              <span className="max-w-[7rem] font-mono text-[10px] uppercase leading-tight tracking-[0.15em] text-ink-500">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* trusted-by row */}
        <div className="mt-16 flex flex-col items-center gap-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-600">
            Trusted by lean teams
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {BRANDS.map((b) => (
              <span key={b} className="font-display text-lg font-bold text-ink-500 transition-colors hover:text-ink-300">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* agents */}
      <section id="agents" className="mx-auto mt-28 max-w-6xl scroll-mt-28 px-8">
        <div className="text-center">
          <SectionEyebrow center>The swarm</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink-100">
            Five specialists. One autonomous team.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-300">
            Each agent owns a step and hands off to the next — research to analysis to copy to
            creative to launch — with no human in the loop.
          </p>
        </div>

        <AgentNetwork />
      </section>

      {/* feature blocks */}
      <section id="product" className="mx-auto mt-28 max-w-6xl scroll-mt-28 space-y-20 px-8">
        {FEATURES.map((f, i) => (
          <FeatureBlock key={f.title} feature={f} flip={i % 2 === 1} />
        ))}
      </section>

      {/* how it works */}
      <section id="how-it-works" className="mx-auto mt-28 max-w-6xl scroll-mt-28 px-8">
        <div className="text-center">
          <SectionEyebrow center>The flow</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink-100">
            From prompt to published in four moves
          </h2>
        </div>
        <FlowTimeline />
      </section>

      {/* results gallery */}
      <section id="gallery" className="mx-auto mt-28 max-w-6xl scroll-mt-28 px-8">
        <div className="text-center">
          <SectionEyebrow center>Made with AIgnis</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink-100">
            Real campaigns. Yours to download.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-300">
            Every still and reel below was generated end-to-end by the swarm — copy, creative
            and cut. Grab any one and drop it straight into your channels.
          </p>
        </div>
        <ShowcaseGallery />
      </section>

      {/* testimonials */}
      <section className="mx-auto mt-28 max-w-6xl px-8">
        <div className="text-center">
          <SectionEyebrow center>Loved by founders</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink-100">
            Campaigns that used to take weeks
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              // organic stagger — lift the middle quote
              className={`relative ${i === 1 ? "md:-translate-y-8" : ""}`}
            >
              {/* oversized gradient quote mark */}
              <span
                className="pointer-events-none absolute -left-2 -top-10 select-none font-display text-[110px] leading-none text-transparent"
                style={{ WebkitTextStroke: "1px rgba(167,139,250,0.25)" }}
                aria-hidden
              >
                &ldquo;
              </span>
              {/* accent line */}
              <span
                className="absolute left-0 top-1 h-[calc(100%-3rem)] w-px"
                style={{ background: `linear-gradient(to bottom, ${t.color}, transparent)` }}
              />
              <blockquote className="relative pl-6 text-lg font-medium leading-relaxed text-ink-100">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pl-6">
                <TestimonialAvatar t={t} />
                <div>
                  <div className="text-sm font-semibold text-ink-100">{t.name}</div>
                  <div className="font-mono text-[10px] text-ink-500">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* final CTA — interactive forge moment */}
      <section id="pricing" className="scroll-mt-28">
        <ForgeCTA onForge={() => go("login")} />
      </section>

      {/* footer */}
      <footer className="border-t border-white/[0.06] px-8 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <Wordmark />
          <div className="font-mono text-[11px] text-ink-500">
            AIgnis · Team AInigma · Infinity AI BuildFest 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Forge CTA — an interactive "forge" moment: a prompt console with  */
/* self-typing rotating ideas, a pulsing energy core, and a Forge    */
/* button that erupts in sparks before launching to signup.          */
/* ---------------------------------------------------------------- */
const FORGE_IDEAS = [
  "eco-friendly sneakers for city runners",
  "small-batch nitro cold brew",
  "an AI fitness coaching app",
  "a vitamin-C skincare serum",
  "noise-cancelling focus headphones",
];

const PLANS = [
  { name: "Starter", price: "$0", unit: "free forever", tagline: "5 campaigns/mo · core agents", featured: false },
  { name: "Pro", price: "$79", unit: "/mo", tagline: "Unlimited · video + voice + optimize", featured: true },
  { name: "Agency", price: "$349", unit: "/mo", tagline: "Teams · MCP connectors · white-label", featured: false },
];

function ForgeCTA({ onForge }: { onForge: () => void }) {
  const [typed, setTyped] = useState("");
  const [igniting, setIgniting] = useState(false);

  // self-typing rotating ideas
  useEffect(() => {
    if (igniting) return;
    let idea = 0;
    let char = 0;
    let deleting = false;
    let timer: number;

    const tick = () => {
      const full = FORGE_IDEAS[idea];
      if (!deleting) {
        char++;
        setTyped(full.slice(0, char));
        if (char === full.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1600);
          return;
        }
      } else {
        char--;
        setTyped(full.slice(0, char));
        if (char === 0) {
          deleting = false;
          idea = (idea + 1) % FORGE_IDEAS.length;
        }
      }
      timer = window.setTimeout(tick, deleting ? 35 : 55);
    };
    timer = window.setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [igniting]);

  const forge = () => {
    setIgniting(true);
    play("optimize");
    window.setTimeout(() => onForge(), 1100);
  };

  return (
    <div className="relative mx-auto my-32 max-w-4xl px-8 text-center">
      {/* ambient forge glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(232,121,249,0.25), rgba(139,92,246,0.15) 50%, transparent 72%)" }}
        animate={{ scale: igniting ? [1, 1.5] : [1, 1.12, 1], opacity: igniting ? [0.6, 1] : [0.5, 0.75, 0.5] }}
        transition={{ duration: igniting ? 1 : 6, repeat: igniting ? 0 : Infinity, ease: "easeInOut" }}
      />

      <SectionEyebrow center>Your turn</SectionEyebrow>
      <h2 className="mx-auto mt-4 max-w-2xl font-display text-5xl font-extrabold leading-[1.05] text-balance">
        Forge your first <span className="text-gradient">campaign</span> now.
      </h2>

      {/* the forge console — a faux prompt that types ideas itself */}
      <div className="relative mx-auto mt-10 max-w-2xl">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-void-800/60 px-5 py-4 backdrop-blur-md">
          <span className="font-mono text-lg text-violet-glow">›</span>
          <span className="flex-1 text-left font-mono text-base text-ink-100">
            {typed}
            <span className="ml-0.5 inline-block h-5 w-[2px] -translate-y-0.5 animate-pulse bg-cyan align-middle" />
          </span>
        </div>

        {/* spark burst on ignite */}
        <AnimatePresence>
          {igniting && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const dist = 120 + (i % 4) * 30;
                return (
                  <motion.span
                    key={i}
                    className="absolute h-1.5 w-1.5 rounded-full"
                    style={{ background: ["#5ce8ff", "#a78bfa", "#e879f9", "#a3e635"][i % 4] }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.2 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* forge button */}
      <motion.button
        onClick={forge}
        disabled={igniting}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="group relative mt-9 overflow-hidden rounded-full px-10 py-4 font-display text-lg font-bold text-void-900"
        style={{ background: "linear-gradient(120deg,#5ce8ff,#a78bfa 50%,#e879f9)" }}
      >
        <span className="relative z-10 flex items-center gap-2">
          {igniting ? "Igniting…" : "⚒  Forge my campaign"}
        </span>
        {/* sheen */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {/* glow */}
        <span className="absolute -inset-1 -z-10 rounded-full bg-violet/50 opacity-60 blur-lg transition-opacity group-hover:opacity-100" />
      </motion.button>

      <div className="mt-3 font-mono text-[11px] text-ink-500">Free to start · no credit card</div>

      {/* prominent pricing */}
      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-2xl border p-6 text-left transition-colors ${
              p.featured
                ? "border-violet/40 bg-violet/[0.07]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-gradient-to-r from-cyan to-violet px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-void-900">
                Most popular
              </span>
            )}
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">{p.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-ink-100">{p.price}</span>
              <span className="text-sm text-ink-500">{p.unit}</span>
            </div>
            <div className="mt-1 text-xs text-ink-400">{p.tagline}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Flow timeline — a particle travels the line; each step is a small */
/* 3D card that rotates like a cylinder (front face = the step's     */
/* glyph). As the particle hits a node, a big ghost number pops       */
/* toward the viewer and fades.                                       */
/* ---------------------------------------------------------------- */
function FlowTimeline() {
  const n = STEPS.length;
  const [reached, setReached] = useState(-1);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      setReached(i);
      i = (i + 1) % n;
    };
    tick();
    const id = window.setInterval(tick, 1600);
    return () => clearInterval(id);
  }, [n]);

  return (
    <div className="relative mt-24">
      {/* connecting line + travelling particle */}
      <div className="absolute left-0 right-0 top-7 hidden h-px md:block">
        <div className="h-full w-full bg-gradient-to-r from-cyan/0 via-violet/50 to-lime/0" />
        <motion.span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_14px_#22d3ee]"
          animate={{ left: ["6%", "94%"] }}
          transition={{ duration: n * 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-4 md:gap-6" style={{ perspective: 900 }}>
        {STEPS.map((s, i) => {
          const hit = reached === i;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* rotating 3D card node */}
              <div className="relative mb-7 flex justify-center md:justify-start" style={{ perspective: 600 }}>
                <motion.div
                  className="relative z-10 h-14 w-14"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: hit ? [0, 360] : 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                >
                  {/* front face */}
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl border bg-void-800/90 text-xl"
                    style={{
                      backfaceVisibility: "hidden",
                      borderColor: hit ? `${s.color}99` : "rgba(255,255,255,0.12)",
                      color: s.color,
                      boxShadow: hit ? `0 0 22px -4px ${s.color}` : "none",
                    }}
                  >
                    {s.glyph}
                  </div>
                  {/* back face (shown mid-rotation) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl border bg-void-700/90 font-mono text-sm font-bold text-ink-200"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: "rgba(255,255,255,0.12)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </motion.div>
              </div>

              {/* big ghost number that pops toward the viewer when hit */}
              <motion.span
                key={`${i}-${reached}`}
                className="pointer-events-none absolute -top-16 left-1/2 -z-10 -translate-x-1/2 font-display text-[150px] font-extrabold leading-none md:left-0 md:translate-x-0"
                initial={false}
                animate={
                  hit
                    ? { scale: [0.6, 1.5], opacity: [0, 0.85, 0], filter: ["blur(10px)", "blur(0px)", "blur(12px)"] }
                    : { scale: 0.6, opacity: 0 }
                }
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ color: `${s.color}40` }}
              >
                {i + 1}
              </motion.span>

              <div className="text-center md:text-left">
                <div className="font-display text-lg font-bold text-ink-100">{s.title}</div>
                <div className="mt-1.5 text-sm leading-relaxed text-ink-400">{s.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Hero product preview — an animated mini "campaign" mockup card    */
/* that cycles through different product scenarios.                  */
/* ---------------------------------------------------------------- */
function HeroPreview() {
  const agents = AGENTS;
  const [scenario, setScenario] = useState(0);
  const [active, setActive] = useState(0);

  const current = HERO_SCENARIOS[scenario];
  const done = active >= agents.length;

  useEffect(() => {
    // step through the agents; once done, hold briefly then advance scenario
    if (active < agents.length) {
      const id = window.setTimeout(() => setActive((a) => a + 1), 1000);
      return () => clearTimeout(id);
    }
    const hold = window.setTimeout(() => {
      setScenario((s) => (s + 1) % HERO_SCENARIOS.length);
      setActive(0);
    }, 3200);
    return () => clearTimeout(hold);
  }, [active, agents.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative flex h-full min-h-[480px] flex-col rounded-3xl border border-white/[0.06] bg-white/[0.008] p-6 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 90px -30px rgba(0,0,0,0.8)" }}
    >
      {/* soft inner glass highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />

      {/* window chrome */}
      <div className="relative mb-5 flex items-center gap-2">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-magenta/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-lime/70" />
        </span>
        <span className="ml-2 font-mono text-xs text-ink-500">aignis · campaign run</span>
      </div>

      {/* two columns, equal height: transparent console (left) + 9:16 creative (right) */}
      <div className="relative grid flex-1 grid-cols-[1fr_minmax(190px,46%)] items-stretch gap-5">
        {/* left column — boxless: gradient agent names + animated check signs */}
        <div className="flex min-w-0 flex-col">
          {/* prompt line (no box) */}
          <div className="font-mono text-xs leading-relaxed text-ink-300">
            <span className="text-violet-glow">› </span>
            {current.prompt}
          </div>
          <div className="mt-2 h-px w-full bg-gradient-to-r from-violet/40 via-white/10 to-transparent" />

          {/* agent rail — no boxes, gradient names, animated signs */}
          <div className="mt-4 flex flex-1 flex-col justify-between">
            {agents.map((a, i) => {
              const state = i < active ? "done" : i === active ? "active" : "idle";
              return (
                <div
                  key={a.name}
                  className="flex flex-1 items-center gap-3 transition-opacity duration-300"
                  style={{ opacity: state === "idle" ? 0.4 : 1 }}
                >
                  <span className="text-lg" style={{ color: a.color }}>
                    {a.glyph}
                  </span>
                  <span
                    className="flex-1 text-sm font-bold"
                    style={{
                      background: `linear-gradient(90deg, ${a.color}, #ffffff)`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      color: "transparent",
                    }}
                  >
                    {a.name}
                  </span>
                  {state === "done" && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 16 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: a.color, color: "#05060a" }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {state === "active" && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-transparent"
                      style={{ borderTopColor: a.color, borderRightColor: a.color }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* right column: 9:16 campaign creative fills full height */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08]">
          {done ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img
                src={current.image}
                alt={current.headline}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
                }}
                className="h-full w-full object-cover"
              />
              <div className="hidden h-full w-full" style={{ background: current.gradient }} />
              {/* copy overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-display text-lg font-bold leading-tight text-white drop-shadow">
                  {current.headline}
                </div>
                <div className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-white/60">
                  copy · image · reels
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: current.gradient }}>
              <span
                className="h-6 w-6 animate-spin rounded-full border-[2px] border-transparent"
                style={{ borderTopColor: "#ffffffaa", borderRightColor: "#ffffffaa" }}
              />
              <span className="px-2 text-center font-mono text-[10px] text-white/70">composing…</span>
            </div>
          )}
        </div>
      </div>

      {/* floating mode badge */}
      <div className="absolute right-6 top-6 z-10 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-lime">
        ● live
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* Agent network — a living pipeline: 5 large nodes each wrapped in  */
/* a rotating glowing gradient ring, connected by animated edges     */
/* with a travelling light pulse. No container box.                  */
/* ---------------------------------------------------------------- */
function AgentNetwork() {
  const [active, setActive] = useState(0);
  const n = AGENTS.length;

  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % n), 1800);
    return () => clearInterval(id);
  }, [n]);

  const W = 1000;
  const H = 300;
  const margin = 110;
  const step = (W - margin * 2) / (n - 1);
  const pos = AGENTS.map((_, i) => ({ x: margin + i * step, y: 130 }));

  return (
    <div className="relative mt-12">
      <Particles />

      <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full" style={{ height: 320 }}>
        <defs>
          <linearGradient id="net-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
          <filter id="net-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* per-agent conic-style gradient for the rotating ring */}
          {AGENTS.map((a) => (
            <linearGradient id={`ring-${a.pillar}`} key={a.pillar} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={a.color} stopOpacity="1" />
              <stop offset="55%" stopColor={a.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* base edges */}
        {pos.slice(0, -1).map((p, i) => {
          const q = pos[i + 1];
          const lit = i < active;
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={lit ? "url(#net-edge)" : "rgba(255,255,255,0.10)"}
              strokeWidth={lit ? 2 : 1}
              strokeDasharray="4 6"
            >
              {lit && (
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />
              )}
            </line>
          );
        })}

        {/* travelling pulse */}
        {active > 0 && (
          <motion.circle
            r="5"
            fill="#5ce8ff"
            filter="url(#net-glow)"
            animate={{ cx: [pos[active - 1].x, pos[active].x], cy: [pos[active - 1].y, pos[active].y] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* nodes */}
        {AGENTS.map((a, i) => {
          const p = pos[i];
          const isActive = i === active;
          const isDone = i < active;
          const R = 42; // bigger nodes
          return (
            <g key={a.name} transform={`translate(${p.x}, ${p.y})`}>
              {/* outer ambient glow */}
              <circle r={R + 18} fill={a.color} opacity={isActive ? 0.18 : 0.06} filter="url(#net-glow)" />

              {/* rotating gradient ring (always on, faster when active) */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to="360"
                  dur={isActive ? "2.4s" : "6s"}
                  repeatCount="indefinite"
                />
                <circle
                  r={R + 7}
                  fill="none"
                  stroke={`url(#ring-${a.pillar})`}
                  strokeWidth={isActive ? 4 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * (R + 7) * 0.7} ${2 * Math.PI * (R + 7)}`}
                />
              </g>

              {/* expanding pulse ring when active */}
              {isActive && (
                <circle r={R} fill="none" stroke={a.color} strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values={`${R};${R + 22};${R}`} dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* node body */}
              <motion.circle
                r={R}
                fill={`${a.color}1a`}
                stroke={a.color}
                strokeWidth={isActive ? 2.6 : 1.6}
                animate={{ opacity: isDone && !isActive ? 0.85 : 1 }}
                style={{ filter: isActive ? `drop-shadow(0 0 16px ${a.color})` : "none" }}
              />
              <text textAnchor="middle" dy="9" style={{ fontSize: 30, fill: a.color }}>
                {a.glyph}
              </text>

              {/* labels below */}
              <text textAnchor="middle" dy={R + 30} className="fill-ink-100" style={{ fontSize: 15, fontWeight: 700 }}>
                {a.name}
              </text>
              <text textAnchor="middle" dy={R + 48} style={{ fontSize: 11, fill: a.color, fontFamily: "JetBrains Mono", letterSpacing: 1.5 }}>
                {a.pillar}
              </text>
            </g>
          );
        })}
      </svg>

      {/* active agent description */}
      <div className="mt-2 h-12 text-center">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-xl text-base text-ink-300"
        >
          <span className="font-semibold" style={{ color: AGENTS[active].color }}>
            {AGENTS[active].name}
          </span>{" "}
          — {AGENTS[active].desc}
        </motion.p>
      </div>
    </div>
  );
}

/** Subtle drifting connection-dots layer behind the network. */
function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 53) % 100}%`,
    top: `${(i * 37) % 100}%`,
    dur: 6 + (i % 5),
    delay: (i % 7) * 0.4,
    size: 2 + (i % 3),
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-cyan/40"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{ y: [0, -14, 0], opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Showcase gallery — a coverflow slideshow of finished campaign      */
/* creatives: a mix of stills and reels. Center item is enlarged and  */
/* (for reels) autoplays; neighbours fan back in perspective. Each    */
/* slide is downloadable — image or MP4.                              */
/* ---------------------------------------------------------------- */
function ShowcaseGallery() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const items = SHOWCASE.filter((s) => s.kind === mode);
  const [idx, setIdx] = useState(0);
  const n = items.length;

  // reset to first slide when switching mode
  useEffect(() => setIdx(0), [mode]);

  // auto-advance, pause on hover
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % n), 4600);
    return () => clearInterval(id);
  }, [paused, n]);

  const go = (dir: number) => setIdx((i) => (i + dir + n) % n);
  const active = items[idx] ?? items[0];

  return (
    <div
      className="relative mt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* mode switch — campaign stills vs reels */}
      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1 backdrop-blur-sm">
          {([
            { k: "image", label: "Campaign stills" },
            { k: "video", label: "Reels" },
          ] as const).map((t) => {
            const on = mode === t.k;
            return (
              <button
                key={t.k}
                onClick={() => {
                  setMode(t.k);
                  play("tick");
                }}
                className="relative rounded-full px-5 py-2 text-sm font-semibold transition-colors"
                style={{ color: on ? "#05060a" : "rgba(226,232,240,0.7)" }}
              >
                {on && (
                  <motion.span
                    layoutId="showcase-toggle"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(120deg,#5ce8ff,#a78bfa 60%,#e879f9)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* coverflow stage */}
      <div className="relative flex h-[460px] items-center justify-center" style={{ perspective: 1500 }}>
        {items.map((it, i) => {
          // signed shortest offset around the ring
          let off = i - idx;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          if (abs > 2) return null; // only render near neighbours

          const isCenter = off === 0;
          return (
            <motion.div
              key={it.id}
              className="absolute origin-center overflow-hidden rounded-2xl border bg-void-900"
              style={{
                width: 244,
                height: 434, // 9:16
                borderColor: isCenter ? `${it.color}66` : "rgba(255,255,255,0.08)",
                cursor: isCenter ? "default" : "pointer",
                zIndex: 10 - abs,
                boxShadow: isCenter ? `0 30px 80px -30px ${it.color}66` : "none",
              }}
              animate={{
                x: off * 210,
                scale: isCenter ? 1 : 0.78 - (abs - 1) * 0.06,
                rotateY: off * -22,
                opacity: abs > 2 ? 0 : 1 - abs * 0.16,
                filter: isCenter ? "brightness(1)" : "brightness(0.5)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              onClick={() => !isCenter && setIdx(i)}
            >
              {it.kind === "video" ? (
                isCenter ? (
                  <video
                    key={it.id}
                    src={encodeURI(it.src)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={encodeURI(it.src)}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <>
                  <img
                    src={it.src}
                    alt={it.headline}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
                    }}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="hidden h-full w-full" style={{ background: it.gradient }} />
                </>
              )}

              {/* kind badge */}
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white backdrop-blur-sm">
                {it.kind === "video" ? "▶ reel" : "▦ still"}
              </span>

              {/* copy overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: it.color }}>
                  {it.tag}
                </div>
                <div className="mt-1 font-display text-base font-bold leading-tight text-white drop-shadow">
                  {it.headline}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-void-800/60 text-ink-200 backdrop-blur-md transition-colors hover:border-white/30 hover:text-ink-100 md:left-8"
      >
        ‹
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-void-800/60 text-ink-200 backdrop-blur-md transition-colors hover:border-white/30 hover:text-ink-100 md:right-8"
      >
        ›
      </button>

      {/* caption + download row */}
      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 text-center">
        <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono text-xs text-ink-500">
            <span className="text-violet-glow">› </span>
            {active.prompt}
          </div>
        </motion.div>

        <a
          href={encodeURI(active.src)}
          download={active.file}
          onClick={() => play("tick")}
          className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-void-900"
          style={{ background: "linear-gradient(120deg,#5ce8ff,#a78bfa 60%,#e879f9)" }}
        >
          <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          {active.kind === "video" ? "Download reel" : "Download image"}
        </a>
      </div>

      {/* dots */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 26 : 8,
              background: i === idx ? "linear-gradient(90deg,#22d3ee,#a78bfa)" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureBlock({ feature, flip }: { feature: Feature; flip: boolean }) {
  return (
    <div className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: feature.color }}>
          {feature.tag}
        </div>
        <h3 className="mt-3 font-display text-3xl font-bold text-ink-100">{feature.title}</h3>
        <p className="mt-3 max-w-md leading-relaxed text-ink-300">{feature.desc}</p>
        <ul className="mt-4 space-y-2">
          {feature.points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-ink-300">
              <span className="mt-0.5" style={{ color: feature.color }}>
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="panel h-64 overflow-hidden p-5"
      >
        {feature.visual}
      </motion.div>
    </div>
  );
}

function SectionEyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-300 ${
        center ? "" : ""
      }`}
    >
      <span className="h-1 w-1 rounded-full bg-cyan" />
      {children}
    </div>
  );
}


/* ---- mock content ---- */

const STATS = [
  { value: "5", label: "AI agents" },
  { value: "4", label: "modalities" },
  { value: "~70%", label: "lower cost" },
  { value: "~60s", label: "to launch" },
];

// Scenarios the hero preview cycles through (image with gradient fallback).
const HERO_SCENARIOS = [
  {
    id: "sneakers",
    prompt: "eco-friendly sneakers for city runners",
    headline: "Run Lighter. Tread Kinder.",
    image: "/campaigns/eco-sneakers.webp",
    gradient: "radial-gradient(120% 120% at 30% 20%, #134e4a 0%, #0f766e 35%, #052e2b 75%)",
  },
  {
    id: "coldbrew",
    prompt: "small-batch nitro cold brew coffee",
    headline: "Slow Brewed. Fast Living.",
    image: "/campaigns/cold-brew.webp",
    gradient: "radial-gradient(120% 120% at 70% 20%, #422006 0%, #1c1917 45%, #0c0a09 80%)",
  },
  {
    id: "watch",
    prompt: "a minimalist automatic luxury watch",
    headline: "Time, Perfected.",
    image: "/campaigns/luxury-watch.webp",
    gradient: "radial-gradient(120% 120% at 50% 10%, #0c4a6e 0%, #1e293b 45%, #020617 82%)",
  },
  {
    id: "bike",
    prompt: "a modern electric city bike",
    headline: "Own Every Street.",
    image: "/campaigns/electric-bike.webp",
    gradient: "radial-gradient(120% 120% at 60% 20%, #155e75 0%, #1e293b 45%, #020617 82%)",
  },
  {
    id: "chocolate",
    prompt: "luxury artisan dark chocolate",
    headline: "Indulge, Unapologetically.",
    image: "/campaigns/artisan-chocolate.webp",
    gradient: "radial-gradient(120% 120% at 40% 20%, #7c2d12 0%, #422006 40%, #1c1917 82%)",
  },
  {
    id: "water",
    prompt: "a smart hydration-tracking water bottle",
    headline: "Drink Smarter.",
    image: "/campaigns/smart-water-bottle.webp",
    gradient: "radial-gradient(120% 120% at 50% 15%, #155e75 0%, #0e7490 40%, #042f2e 82%)",
  },
];

const BRANDS = ["NOVELLE", "Drift&Co", "Kintsu", "Halcyon", "Pace"];

// Unified showcase: a mix of finished campaign stills (/public/campaigns)
// and video reels (/public/reels). Each slide is downloadable —
// stills as images, reels as MP4s. Interleaved for variety.
type ShowcaseItem = {
  id: string;
  kind: "image" | "video";
  tag: string;
  prompt: string;
  headline: string;
  src: string; // image path or video path
  file: string; // download filename
  color: string;
  gradient?: string; // fallback bg for image slides
};

const SHOWCASE: ShowcaseItem[] = [
  { id: "aura", kind: "video", tag: "Fragrance · Luxury", prompt: "a signature unisex fragrance", headline: "Bottle Your Aura.", src: "/reels/Aura.mp4", file: "aignis-aura.mp4", color: "#a78bfa" },
  { id: "eco-sneakers", kind: "image", tag: "Footwear · D2C", prompt: "eco-friendly sneakers for city runners", headline: "Run Lighter. Tread Kinder.", src: "/campaigns/eco-sneakers.webp", file: "aignis-eco-sneakers.webp", color: "#34d399", gradient: "radial-gradient(120% 120% at 30% 20%, #134e4a 0%, #0f766e 35%, #052e2b 75%)" },
  { id: "black-shoes", kind: "video", tag: "Footwear · Premium", prompt: "premium leather dress shoes", headline: "Step in Sharp.", src: "/reels/Black Shoes.mp4", file: "aignis-black-shoes.mp4", color: "#38bdf8" },
  { id: "luxury-watch", kind: "image", tag: "Luxury · Accessories", prompt: "a minimalist automatic luxury watch", headline: "Time, Perfected.", src: "/campaigns/luxury-watch.webp", file: "aignis-luxury-watch.webp", color: "#38bdf8", gradient: "radial-gradient(120% 120% at 50% 10%, #0c4a6e 0%, #1e293b 45%, #020617 82%)" },
  { id: "body-cream", kind: "video", tag: "Skincare · Beauty", prompt: "a nourishing whipped body cream", headline: "Skin, Restored.", src: "/reels/bodyCream.mp4", file: "aignis-body-cream.mp4", color: "#f472b6" },
  { id: "cold-brew", kind: "image", tag: "Beverage · CPG", prompt: "small-batch nitro cold brew coffee", headline: "Slow Brewed. Fast Living.", src: "/campaigns/cold-brew.webp", file: "aignis-cold-brew.webp", color: "#f59e0b", gradient: "radial-gradient(120% 120% at 70% 20%, #422006 0%, #1c1917 45%, #0c0a09 80%)" },
  { id: "drinks", kind: "video", tag: "Beverage · CPG", prompt: "a craft sparkling soda line", headline: "Pour Something Bold.", src: "/reels/Drinks.mp4", file: "aignis-drinks.mp4", color: "#f59e0b" },
  { id: "electric-bike", kind: "image", tag: "Mobility · Tech", prompt: "a modern electric city bike", headline: "Own Every Street.", src: "/campaigns/electric-bike.webp", file: "aignis-electric-bike.webp", color: "#22d3ee", gradient: "radial-gradient(120% 120% at 60% 20%, #155e75 0%, #1e293b 45%, #020617 82%)" },
  { id: "factory", kind: "video", tag: "Industrial · B2B", prompt: "a smart manufacturing platform", headline: "Built at Scale.", src: "/reels/Factory.mp4", file: "aignis-factory.mp4", color: "#22d3ee" },
  { id: "artisan-chocolate", kind: "image", tag: "Food · Premium", prompt: "luxury artisan dark chocolate", headline: "Indulge, Unapologetically.", src: "/campaigns/artisan-chocolate.webp", file: "aignis-artisan-chocolate.webp", color: "#fb923c", gradient: "radial-gradient(120% 120% at 40% 20%, #7c2d12 0%, #422006 40%, #1c1917 82%)" },
  { id: "hardware", kind: "video", tag: "Tools · Hardware", prompt: "pro-grade cordless power tools", headline: "Engineered to Last.", src: "/reels/Hardware.mp4", file: "aignis-hardware.mp4", color: "#fb923c" },
  { id: "smart-water-bottle", kind: "image", tag: "Wellness · IoT", prompt: "a smart hydration-tracking water bottle", headline: "Drink Smarter.", src: "/campaigns/smart-water-bottle.webp", file: "aignis-smart-water-bottle.webp", color: "#2dd4bf", gradient: "radial-gradient(120% 120% at 50% 15%, #155e75 0%, #0e7490 40%, #042f2e 82%)" },
  { id: "shampoo", kind: "video", tag: "Haircare · Beauty", prompt: "a sulfate-free repair shampoo", headline: "Roots to Ends.", src: "/reels/shampoo.mp4", file: "aignis-shampoo.mp4", color: "#2dd4bf" },
  { id: "plant-subscription", kind: "image", tag: "Lifestyle · Subscription", prompt: "a monthly indoor plant subscription box", headline: "Grow Something Good.", src: "/campaigns/plant-subscription.webp", file: "aignis-plant-subscription.webp", color: "#a3e635", gradient: "radial-gradient(120% 120% at 40% 20%, #14532d 0%, #166534 40%, #052e16 82%)" },
  { id: "tailoring", kind: "video", tag: "Apparel · Service", prompt: "an on-demand tailoring service", headline: "Stitched to Fit.", src: "/reels/sweeing_cloths_job.mp4", file: "aignis-tailoring.mp4", color: "#a3e635" },
  { id: "gourmet-burger", kind: "image", tag: "QSR · Local", prompt: "a gourmet smash burger joint", headline: "Stacked to Order.", src: "/campaigns/gourmet-burger.webp", file: "aignis-gourmet-burger.webp", color: "#f87171", gradient: "radial-gradient(120% 120% at 55% 20%, #7f1d1d 0%, #431407 45%, #1c1917 82%)" },
  { id: "sweet-shop", kind: "video", tag: "Confectionery · Local", prompt: "an artisan candy & sweet shop", headline: "Sweet on Sight.", src: "/reels/sweet_shop.mp4", file: "aignis-sweet-shop.mp4", color: "#f87171" },
  { id: "signage", kind: "video", tag: "Retail · Signage", prompt: "a neon storefront signage studio", headline: "Light Up the Street.", src: "/reels/the_glowing_shop_names_we_see_streets_those_making.mp4", file: "aignis-signage.mp4", color: "#e879f9" },
  { id: "storage", kind: "video", tag: "Home Goods · D2C", prompt: "modular wall storage shelving", headline: "Order, Beautifully.", src: "/reels/wall_self_keep_things_like_cups_toiletries.mp4", file: "aignis-storage.mp4", color: "#34d399" },
];


const AGENTS = [
  { name: "Researcher", desc: "Mines market signals & reviews for the angle that lands.", color: "#22d3ee", glyph: "◎", pillar: "RAG" },
  { name: "Analyst", desc: "Pulls live inventory & margins through a private MCP link.", color: "#a78bfa", glyph: "◈", pillar: "MCP" },
  { name: "Copywriter", desc: "Writes in your brand voice and picks what resonates.", color: "#f472b6", glyph: "✦", pillar: "LLM" },
  { name: "Visual Director", desc: "Renders the hero creative to your palette.", color: "#fb923c", glyph: "❖", pillar: "Diffusion" },
  { name: "Operations", desc: "Cuts the reels, voices it, and publishes.", color: "#a3e635", glyph: "⬡", pillar: "Agentic" },
];

interface Feature {
  tag: string;
  title: string;
  desc: string;
  points: string[];
  color: string;
  visual: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    tag: "Grounded",
    title: "It knows your actual business",
    desc: "Through a private Model Context Protocol link, the agents read your real inventory, pricing, and brand rules — so the output is never generic and never off-brand.",
    points: ["Live inventory & margin context", "Brand-rule compliance gate", "Nothing leaves your control"],
    color: "#a78bfa",
    visual: <MockInventory />,
  },
  {
    tag: "Multimodal",
    title: "Copy, image, video and voice",
    desc: "One idea becomes a full channel-ready set: a headline, body, a diffusion-rendered hero, short-form reels in every aspect ratio, and an AI voiceover.",
    points: ["Diffusion hero creative", "9:16 · 1:1 · 16:9 reels", "Real spoken voiceover"],
    color: "#fb923c",
    visual: <MockChannels />,
  },
  {
    tag: "Self-optimizing",
    title: "It watches, explains, and improves",
    desc: "After launch, AIgnis reads per-channel performance, explains what's working in plain language, and re-engages the swarm to rewrite what isn't.",
    points: ["Live per-channel pulse", "Plain-language analysis", "One-click re-optimization"],
    color: "#a3e635",
    visual: <MockPulse />,
  },
];

function MockInventory() {
  const rows = [
    { sku: "TERRA-RUN-01", base: 1840, status: "ready", c: "#a3e635" },
    { sku: "TERRA-RUN-02", base: 320, status: "low", c: "#fb923c" },
    { sku: "TERRA-TRL-01", base: 0, status: "backorder", c: "#f472b6" },
  ];
  // sequential "verified" pass that loops, plus lightly ticking stock numbers
  const [checked, setChecked] = useState(-1);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      setChecked(i);
      i = i + 1;
      if (i > rows.length) {
        i = 0;
        setChecked(-1);
      }
    }, 700);
    return () => clearInterval(id);
  }, [rows.length]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const liveStock = (base: number, i: number) =>
    base === 0 ? 0 : base + ((tick + i) % 4) * 7 - 7;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-ink-500">
        <span className="text-violet-glow">◈</span> MCP · live inventory
        <span className="ml-auto flex items-center gap-1 text-lime">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> synced
        </span>
      </div>
      <div className="flex-1 space-y-2">
        {rows.map((r, i) => {
          const isChecked = checked >= i;
          return (
            <div
              key={r.sku}
              className="flex items-center justify-between rounded-lg border bg-white/[0.02] px-3 py-2 transition-colors duration-300"
              style={{ borderColor: checked === i ? `${r.c}55` : "rgba(255,255,255,0.06)" }}
            >
              <span className="flex items-center gap-2 font-mono text-xs text-ink-200">
                <motion.span
                  animate={{
                    scale: isChecked ? 1 : 0.6,
                    opacity: isChecked ? 1 : 0.25,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: isChecked ? r.c : "transparent", color: "#05060a", border: isChecked ? "none" : `1px solid ${r.c}55` }}
                >
                  {isChecked ? "✓" : ""}
                </motion.span>
                {r.sku}
              </span>
              <div className="flex items-center gap-2">
                <motion.span
                  key={liveStock(r.base, i)}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-xs tabular-nums text-ink-300"
                >
                  {liveStock(r.base, i).toLocaleString()}
                </motion.span>
                <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase" style={{ color: r.c, background: `${r.c}1a` }}>
                  {r.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MockChannels() {
  const ch = [
    { label: "9:16", w: 54, h: 96, c: "#25F4EE", delay: 0 },
    { label: "1:1", w: 80, h: 80, c: "#d6249f", delay: 0.4 },
    { label: "16:9", w: 116, h: 66, c: "#22d3ee", delay: 0.8 },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-ink-500">
        <span className="text-orange-400">❖</span> channel-native exports
        <span className="ml-auto text-orange-400">rendering…</span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-5">
        {ch.map((c) => (
          <div key={c.label} className="flex flex-col items-center gap-2">
            {/* device-screen frame */}
            <div
              className="relative overflow-hidden rounded-xl border bg-void-900"
              style={{ width: c.w, height: c.h, borderColor: `${c.c}55`, boxShadow: `0 0 18px -6px ${c.c}` }}
            >
              {/* render-in content (image band + text lines) */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: c.delay }}
                style={{ background: `linear-gradient(160deg, ${c.c}33, transparent 70%)` }}
              />
              {/* hero band */}
              <motion.div
                className="absolute left-0 right-0 top-0 origin-top"
                style={{ height: c.h * 0.45, background: `linear-gradient(135deg, ${c.c}55, ${c.c}11)` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: c.delay }}
              />
              {/* text lines */}
              <div className="absolute inset-x-2 flex flex-col gap-1" style={{ top: c.h * 0.45 + 6 }}>
                {[0.9, 0.6].map((w, k) => (
                  <motion.span
                    key={k}
                    className="h-1 rounded-full bg-white/30"
                    initial={{ width: 0 }}
                    animate={{ width: `${w * 100}%` }}
                    transition={{ duration: 0.4, delay: c.delay + 0.3 + k * 0.15 }}
                  />
                ))}
              </div>
              {/* scanning sweep loop */}
              <motion.div
                className="absolute inset-x-0 h-6"
                style={{ background: `linear-gradient(180deg, transparent, ${c.c}44, transparent)` }}
                animate={{ top: ["-20%", "110%"] }}
                transition={{ duration: 2.2, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="font-mono text-[9px] text-ink-500">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockPulse() {
  // bars animate up/down on a loop; the headline % ticks with them
  const [bars, setBars] = useState([40, 55, 48, 70, 82, 96]);
  const [ctr, setCtr] = useState(38);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBars((prev) =>
        prev.map((b, i) => {
          // gentle climbing wander, last bars trend higher
          const drift = (Math.random() - 0.45) * 18 + i * 2;
          return Math.max(28, Math.min(100, Math.round(b + drift) % 101 || 60));
        })
      );
      setCtr((c) => {
        const next = c + Math.round((Math.random() - 0.4) * 6);
        return Math.max(22, Math.min(64, next));
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-ink-500">
        <span className="flex items-center gap-1">
          <span className="text-lime">⬡</span> campaign pulse
          <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
        </span>
        <motion.span
          key={ctr}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold text-lime tabular-nums"
        >
          +{ctr}% CTR
        </motion.span>
      </div>
      <div className="flex flex-1 items-end gap-2">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t"
            animate={{ height: `${b}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            style={{ background: "linear-gradient(180deg,#a3e635,#22d3ee)" }}
          />
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  { title: "Describe it", desc: "Type or speak a raw product idea.", glyph: "✎", color: "#22d3ee" },
  { title: "Watch the swarm", desc: "Five agents research, write & design live.", glyph: "◈", color: "#a78bfa" },
  { title: "Get the creative", desc: "Copy + hero image + channel-ready reels.", glyph: "❖", color: "#f472b6" },
  { title: "Publish & optimize", desc: "Ship to channels, then self-optimize.", glyph: "⬡", color: "#a3e635" },
];

const TESTIMONIALS = [
  { quote: "We launched a full campaign before our coffee got cold. The on-brand part is what sold me — it actually used our stock levels.", name: "Maya Chen", role: "Founder, NOVELLE", initials: "MC", color: "#22d3ee", photo: "/people/maya.jpg" },
  { quote: "It feels like hiring a five-person creative team that never sleeps. The self-optimization loop is genuinely uncanny.", name: "Daniel Roe", role: "Growth, Drift&Co", initials: "DR", color: "#a78bfa", photo: "/people/daniel.jpg" },
  { quote: "The reels and voiceover came out ready to post. We cut our launch costs to a fraction of what an agency quoted.", name: "Aisha Karim", role: "CMO, Kintsu", initials: "AK", color: "#f472b6", photo: "/people/aisha.jpg" },
];

type Testimonial = (typeof TESTIMONIALS)[number];

/** Testimonial avatar — real photo if present, else colored initials. */
function TestimonialAvatar({ t }: { t: Testimonial }) {
  const [ok, setOk] = useState(true);
  if (ok) {
    return (
      <img
        src={t.photo}
        alt={t.name}
        onError={() => setOk(false)}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-void-900"
      style={{ background: t.color }}
    >
      {t.initials}
    </span>
  );
}
