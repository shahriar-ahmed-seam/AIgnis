![1780163643772](image/README/1780163643772.png)![1780163648515](image/README/1780163648515.png)![1780163766011](image/README/1780163766011.png)# AIgnis — Text Slideshow (1920×1080, ~35s)

A self-contained animated text slideshow in the AIgnis brand style. Use it to
add ~35 seconds (intro + closing) to your demo video.

## What it is
- 6 slides, auto-playing, ~35 seconds total:
  1. Title — AIgnis · "One idea in. A whole campaign out." (6s)
  2. Problem (6s)
  3. Solution — the agent swarm pillars (6s)
  4. Multimodal — copy/image/video/voice (5s)
  5. Stats — 5 agents · 4 modalities · ~70% cheaper · ~60s (6s)
  6. Outro — AIgnis + team credit (6s)
- Animated gradient background, dot grid, rising text, progress bar.
- Locked to a 1920×1080 stage that scales to fit your screen, so a recording
  is always exactly 16:9.

## How to use it (record it, then drop into CapCut)
1. Open `slideshow.html` in Chrome/Edge.
2. Press **F11** for fullscreen. It auto-plays from the start. (Press **R** or
   **Space** to replay.)
3. Screen-record it:
   - **Windows:** Xbox Game Bar (Win + G → Record), or OBS for a clean 1080p60 capture.
   - Or CapCut's built-in screen recorder.
4. Import the recording into CapCut. Put the **title slide at the start** and the
   **outro slide at the end** of your demo. Trim to taste.
5. (Optional) Add CapCut Text-to-Speech narration from `../VIDEO_SCRIPT.md`, and
   soft background music.

## Tips
- For the crispest result, record at 1080p (1920×1080) and 30 or 60 fps.
- If you only need the intro (~6s) and outro (~6s), record those two segments
  and skip the middle — that still adds ~12s plus your 2:25.
- Want different text/timings/colors? Edit the slides in `slideshow.html`
  (each `<section class="slide" data-dur="6000">` is one slide; `data-dur` is its
  duration in milliseconds).
