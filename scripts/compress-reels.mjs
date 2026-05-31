// Compress landing-page reels for smooth web playback.
//
// Why: the source MP4s are 1080–1440px HD but render in a ~244px-wide box.
// The browser decodes full-HD frames just to shrink them — that's what causes
// the stutter on localhost (no network involved). We re-encode to a web-sized
// H.264 file with faststart (index at the front so playback starts instantly),
// strip the (muted) audio, and cap the short side so quality stays crisp at 2x.
//
// Usage:  node scripts/compress-reels.mjs
// Originals are backed up to .reels-backup/ (gitignored) before overwriting.

import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, copyFileSync, statSync, rmSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const REELS_DIR = join(process.cwd(), "public", "reels");
const BACKUP_DIR = join(process.cwd(), ".reels-backup");

// Short side cap (px). Display box is ~244px wide; 540 gives a sharp 2x retina
// image with room to spare while cutting file size dramatically.
const SHORT_SIDE = 540;
const CRF = 30; // 28–32 is a good web range; higher = smaller/softer.

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function encode(backup, dest, vf, attempt = 1) {
  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i", backup, // encode from the pristine backup
        "-vf", vf,
        "-c:v", "libx264",
        "-profile:v", "high",
        "-pix_fmt", "yuv420p",
        "-crf", String(CRF),
        "-preset", "slow",
        "-an", // drop audio (reels play muted)
        "-movflags", "+faststart",
        dest, // write straight to the final path
      ],
      { stdio: ["ignore", "ignore", "inherit"] }
    );
    return true;
  } catch (err) {
    // EBUSY/EPERM: the file is open elsewhere (browser tab / dev server).
    if (attempt < 3) {
      console.log(`  …${dest} is busy, retrying in 2s (attempt ${attempt + 1}/3)`);
      await sleep(2000);
      return encode(backup, dest, vf, attempt + 1);
    }
    console.error(`✗ ${dest} failed after retries: ${err.message}`);
    console.error("  Close any localhost tab playing the reels and re-run.");
    return false;
  }
}

async function main() {
  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

  const files = readdirSync(REELS_DIR).filter(
    (f) => extname(f).toLowerCase() === ".mp4" && !f.startsWith("__tmp__")
  );
  if (!files.length) {
    console.log("No .mp4 files found in public/reels.");
    return;
  }

  // clean any leftover temp files from a previous aborted run
  for (const f of readdirSync(REELS_DIR).filter((f) => f.startsWith("__tmp__"))) {
    try {
      rmSync(join(REELS_DIR, f));
    } catch {
      /* ignore */
    }
  }

  let beforeTotal = 0;
  let afterTotal = 0;

  for (const file of files) {
    const src = join(REELS_DIR, file);
    const backup = join(BACKUP_DIR, file);

    const beforeSize = statSync(src).size;

    // back up original once (so re-runs always encode from pristine source)
    if (!existsSync(backup)) copyFileSync(src, backup);

    // if a backup already exists, the live file may already be compressed —
    // measure "before" from the backup so stats stay accurate on re-runs.
    const trueBefore = statSync(backup).size;
    beforeTotal += trueBefore;

    // scale: cap the SHORT side, keep aspect, ensure even dimensions (-2).
    // a = display aspect (w/h). landscape (a>1) -> cap height; else cap width.
    const vf =
      `scale='if(gt(a,1),-2,${SHORT_SIDE})':'if(gt(a,1),${SHORT_SIDE},-2)':flags=lanczos`;

    const ok = await encode(backup, src, vf);
    if (!ok) {
      afterTotal += beforeSize; // keep totals sane
      continue;
    }

    const afterSize = statSync(src).size;
    afterTotal += afterSize;

    const pct = (100 * (1 - afterSize / trueBefore)).toFixed(0);
    console.log(`✓ ${file.padEnd(48)} ${mb(trueBefore)}MB → ${mb(afterSize)}MB  (-${pct}%)`);
  }

  console.log(
    `\nTotal: ${mb(beforeTotal)}MB → ${mb(afterTotal)}MB  ` +
      `(-${(100 * (1 - afterTotal / beforeTotal)).toFixed(0)}%)`
  );
  console.log("Originals backed up in .reels-backup/ (gitignored).");
}

main();
