#!/usr/bin/env node
/**
 * Turns a source video into something a card can actually load.
 *
 * Writes two files beside the input: a trimmed, scaled, silent loop and a
 * poster frame. Upload the poster as Image and the loop as Video — the poster
 * paints instantly and sizes the card, the loop attaches on hover.
 *
 * The size ceiling that matters is not Sanity's. A grid never fetches a clip
 * until someone hovers it, so a heavy file costs one visitor one wait rather
 * than costing the page. The item page is where it bites: that one plays on
 * sight, so the viewer waits for it before anything moves. At 10 Mbps every
 * 1.2 MB is roughly a second of staring at a still.
 *
 *   node tools/optimize-clip.mjs clip.mp4                 # 6s, 1280px, ~2 MB
 *   node tools/optimize-clip.mjs clip.mp4 --max-mb 12     # bigger, still sane
 *   node tools/optimize-clip.mjs clip.mp4 --seconds 10 --width 1600
 *   node tools/optimize-clip.mjs clip.mp4 --start 4       # skip a dull opening
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat } from "node:fs/promises";
import path from "node:path";

const run = promisify(execFile);

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(args[i + 1]);
};

if (!input) die("Usage: node tools/optimize-clip.mjs <video> [--seconds 6] [--width 1280] [--max-mb 2] [--start 0]");

const seconds = flag("seconds", 6);
const width = flag("width", 1280);
const maxMb = flag("max-mb", 2);
const start = flag("start", 0);

const dir = path.dirname(input);
const base = path.basename(input).replace(/\.[^.]+$/, "");
const loop = path.join(dir, `${base}-loop.mp4`);
const poster = path.join(dir, `${base}-poster.jpg`);

const mb = (n) => (n / 1048576).toFixed(2);

const main = async () => {
  const probe = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size",
    "-show_entries", "stream=width,height",
    "-of", "default=noprint_wrappers=1:nokey=0",
    input,
  ]).catch(() => die(`Cannot read ${input}. Is it a video, and is ffmpeg installed?`));

  const read = (k) => Number((probe.stdout.match(new RegExp(`^${k}=(.+)$`, "m")) ?? [])[1]);
  const srcDuration = read("duration");
  const srcBytes = read("size");
  const srcW = read("width");

  const outDuration = Math.min(seconds, Math.max(0.5, srcDuration - start));

  /* Aim at the target rather than guess a CRF. Bitrate is the one dial that
     maps directly onto file size: bytes = bitrate x seconds / 8. Leave a
     little headroom for the container and the keyframes. */
  const targetBits = maxMb * 1048576 * 8 * 0.92;
  const bitrate = Math.max(300_000, Math.round(targetBits / outDuration));

  console.log(`\n${path.basename(input)}`);
  console.log(`  source : ${mb(srcBytes)} MB · ${srcDuration.toFixed(1)}s · ${srcW}px`);
  console.log(`  target : ${outDuration.toFixed(1)}s · ${width}px · aiming at ${maxMb} MB\n`);

  /* Two passes: the first measures the material, the second spends the budget
     where it is needed. One pass at a fixed bitrate wastes it on the easy
     frames and starves the busy ones. */
  const vf = `scale=${width}:-2:flags=lanczos,fps=24`;
  const common = [
    "-y", "-loglevel", "error",
    "-ss", String(start), "-t", String(outDuration), "-i", input,
    "-vf", vf, "-an",
    "-c:v", "libx264", "-preset", "slow",
    "-b:v", String(bitrate), "-maxrate", String(Math.round(bitrate * 1.5)),
    "-bufsize", String(bitrate * 2),
    "-pix_fmt", "yuv420p", "-g", "48",
  ];
  const passlog = path.join(dir, `${base}-ffpass`);
  await run("ffmpeg", [...common, "-pass", "1", "-passlogfile", passlog, "-f", "null", "/dev/null"]);
  await run("ffmpeg", [...common, "-pass", "2", "-passlogfile", passlog, "-movflags", "+faststart", loop]);
  await run("rm", ["-f", `${passlog}-0.log`, `${passlog}-0.log.mbtree`]).catch(() => {});

  /* The poster is a frame from the clip itself, not the source, so the still
     and the first frame of the loop are the same picture. */
  await run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", loop,
    "-frames:v", "1", "-q:v", "3", poster,
  ]);

  const [l, p] = await Promise.all([stat(loop), stat(poster)]);
  const saved = ((1 - l.size / srcBytes) * 100).toFixed(0);
  console.log(`  ${path.basename(loop).padEnd(34)} ${mb(l.size).padStart(7)} MB   (${saved}% smaller)`);
  console.log(`  ${path.basename(poster).padEnd(34)} ${mb(p.size).padStart(7)} MB`);

  /* Roughly how long someone stares at the still before the item page moves. */
  const wait = ((l.size * 8) / (10 * 1_000_000)).toFixed(1);
  console.log(`\n  ~${wait}s to load on a 10 Mbps connection.`);
  console.log(`  Upload the poster as Image, the loop as Video.\n`);
};

function die(m) {
  console.error(`\n${m}\n`);
  process.exit(1);
}

main().catch((e) => die(e.stderr?.toString?.().slice(0, 400) || e.message));
