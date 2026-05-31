import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "../components/layout/BrandMark";
import { useAuth } from "../stores/authStore";
import { useScreen } from "../stores/screenStore";
import { play, primeAudio } from "../lib/sound";

/**
 * Auth — login / register. Split layout: a living brand panel on the left
 * (a looping agent "forge" with drifting particles), and a deboxed, premium
 * form on the right (floating labels, animated gradient underlines, an
 * underline tab switch). Mock auth — any valid-looking input works. Real auth
 * + Neon noted for backend wiring (see server/DATABASE_NOTES.md).
 */
export function AuthView() {
  const { authMode, setAuthMode, goWelcome } = useScreen();
  const { login, register, loginAsGuest } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = authMode === "register";

  // Esc returns to the landing page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goWelcome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goWelcome]);

  function submit() {
    primeAudio();
    setBusy(true);
    setError(null);
    // brief delay so it feels like a real request
    window.setTimeout(() => {
      const res = isRegister ? register(name, email, password) : login(email, password);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        play("tick");
        setBusy(false);
      }
      // on success the auth store flips status and App swaps to the app shell
    }, 450);
  }

  return (
    <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* left — living brand panel */}
      <BrandPanel isRegister={isRegister} />

      {/* right — deboxed form */}
      <div className="relative flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* compact brand for mobile (left panel is hidden) */}
          <div className="mb-10 lg:hidden">
            <Wordmark />
          </div>

          {/* underline tab switch — no box */}
          <div className="mb-9 flex gap-8">
            {(["register", "login"] as const).map((m) => {
              const on = authMode === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    play("tick");
                    setAuthMode(m);
                    setError(null);
                  }}
                  className="group relative pb-2 text-base font-bold transition-colors"
                  style={{ color: on ? "#e8ecf7" : "rgba(148,163,184,0.6)" }}
                >
                  {m === "register" ? "Create account" : "Log in"}
                  {on && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-cyan via-violet to-magenta"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.h3
              key={isRegister ? "r" : "l"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-display text-3xl font-extrabold leading-tight text-ink-100"
            >
              {isRegister ? (
                <>
                  Start forging <span className="text-gradient">campaigns</span>.
                </>
              ) : (
                <>
                  Welcome <span className="text-gradient">back</span>.
                </>
              )}
            </motion.h3>
          </AnimatePresence>
          <p className="mt-2 text-sm text-ink-400">
            {isRegister ? "Free Starter tier — no card required." : "Sign in to your workspace."}
          </p>

          <div className="mt-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <FloatingField label="Name" value={name} onChange={setName} icon="◇" />
                </motion.div>
              )}
            </AnimatePresence>
            <FloatingField label="Email" type="email" value={email} onChange={setEmail} icon="@" />
            <FloatingField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              icon="∗"
              onEnter={submit}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 font-mono text-xs text-magenta"
              >
                <span>✕</span>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* primary action — gradient pill with filling arrow */}
          <button
            onClick={submit}
            disabled={busy}
            className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 font-display text-base font-bold text-void-900 transition-transform active:scale-[0.99] disabled:opacity-60"
            style={{ background: "linear-gradient(120deg,#5ce8ff,#a78bfa 55%,#e879f9)" }}
          >
            <span className="relative z-10">
              {busy ? "Forging your workspace…" : isRegister ? "Create account" : "Log in"}
            </span>
            {!busy && (
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
            )}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          {/* divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-600">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* social / guest — deboxed text actions */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <button
              onClick={() => { play("tick"); loginAsGuest(); }}
              className="group flex items-center gap-2 font-semibold text-ink-300 transition-colors hover:text-ink-100"
            >
              <span className="text-violet-glow">⬡</span> Guest
            </button>
            <button
              onClick={() => { play("tick"); loginAsGuest(); }}
              className="group flex items-center gap-2 font-semibold text-ink-300 transition-colors hover:text-ink-100"
            >
              <GoogleGlyph /> Google
            </button>
          </div>

          <div className="mt-10 font-mono text-[11px] text-ink-600">
            Prototype · mock auth — no real credentials stored ·{" "}
            <button onClick={() => goWelcome()} className="text-ink-500 underline-offset-2 hover:text-ink-300 hover:underline">
              Esc to exit
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Left brand panel — a looping "forge" of the agent swarm with      */
/* drifting particles and a rotating value line. Hidden on mobile.   */
/* ---------------------------------------------------------------- */
const AUTH_AGENTS = [
  { name: "Researcher", glyph: "◎", color: "#22d3ee", line: "Mining market signals", pillar: "RAG" },
  { name: "Analyst", glyph: "◈", color: "#a78bfa", line: "Reading live inventory", pillar: "MCP" },
  { name: "Copywriter", glyph: "✦", color: "#f472b6", line: "Writing on-brand copy", pillar: "LLM" },
  { name: "Visual Director", glyph: "❖", color: "#fb923c", line: "Rendering the hero", pillar: "Diffusion" },
  { name: "Operations", glyph: "⬡", color: "#a3e635", line: "Cutting & publishing", pillar: "Agentic" },
];

function BrandPanel({ isRegister }: { isRegister: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % AUTH_AGENTS.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
      {/* ambient aurora + drifting particles */}
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22), rgba(34,211,238,0.12) 50%, transparent 72%)" }}
      />
      <AuthParticles />

      {/* brand */}
      <button onClick={() => useScreen.getState().goWelcome()} className="relative z-10 text-left" title="Back to home">
        <Wordmark />
      </button>

      {/* center: headline + live forge */}
      <div className="relative z-10">
        <h2 className="font-display text-5xl font-extrabold leading-[1.08] text-balance">
          Your brand's{" "}
          <span className="text-gradient-flow animate-gradient-flow">autonomous</span>
          <br /> marketing team.
        </h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-300">
          {isRegister
            ? "Create an account and watch five specialized agents turn a single idea into a full, on-brand campaign."
            : "Sign in to forge campaigns, watch the swarm work, and publish multimodal creative across every channel."}
        </p>

        {/* live agent forge — boxless rows that light up in sequence */}
        <div className="mt-10 space-y-3.5">
          {AUTH_AGENTS.map((a, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <div key={a.name} className="flex items-center gap-3">
                <motion.span
                  className="text-lg"
                  animate={{ scale: on ? 1.25 : 1, opacity: on || done ? 1 : 0.4 }}
                  style={{ color: a.color }}
                >
                  {a.glyph}
                </motion.span>
                <span
                  className="text-sm font-semibold transition-opacity duration-300"
                  style={{ color: on ? "#e8ecf7" : "rgba(148,163,184,0.55)" }}
                >
                  {a.line}
                </span>
                {/* progress dash */}
                <span className="ml-1 h-px flex-1" style={{ background: on ? `${a.color}66` : "transparent" }} />
                {on && (
                  <span
                    className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-transparent"
                    style={{ borderTopColor: a.color, borderRightColor: a.color }}
                  />
                )}
                {done && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: a.color, color: "#05060a" }}
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* powered-by stack rail — a connected pipeline. Each tech node lights
          up in lockstep with the agent working above it: capability, not
          jargon. */}
      <div className="relative z-10">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-600">
          The engine underneath
        </div>
        <div className="flex items-center">
          {AUTH_AGENTS.map((a, i) => {
            const on = i === active;
            return (
              <div key={a.pillar} className="flex flex-1 items-center">
                {/* node */}
                <div className="flex flex-col items-center gap-2">
                  <motion.span
                    className="flex h-9 w-9 items-center justify-center rounded-xl font-mono text-[10px] font-bold"
                    animate={{
                      borderColor: on ? a.color : "rgba(255,255,255,0.10)",
                      color: on ? "#05060a" : "rgba(148,163,184,0.7)",
                      backgroundColor: on ? a.color : "rgba(255,255,255,0.02)",
                      boxShadow: on ? `0 0 18px -3px ${a.color}` : "0 0 0 0 transparent",
                      scale: on ? 1.12 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                    style={{ border: "1px solid" }}
                  >
                    {a.glyph}
                  </motion.span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider transition-colors duration-300"
                    style={{ color: on ? a.color : "rgba(148,163,184,0.5)" }}
                  >
                    {a.pillar}
                  </span>
                </div>
                {/* connector to next node */}
                {i < AUTH_AGENTS.length - 1 && (
                  <div className="mx-1 mb-5 h-px flex-1 overflow-hidden bg-white/10">
                    <motion.div
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${a.color}, ${AUTH_AGENTS[i + 1].color})` }}
                      animate={{ width: i < active ? "100%" : on ? "60%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Subtle drifting connection-dots layer behind the brand panel. */
function AuthParticles() {
  const dots = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${(i * 61) % 100}%`,
    top: `${(i * 43) % 100}%`,
    dur: 7 + (i % 5),
    delay: (i % 6) * 0.5,
    size: 2 + (i % 3),
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-cyan/30"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{ y: [0, -16, 0], opacity: [0.12, 0.5, 0.12] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Floating-label field — no box; an icon prefix, a label that lifts */
/* on focus/fill, and a gradient underline that grows on focus.      */
/* ---------------------------------------------------------------- */
function FloatingField({
  label,
  value,
  onChange,
  type = "text",
  icon,
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: string;
  onEnter?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 border-b border-white/12 pb-2 pt-4">
        {icon && (
          <span
            className="font-mono text-base transition-colors"
            style={{ color: focused ? "#a78bfa" : "rgba(148,163,184,0.5)" }}
          >
            {icon}
          </span>
        )}
        <div className="relative flex-1">
          <motion.label
            className="pointer-events-none absolute left-0 origin-left font-medium"
            animate={{
              y: lifted ? -20 : 0,
              scale: lifted ? 0.8 : 1,
              color: focused ? "#a78bfa" : "rgba(148,163,184,0.7)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {label}
          </motion.label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
            className="w-full bg-transparent text-ink-100 caret-violet-glow focus:outline-none"
          />
        </div>
      </div>
      {/* animated gradient underline */}
      <span
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-cyan via-violet to-magenta transition-transform duration-300"
        style={{ transform: `scaleX(${focused ? 1 : 0})` }}
      />
    </div>
  );
}

/** Small Google "G" mark. */
function GoogleGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
