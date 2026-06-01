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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {muted ? (
          <>
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        ) : (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        )}
      </svg>
    </button>
  );
}
