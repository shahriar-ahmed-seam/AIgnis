import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "../components/layout/BrandMark";
import { useAuth } from "../stores/authStore";
import { useScreen } from "../stores/screenStore";
import { play, primeAudio } from "../lib/sound";

/**
 * Auth — login / register. Split layout: brand story on the left, form on the
 * right. Mock auth (any valid-looking input works). Real auth + Neon noted for
 * backend wiring (see server/DATABASE_NOTES.md).
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
    <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* left — brand story */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex">
        <Wordmark />
        <div>
          <h2 className="font-display text-5xl font-extrabold leading-tight text-balance">
            Your brand's <span className="text-gradient">autonomous</span> marketing team.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-300">
            Sign in to forge campaigns, watch the agent swarm work, and publish multimodal
            creative across every channel.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["MCP", "RAG", "Diffusion", "Agentic", "LLM"].map((p) => (
              <span
                key={p}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-ink-300"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="font-mono text-[11px] text-ink-500">
          Prototype · mock auth — no real credentials stored
        </div>
      </div>

      {/* right — form */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel w-full max-w-md p-8"
        >
          {/* mode toggle */}
          <div className="mb-7 flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {(["register", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  play("tick");
                  setAuthMode(m);
                  setError(null);
                }}
                className={`relative flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  authMode === m ? "text-ink-100" : "text-ink-500 hover:text-ink-300"
                }`}
              >
                {authMode === m && (
                  <motion.div
                    layoutId="auth-toggle"
                    className="absolute inset-0 rounded-lg bg-violet/15 ring-1 ring-violet/30"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m === "register" ? "Create account" : "Log in"}</span>
              </button>
            ))}
          </div>

          <h3 className="font-display text-2xl font-bold text-ink-100">
            {isRegister ? "Start forging campaigns" : "Welcome back"}
          </h3>
          <p className="mt-1 text-sm text-ink-300">
            {isRegister ? "Free Starter tier — no card required." : "Sign in to your workspace."}
          </p>

          <div className="mt-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Field label="Name" value={name} onChange={setName} placeholder="Alex Rivera" />
                </motion.div>
              )}
            </AnimatePresence>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@brand.com" />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              onEnter={submit}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 font-mono text-xs text-magenta"
            >
              {error}
            </motion.p>
          )}

          <button onClick={submit} disabled={busy} className="btn-primary mt-6 w-full py-3 disabled:opacity-60">
            {busy ? "…" : isRegister ? "Create account →" : "Log in →"}
          </button>

          {/* social (mock) */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { play("tick"); loginAsGuest(); }} className="btn-ghost py-2.5 text-sm">
              Continue as guest
            </button>
            <button onClick={() => { play("tick"); loginAsGuest(); }} className="btn-ghost py-2.5 text-sm">
              <span className="text-ink-300"> Google</span>
            </button>
          </div>

          <button onClick={goWelcome} className="mt-6 w-full text-center font-mono text-xs text-ink-500 hover:text-ink-300">
            ← Back to home
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <label className="block">
      <span className="label-mono mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-ink-100 placeholder:text-ink-600 transition-colors focus:border-violet/50 focus:outline-none focus:ring-1 focus:ring-violet/30"
      />
    </label>
  );
}
