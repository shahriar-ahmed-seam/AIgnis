import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePipeline } from "../stores/pipelineStore";
import { PRESETS } from "../data/datasets";
import { play, primeAudio } from "../lib/sound";
import { VoiceInput, isSpeechInputSupported } from "../lib/speech";

/**
 * Landing — a confident hero with a single "search bar from the future"
 * and preset idea chips (Req 2.1, 2.4). Not a form; a launch console.
 * Supports real voice input via the browser SpeechRecognition API.
 */
export function LandingView() {
  const start = usePipeline((s) => s.start);
  const [idea, setIdea] = useState("");
  const [error, setError] = useState(false);
  const [listening, setListening] = useState(false);
  const voiceRef = useRef<VoiceInput | null>(null);
  const speechSupported = isSpeechInputSupported();

  useEffect(() => {
    voiceRef.current = new VoiceInput();
    return () => voiceRef.current?.stop();
  }, []);

  function toggleVoice() {
    primeAudio();
    const v = voiceRef.current;
    if (!v) return;
    if (listening) {
      v.stop();
      setListening(false);
      return;
    }
    play("tick");
    setError(false);
    setListening(true);
    v.start({
      onResult: (transcript, isFinal) => {
        setIdea(transcript);
        if (isFinal) setListening(false);
      },
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
  }

  function launch(value: string) {
    if (value.trim().length === 0) {
      setError(true);
      return;
    }
    primeAudio();
    play("tick");
    setError(false);
    voiceRef.current?.stop();
    setListening(false);
    start(value);
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 py-16">
      {/* eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_#22d3ee]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-300">
          Autonomous Agent Swarm · Online
        </span>
      </motion.div>

      {/* headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="max-w-4xl text-center font-display text-6xl font-extrabold leading-[1.05] tracking-tight text-balance"
      >
        Turn one <span className="text-gradient">product idea</span>
        <br /> into a launch-ready campaign.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
        className="mt-6 max-w-2xl text-center text-lg leading-relaxed text-ink-300"
      >
        A swarm of specialized AI agents researches the market, writes the copy, and
        renders the creative — multimodal, on-brand, on autopilot.
      </motion.p>

      {/* the launch console */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.24 }}
        className="mt-12 w-full max-w-2xl"
      >
        <div
          className={`panel relative flex items-center gap-3 rounded-2xl p-2 pl-5 transition-all duration-300 ${
            error ? "ring-1 ring-magenta/60" : "focus-within:glow-violet"
          }`}
        >
          <span className="font-mono text-lg text-violet-glow">›</span>
          <input
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && launch(idea)}
            placeholder={listening ? "listening…" : "e.g. eco-friendly sneakers for city runners…"}
            className="flex-1 bg-transparent py-3 text-lg text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          {speechSupported && (
            <button
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Speak your idea"}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                listening
                  ? "border-magenta/50 bg-magenta/15 text-magenta"
                  : "border-white/10 bg-white/[0.02] text-ink-300 hover:text-ink-100"
              }`}
            >
              {listening && (
                <motion.span
                  className="absolute inset-0 rounded-xl border border-magenta"
                  animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <span className="relative z-10 text-lg">🎙</span>
            </button>
          )}
          <button onClick={() => launch(idea)} className="btn-primary group">
            <span className="relative z-10 flex items-center gap-2">
              Forge Campaign
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </button>
        </div>

        {listening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 pl-2 font-mono text-xs text-magenta"
          >
            ● Listening — speak your product idea, then it will auto-submit.
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 pl-2 font-mono text-xs text-magenta"
          >
            Enter a product idea to start the engine.
          </motion.p>
        )}

        {/* preset chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="label-mono">Try</span>
          {PRESETS.map((p, i) => (
            <motion.button
              key={p.presetId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 + i * 0.07 }}
              onClick={() => {
                setIdea(p.exampleLabel);
                launch(p.exampleLabel);
              }}
              className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-ink-300 transition-all duration-200 hover:border-violet/40 hover:bg-violet/10 hover:text-ink-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet/60 transition-colors group-hover:bg-violet-glow" />
              {p.exampleLabel}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* quiet footer stat strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 flex items-center gap-8 font-mono text-xs text-ink-500"
      >
        <span>5 specialized agents</span>
        <span className="h-1 w-1 rounded-full bg-ink-700" />
        <span>text · image · strategy</span>
        <span className="h-1 w-1 rounded-full bg-ink-700" />
        <span>~60s autonomous run</span>
      </motion.div>
    </div>
  );
}
