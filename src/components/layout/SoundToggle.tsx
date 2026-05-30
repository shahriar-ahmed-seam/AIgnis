import { useState } from "react";
import { isMuted, setMuted, primeAudio, play } from "../../lib/sound";

/**
 * Global sound on/off toggle. Persists to localStorage and primes the audio
 * context on click (browsers require a user gesture before audio can start).
 */
export function SoundToggle() {
  const [muted, setMutedState] = useState(isMuted());

  return (
    <button
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
        if (!next) {
          primeAudio();
          play("tick");
        }
      }}
      title={muted ? "Sound off" : "Sound on"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors hover:border-white/25 hover:text-ink-100"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
