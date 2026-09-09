#!/usr/bin/env node
/**
 * Puts placeholder files in the private `assets` bucket so the download path
 * runs end to end before any real asset exists.
 *
 *   node tools/seed-storage.mjs
 *
 * These are honest placeholders: each one says what it stands in for and that
 * it is not the real thing. Swapping in real files is a content job — replace
 * the object at the same path and nothing else changes.
 *
 * Uses the service key, which is the only way to write to a private bucket.
 */
import { readFileSync } from "node:fs";
import { putObject, driver } from "./storage.mjs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set.");
  process.exit(1);
}



const note = (what) =>
  `PLACEHOLDER — ${what}

This file stands in for a real Kinetic Layers asset so the download path can be tested
end to end. It is not the asset. Replace the object at this path in the
Supabase "assets" bucket and the site will serve the real thing with no code
change.

Generated ${new Date().toISOString()}
`;

/* Paths match the storagePath values in the Sanity seed. */
const files = [
  ["placeholder/scene.js", note("a Three.js scene module"), "text/javascript"],
  ["placeholder/Component.tsx", note("a React Three Fiber component"), "text/plain"],
  ["placeholder/source.blend", note("a Blender source file"), "application/octet-stream"],
  ["placeholder/maps.zip", note("an archive of EXR dust maps"), "application/zip"],
  ["placeholder/palette.config.json", JSON.stringify({ _placeholder: true, palette: "warm", density: 0.6, drift: 0.2, keyAngle: 35 }, null, 2), "application/json"],
  ["placeholder/prompts.md", note("the prompt set used to generate the maps"), "text/markdown"],
];

let ok = 0;
for (const [path, body, contentType] of files) {
  try {
    await putObject(path, Buffer.from(body), contentType);
    ok++;
    console.log(`  ✓ ${path}`);
  } catch (e) {
    console.error(`  ✗ ${path}: ${e.message}`);
  }
}

console.log(`\n${ok}/${files.length} placeholder files in the private bucket.`);

/* Prove the bucket is actually private: an unsigned fetch must fail. This is
   the check worth keeping when providers change — a gated file reachable by
   plain URL is the whole paywall gone, and it fails silently. */
if (driver() === "r2") {
  console.log(
    "\nSTORAGE_DRIVER=r2 — no unsigned-read probe here, because R2 has no fixed\n" +
      "public URL to try unless a bucket is given one. Verify by hand that the\n" +
      "gated bucket has NO public development URL and no custom domain attached."
  );
  process.exit(0);
}

const probe = `${url}/storage/v1/object/assets/placeholder/prompts.md`;
const res = await fetch(probe);
console.log(
  res.ok
    ? `\n!! The bucket is READABLE without a signature (${res.status}). That defeats the paywall.`
    : `\nUnsigned read correctly refused (${res.status}) — the gate holds.`
);
