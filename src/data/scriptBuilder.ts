import type { AgentEvent, AgentName, TechPillar } from "../types";

// Helper to author readable agent scripts. Each "beat" expands into a small
// cluster of timestamped events (active -> logs -> handoff/complete) so the
// Agent_Activity_View renders a lifelike collaboration stream.

interface Beat {
  agent: AgentName;
  pillar: TechPillar;
  logs: string[];
  handoffTo?: AgentName;
}

let counter = 0;
const uid = (a: string) => `${a}-${counter++}`;

/**
 * Builds a full agent script from an ordered list of beats.
 * Timestamps are spaced so the whole run lands comfortably under 90s.
 */
export function buildScript(beats: Beat[]): AgentEvent[] {
  counter = 0;
  const events: AgentEvent[] = [];
  let t = 400; // ms offset from run start

  for (const beat of beats) {
    // agent wakes up
    events.push({
      id: uid(beat.agent),
      agent: beat.agent,
      timestamp: t,
      kind: "active",
      message: "spinning up…",
      pillar: beat.pillar,
    });
    t += 700;

    // streamed log lines
    beat.logs.forEach((line, i) => {
      events.push({
        id: uid(beat.agent),
        agent: beat.agent,
        timestamp: t,
        kind: "log",
        message: line,
        pillar: beat.pillar,
      });
      t += 850 + (i % 2 === 0 ? 250 : 0);
    });

    // handoff or completion
    if (beat.handoffTo) {
      events.push({
        id: uid(beat.agent),
        agent: beat.agent,
        timestamp: t,
        kind: "handoff",
        message: `handing context to ${beat.handoffTo.replace("_", " ")}`,
        handoffTo: beat.handoffTo,
        pillar: beat.pillar,
      });
      t += 600;
    }

    events.push({
      id: uid(beat.agent),
      agent: beat.agent,
      timestamp: t,
      kind: "complete",
      message: "task complete",
      pillar: beat.pillar,
    });
    t += 500;
  }

  return events;
}
