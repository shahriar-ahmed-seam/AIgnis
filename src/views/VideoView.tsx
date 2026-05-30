import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePipeline } from "../store";
import { usePublish } from "../publishStore";
import { useNav } from "../navStore";
import { VideoReel } from "../components/VideoReel";
import { ChannelIcon } from "../components/ChannelIcon";
import { ModeIndicator } from "../components/ModeIndicator";
import { REEL_SPECS, type ChannelId } from "../types";
import { speak, stopSpeaking, isSpeechOutputSupported } from "../lib/speech";
import { play } from "../lib/sound";

/**
 * Video Studio — turns the static hero creative into animated social video
 * reels per channel (real rendered previews), with a real spoken voiceover
 * (speechSynthesis) and a publish action that pushes to the Published gallery.
 */
export function VideoView() {
  const { asset, dataset, productIdea, goToPulse } = usePipeline();
  const publishCampaign = usePublish((s) => s.publishCampaign);
  const setSection = useNav((s) => s.setSection);

  const [specIdx, setSpecIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => stopSpeaking, []);

  if (!asset || !dataset) return null;
  const spec = REEL_SPECS[specIdx];
  const voiceSupported = isSpeechOutputSupported();

  function doVoiceover() {
    if (!asset) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    play("tick");
    setSpeaking(true);
    const script = `${asset.copy.headline}. ${asset.copy.body}. ${asset.copy.cta}.`;
    speak(script, { onEnd: () => setSpeaking(false) });
  }

  function doPublish() {
    if (!asset) return;
    play("deploy");
    const channels: ChannelId[] = ["tiktok", "instagram", "web"];
    publishCampaign({
      copy: asset.copy,
      hero: asset.hero,
      presetId: dataset!.presetId,
      channels,
    });
    setPublished(true);
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col px-8 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="label-mono mb-1">Video Studio · multimodal export</div>
          <h2 className="font-display text-2xl font-bold text-ink-100">“{productIdea}”</h2>
        </div>
        <div className="flex items-center gap-3">
          <ModeIndicator label="Simulated" />
          <button onClick={goToPulse} className="btn-ghost flex items-center gap-2">
            Skip to analytics →
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_360px] gap-8 overflow-hidden">
        {/* reel preview */}
        <div className="panel flex flex-col items-center justify-center p-6">
          {/* format tabs */}
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5">
            {REEL_SPECS.map((s, i) => (
              <button
                key={s.format}
                onClick={() => {
                  play("tick");
                  setSpecIdx(i);
                  setPlaying(true);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${
                  specIdx === i ? "bg-violet/20 text-violet-glow" : "text-ink-500 hover:text-ink-300"
                }`}
              >
                <ChannelIcon id={s.channel} size={16} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="w-full max-w-[420px]">
            <VideoReel
              spec={spec}
              hero={asset.hero}
              copy={asset.copy}
              presetId={dataset.presetId}
              playing={playing}
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button onClick={() => setPlaying((p) => !p)} className="btn-ghost flex items-center gap-2">
              {playing ? "⏸ Pause" : "▶ Replay"}
            </button>
            {voiceSupported && (
              <button
                onClick={doVoiceover}
                className={`btn-ghost flex items-center gap-2 ${speaking ? "text-magenta" : ""}`}
              >
                {speaking ? "■ Stop voiceover" : "🔊 Play AI voiceover"}
              </button>
            )}
          </div>
        </div>

        {/* publish panel */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="panel p-5">
            <div className="text-sm font-bold text-ink-100">Export & publish</div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
              The Operations agent renders channel-native reels and a spoken voiceover, then
              publishes the campaign across all three channels.
            </p>

            <div className="mt-4 space-y-2">
              {REEL_SPECS.map((s) => (
                <div
                  key={s.format}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-ink-300">
                    <ChannelIcon id={s.channel} size={18} /> {s.label}
                  </span>
                  <span className="font-mono text-[10px] text-lime">✓ rendered</span>
                </div>
              ))}
            </div>

            {!published ? (
              <button onClick={doPublish} className="btn-primary mt-4 w-full">
                📡 Publish to 3 channels
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-center gap-2 rounded-xl border border-lime/30 bg-lime/10 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-xs font-bold text-void-900">
                    ✓
                  </span>
                  <span className="text-sm font-medium text-ink-100">Published live</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSection("published")} className="btn-ghost flex-1 text-sm">
                    View posts
                  </button>
                  <button onClick={goToPulse} className="btn-primary flex-1 text-sm">
                    See Pulse →
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="panel p-5">
            <div className="label-mono mb-2">How the video is made</div>
            <ul className="space-y-1.5 text-xs leading-relaxed text-ink-300">
              <li>• Hero frame from the Diffusion pillar</li>
              <li>• Kinetic captions from the LLM copy</li>
              <li>• Channel-native aspect ratios (9:16 · 1:1 · 16:9)</li>
              <li>• Real spoken voiceover (browser speech synthesis)</li>
            </ul>
            <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 font-mono text-[10px] leading-relaxed text-ink-500">
              Rendered preview. Full neural text-to-video runs offline via the
              Diffusion pillar; exported MP4s drop into /video/reels automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
