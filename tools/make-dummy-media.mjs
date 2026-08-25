#!/usr/bin/env node
/**
 * Synthetic preview media, so the loading path is exercised rather than assumed.
 *
 * Flat CSS gradients would leave every interesting behaviour untested: lazy
 * attach, hover play, decode, the reduced-motion bail-out. Real files — even
 * generated ones — exercise all of it, in the same shape the real renders will
 * have, so nothing downstream changes when those arrive.
 *
 * A caveat worth keeping in mind when reading page-weight numbers: these clips
 * are smooth synthetic gradients, which compress far better than a real UI
 * render. Treat the *number of requests* as the meaningful measure here, not
 * the kilobytes.
 *
 * Writes public/preview/<slug>/, which is what NEXT_PUBLIC_MEDIA_BASE points at
 * locally. Point it at the R2 bucket and the same paths resolve there.
 *
 *   node --env-file=.env.local tools/make-dummy-media.mjs
 */
import { execFile } from "node:child_process";
import { mkdir, rm, readdir, stat, unlink } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);
const OUT = path.join(process.cwd(), "public", "preview");
const PID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/* Deterministic hue per slug, so a regenerated file is not a spurious diff. */
const hue = (s) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};
/** h in degrees, sat and li in percent. Returns ffmpeg's 0xRRGGBB. */
const hex = (h, sat, li) => {
  const s = sat / 100;
  const l = li / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `0x${f(0)}${f(8)}${f(4)}`;
};

async function make(dir, name, slug, seed = 0) {
  const h = (hue(slug) + seed * 47) % 360;
  const mp4 = path.join(dir, `${name}.mp4`);
  const png = path.join(dir, `${name}.png`);
  const webp = path.join(dir, `${name}.webp`);

  /* A drifting three-stop gradient in the asset's own hue, with a blurred
     cellular layer screened over it. Enough structure to prove the clip is
     really playing, and to give the encoder something to chew on. */
  const bed =
    `gradients=s=1280x800:c0=${hex(h, 34, 22)}:c1=${hex((h + 30) % 360, 30, 7)}:` +
    `c2=${hex((h + 60) % 360, 38, 26)}:n=3:x0=140:y0=90:x1=1140:y1=710:speed=0.010:d=4:r=24`;
  const cells =
    `life=s=1280x800:mold=10:r=24:ratio=0.10:death_color=0x0f0f0d:` +
    `life_color=${hex((h + 20) % 360, 32, 26)},boxblur=26:2`;

  await run("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", bed,
    "-f", "lavfi", "-i", cells,
    "-filter_complex", "[0][1]blend=all_mode=screen:all_opacity=0.45,noise=alls=4:allf=t,format=yuv420p",
    "-t", "4", "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "28",
    "-maxrate", "1200k", "-bufsize", "2400k",
    "-movflags", "+faststart", "-g", "48",
    mp4,
  ]);

  /* This ffmpeg build has no WebP encoder and sips can read WebP but not write
     it, so the poster goes through sharp — which Next already depends on. */
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-frames:v", "1", png]);
  await sharp(png).resize(1024).webp({ quality: 68 }).toFile(webp);
  await unlink(png);
}

async function catalogue() {
  if (!PID) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set — run with --env-file=.env.local");
  const q = encodeURIComponent(`*[_type in ["asset","collection"] && defined(slug.current)]{ "slug": slug.current, _type }`);
  const r = await fetch(`https://${PID}.api.sanity.io/v2024-01-01/data/query/${DS}?query=${q}`);
  if (!r.ok) throw new Error(`Sanity query failed: ${r.status}`);
  return (await r.json()).result ?? [];
}

const main = async () => {
  const rows = await catalogue();
  if (!rows.length) throw new Error("No assets in Sanity yet — seed the catalogue first.");

  await rm(OUT, { recursive: true, force: true });
  let files = 0;

  for (const { slug, _type } of rows) {
    const dir = _type === "collection" ? path.join(OUT, "collections", slug) : path.join(OUT, slug);
    await mkdir(dir, { recursive: true });
    await make(dir, "card", slug);
    files += 2;
    if (_type === "asset") {
      /* Three extra shots, so the item page's thumbnail strip has something
         real to switch between. */
      for (let i = 1; i <= 3; i++) {
        await make(dir, `shot-${i}`, slug, i);
        files += 2;
      }
    }
    process.stdout.write(".");
  }

  let bytes = 0;
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) await walk(f);
      else bytes += (await stat(f)).size;
    }
  };
  await walk(OUT);
  console.log(`\n${files} files for ${rows.length} documents · ${(bytes / 1048576).toFixed(1)} MB · avg ${Math.round(bytes / files / 1024)} KB`);
};

main().catch((e) => {
  console.error("\n" + e.message);
  process.exit(1);
});
