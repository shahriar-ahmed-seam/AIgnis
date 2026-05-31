import { useState } from "react";
import { motion } from "framer-motion";
import { TEAM, TEAM_NAME, type TeamMember } from "../../data/team";
import { avatarGradient } from "../../stores/authStore";

/**
 * Team showcase grid for /docs. Uniform member cards: consistent square photo
 * frame (auto fallback to a gradient initials avatar), name, role, email.
 */
export function TeamGrid() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="label-mono">Team</span>
        <span className="rounded-md bg-violet/15 px-2 py-0.5 font-mono text-[11px] text-violet-glow">
          {TEAM_NAME}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((m, i) => (
          <MemberCard key={m.id} member={m} delay={i * 0.06} />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member, delay }: { member: TeamMember; delay: number }) {
  const [imgOk, setImgOk] = useState(true);
  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="panel panel-hover flex flex-col items-center p-6 text-center"
    >
      {/* uniform square photo frame */}
      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10">
        {member.photo && imgOk ? (
          <img
            src={member.photo}
            alt={member.name}
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-2xl font-bold text-void-900"
            style={{ background: avatarGradient(member.email || member.id) }}
          >
            {initials}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h4 className="font-display text-base font-bold text-ink-100">{member.name}</h4>
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
            member.badge === "Leader" ? "bg-cyan/15 text-cyan-glow" : "bg-white/[0.06] text-ink-300"
          }`}
        >
          {member.badge}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-300">{member.role}</p>
      {member.email ? (
        <a
          href={`mailto:${member.email}`}
          className="mt-3 font-mono text-[11px] text-violet-glow hover:underline"
        >
          {member.email}
        </a>
      ) : (
        <span className="mt-3 font-mono text-[11px] text-ink-600">email coming soon</span>
      )}
      <span className="mt-2 font-mono text-[10px] text-ink-500">{member.attendance}</span>
    </motion.div>
  );
}
