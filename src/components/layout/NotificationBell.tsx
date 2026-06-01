import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCampaigns } from "../../stores/campaignStore";
import { useNav } from "../../stores/navStore";
import { AGENT_META } from "../../types";
import { play } from "../../lib/sound";

// Notification center — a header bell that surfaces the always-on agent
// activity as a checkable inbox. Reinforces "the agents work for you 24/7":
// there's always something new in here. Unread count tracks a last-read mark.

const READ_KEY = "aignis.notifsReadAt";

function loadReadAt(): number {
  try {
    return Number(localStorage.getItem(READ_KEY) ?? "0");
  } catch {
    return 0;
  }
}

export function NotificationBell() {
  const activity = useCampaigns((s) => s.activity);
  const openCampaign = useCampaigns((s) => s.open);
  const setSection = useNav((s) => s.setSection);

  const [open, setOpen] = useState(false);
  const [readAt, setReadAt] = useState<number>(loadReadAt);

  const unread = activity.filter((a) => a.ts > readAt).length;

  // when opened, mark everything read after a beat
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const now = Date.now();
      setReadAt(now);
      try {
        localStorage.setItem(READ_KEY, String(now));
      } catch {
        /* ignore */
      }
    }, 700);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          play("tick");
        }}
        title="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors hover:border-white/25 hover:text-ink-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-magenta px-1 font-mono text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
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
              className="panel absolute right-0 top-12 z-40 w-80 overflow-hidden p-0"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lime shadow-[0_0_8px_#a3e635]" />
                  <span className="text-sm font-bold text-ink-100">Agent activity</span>
                </div>
                <span className="label-mono">24/7</span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {activity.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-ink-500">Nothing yet.</div>
                )}
                {activity.slice(0, 20).map((a) => {
                  const meta = AGENT_META[a.agent];
                  const isUnread = a.ts > readAt;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        if (a.campaignId) {
                          openCampaign(a.campaignId);
                          setSection("dashboard");
                        }
                        setOpen(false);
                        play("tick");
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ color: meta.color, background: `${meta.color}14`, border: `1px solid ${meta.color}33` }}
                      >
                        {meta.glyph}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs leading-relaxed text-ink-200">{a.message}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-ink-600">
                          {meta.label} · {timeAgo(a.ts)}
                        </div>
                      </div>
                      {isUnread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
  return `${Math.round(h / 24)}d ago`;
}
