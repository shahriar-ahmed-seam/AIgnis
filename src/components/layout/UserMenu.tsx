import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, avatarGradient } from "../../stores/authStore";

/** Header user chip with a dropdown (plan + logout). */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-1.5 pl-1.5 pr-3 transition-colors hover:border-white/20"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-void-900"
          style={{ background: avatarGradient(user.avatarSeed) }}
        >
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-ink-100 sm:inline">{user.name}</span>
        <span className="text-ink-500">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="panel absolute right-0 top-12 z-40 w-60 p-2"
            >
              <div className="flex items-center gap-3 rounded-lg p-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-void-900"
                  style={{ background: avatarGradient(user.avatarSeed) }}
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink-100">{user.name}</div>
                  <div className="truncate font-mono text-[10px] text-ink-500">{user.email}</div>
                </div>
              </div>
              <div className="my-1 flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <span className="label-mono">Plan</span>
                <span className="rounded-md bg-violet/15 px-2 py-0.5 font-mono text-[10px] text-violet-glow">
                  {user.plan}
                </span>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-ink-300 transition-colors hover:bg-white/[0.04] hover:text-magenta"
              >
                Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
