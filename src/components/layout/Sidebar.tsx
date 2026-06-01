import { motion } from "framer-motion";
import { useNav, type Section } from "../../stores/navStore";
import { useAuth } from "../../stores/authStore";
import { useCampaigns, campaignsThisMonth, PLAN_LIMITS } from "../../stores/campaignStore";

interface NavItem {
  id: Section;
  label: string;
  glyph: string;
  group: string;
}

const ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", glyph: "⊞", group: "Create" },
  { id: "studio", label: "Campaign Studio", glyph: "✦", group: "Create" },
  { id: "command", label: "Command Center", glyph: "◷", group: "Create" },
  { id: "published", label: "Published", glyph: "↗", group: "Create" },
  { id: "graph", label: "Knowledge Graph", glyph: "◈", group: "Intelligence" },
  { id: "streams", label: "Live Data Streams", glyph: "≋", group: "Intelligence" },
  { id: "observability", label: "LLMOps", glyph: "◎", group: "Intelligence" },
  { id: "workspace", label: "Brand Workspace", glyph: "⬡", group: "Manage" },
  { id: "pricing", label: "Plans & Billing", glyph: "◆", group: "Manage" },
  { id: "docs", label: "Live Docs", glyph: "❑", group: "Manage" },
];

const GROUPS = ["Create", "Intelligence", "Manage"];

/**
 * Persistent platform sidebar — turns AInigma from a linear demo into a
 * navigable product. Grouped sections with an animated active indicator.
 */
export function Sidebar() {
  const { section, setSection } = useNav();
  const plan = useAuth((s) => s.user?.plan ?? "Starter");
  const campaigns = useCampaigns((s) => s.campaigns);
  const used = campaignsThisMonth(campaigns);
  const limit = PLAN_LIMITS[plan] ?? 5;
  const unlimited = !isFinite(limit);
  const pct = unlimited ? 0 : Math.min(100, (used / limit) * 100);
  const atCap = !unlimited && used >= limit;

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-void-800/40 backdrop-blur-md">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {GROUPS.map((group) => (
          <div key={group}>
            <div className="label-mono mb-2 px-3">{group}</div>
            <div className="space-y-1">
              {ITEMS.filter((i) => i.group === group).map((item) => {
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active ? "text-ink-100" : "text-ink-500 hover:text-ink-300"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl border border-violet/30 bg-violet/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className="relative z-10 text-lg"
                      style={{ color: active ? "#a78bfa" : undefined }}
                    >
                      {item.glyph}
                    </span>
                    <span className="relative z-10 text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* footer: plan + usage */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime shadow-[0_0_8px_#a3e635]" />
              <span className="font-mono text-[11px] text-ink-300">{plan} plan</span>
            </span>
            {!unlimited && (
              <span className="font-mono text-[10px] text-ink-500">
                {used}/{limit}
              </span>
            )}
          </div>

          {unlimited ? (
            <div className="mt-2 font-mono text-[10px] text-ink-500">Unlimited campaigns · {used} this month</div>
          ) : (
            <>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: atCap ? "linear-gradient(90deg,#fb923c,#e879f9)" : "linear-gradient(90deg,#22d3ee,#a78bfa)" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <div className="mt-1.5 font-mono text-[10px] text-ink-500">
                {atCap ? "Monthly limit reached" : `${limit - used} campaigns left this month`}
              </div>
              <button
                onClick={() => setSection("pricing")}
                className="mt-2.5 w-full rounded-lg bg-gradient-to-r from-cyan/15 to-violet/15 px-3 py-1.5 font-mono text-[11px] font-semibold text-violet-glow transition-colors hover:from-cyan/25 hover:to-violet/25"
              >
                ⬆ Upgrade to Pro
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
