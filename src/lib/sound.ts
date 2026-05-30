// Lightweight Web Audio sound engine — no asset files. Synthesizes short,
// tasteful UI cues. Respects a global mute flag persisted to localStorage.
//
// Browsers require a user gesture before audio can start; we lazily create the
// AudioContext on the first sound and resume it on demand.

type Cue =
  | "tick" // subtle UI click
  | "activate" // agent wakes up
  | "complete" // agent finishes
  | "handoff" // context passed to next agent
  | "reveal" // creative asset reveal chime
  | "deploy" // campaign deployed
  | "optimize" // optimization whoosh
  | "success"; // optimization improvement landed

let ctx: AudioContext | null = null;
let muted = loadMuted();

function loadMuted(): boolean {
  try {
    return localStorage.getItem("ainigma.muted") === "1";
  } catch {
    return false;
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem("ainigma.muted", value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

interface ToneOpts {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  glideTo?: number; // sweep target frequency
  delay?: number; // start offset in seconds
}

function tone(o: ToneOpts) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + (o.delay ?? 0);
  const osc = a.createOscillator();
  const g = a.createGain();
  const peak = o.gain ?? 0.12;
  const attack = o.attack ?? 0.005;
  const release = o.release ?? Math.max(0.04, o.dur * 0.6);

  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t0 + o.dur);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur + release);

  osc.connect(g);
  g.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + o.dur + release + 0.02);
}

export function play(cue: Cue) {
  if (muted) return;
  switch (cue) {
    case "tick":
      tone({ freq: 520, dur: 0.04, type: "square", gain: 0.05 });
      break;
    case "activate":
      tone({ freq: 330, dur: 0.1, type: "triangle", gain: 0.08, glideTo: 520 });
      break;
    case "complete":
      tone({ freq: 660, dur: 0.08, type: "sine", gain: 0.07 });
      tone({ freq: 880, dur: 0.1, type: "sine", gain: 0.06, delay: 0.06 });
      break;
    case "handoff":
      tone({ freq: 440, dur: 0.12, type: "sine", gain: 0.06, glideTo: 700 });
      break;
    case "reveal":
      // gentle ascending major arpeggio
      tone({ freq: 523.25, dur: 0.18, type: "sine", gain: 0.09 });
      tone({ freq: 659.25, dur: 0.18, type: "sine", gain: 0.09, delay: 0.1 });
      tone({ freq: 783.99, dur: 0.26, type: "sine", gain: 0.1, delay: 0.2 });
      tone({ freq: 1046.5, dur: 0.4, type: "sine", gain: 0.08, delay: 0.32 });
      break;
    case "deploy":
      tone({ freq: 400, dur: 0.16, type: "triangle", gain: 0.09, glideTo: 760 });
      tone({ freq: 900, dur: 0.12, type: "sine", gain: 0.05, delay: 0.12 });
      break;
    case "optimize":
      // rising whoosh
      tone({ freq: 220, dur: 0.5, type: "sawtooth", gain: 0.05, glideTo: 900 });
      break;
    case "success":
      tone({ freq: 660, dur: 0.16, type: "sine", gain: 0.09 });
      tone({ freq: 990, dur: 0.3, type: "sine", gain: 0.1, delay: 0.12 });
      break;
  }
}

/** Prime the audio context from a user gesture (call on first click). */
export function primeAudio() {
  ac();
}
