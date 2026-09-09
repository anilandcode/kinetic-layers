#!/usr/bin/env node
/**
 * Bring one real asset into Kinetic Layers.
 *
 *   node tools/import-asset.mjs ./incoming/volumetric-drift [--dry-run]
 *
 * The catalogue shipped as fifteen invented assets with placeholder files. Every
 * seam around them is real — the gate, the quota, signed downloads, MCP — so
 * replacing the content needs no code change, only this: a Sanity document and
 * some objects in a private bucket, written together so they cannot disagree.
 *
 * Expects a folder:
 *
 *   <slug>/
 *     asset.json        the metadata (see REQUIRED / ENUMS below)
 *     files/            the real deliverables — uploaded to the private bucket
 *     preview/          optional: card.webp, card.mp4, shot-1.webp, shot-1.mp4 …
 *
 * Nothing here invents data. If a field is missing or an enum value is wrong it
 * refuses and says which — a half-imported asset that renders but cannot be
 * downloaded is worse than one that never appeared.
 */
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { putObject, driver } from "./storage.mjs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const dir = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!dir) die("Usage: node tools/import-asset.mjs <folder> [--dry-run]");

const {
  SUPABASE_URL, SUPABASE_SECRET_KEY,
  NEXT_PUBLIC_SANITY_PROJECT_ID: PID,
  NEXT_PUBLIC_SANITY_DATASET: DS,
  SANITY_WRITE_TOKEN: TOKEN,
} = process.env;

/* Only the Supabase driver needs these. Demanding them under STORAGE_DRIVER=r2
   would refuse a perfectly valid import for a credential it will never use. */
if (driver() === "supabase" && !dryRun && (!SUPABASE_URL || !SUPABASE_SECRET_KEY))
  die("SUPABASE_URL and SUPABASE_SECRET_KEY must be set (or set STORAGE_DRIVER=r2).");
if (!PID || !DS) die("NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET must be set.");
if (!TOKEN && !dryRun)
  die("SANITY_WRITE_TOKEN is not set. Create one at sanity.io/manage → API → Tokens (Editor), or pass --dry-run.");

/* Mirrors sanity/schemas/index.ts. Kept as a copy on purpose: this script runs
   outside the app's TypeScript, and a wrong value here should fail before it
   reaches the dataset, not after. */
const ENUMS = {
  tier: ["Free", "Premium"],
  /* files[].tag, not the asset's tags — a different field with the same word. */
  tag: ["Code", "Source", "Assets", "Config", "Prompts"],
};

/* `tags` is deliberately unvalidated. The vocabulary is editorial and the
   Studio offers a picker; a closed list here would mean editing this script
   every time someone coins a tag, which is how the five dropdowns this replaced
   got there in the first place. */
const REQUIRED = ["name", "type", "tagline"];

const meta = JSON.parse(readFileSync(path.join(dir, "asset.json"), "utf8"));
const slug = meta.slug ?? slugify(meta.name ?? "");
if (!slug) die("asset.json needs a `name` (or an explicit `slug`).");

const problems = [];
for (const k of REQUIRED) if (!meta[k]) problems.push(`missing "${k}"`);
if (meta.tier && !ENUMS.tier.includes(meta.tier))
  problems.push(`"tier" is "${meta.tier}" — must be one of: ${ENUMS.tier.join(", ")}`);
if (meta.tags && !Array.isArray(meta.tags)) problems.push('"tags" must be an array of strings');
if (problems.length) die("asset.json:\n  - " + problems.join("\n  - "));

/* ---- files -------------------------------------------------------------- */
const filesDir = path.join(dir, "files");
const entries = existsSync(filesDir)
  ? readdirSync(filesDir).filter((f) => !f.startsWith(".")).sort()
  : [];
if (!entries.length) die(`No files in ${filesDir}. An asset with nothing to download is not an asset.`);

const fileMeta = Object.fromEntries((meta.files ?? []).map((f) => [f.name, f]));
const files = entries.map((name, i) => {
  const full = path.join(filesDir, name);
  const bytes = statSync(full).size;
  const declared = fileMeta[name] ?? {};
  if (declared.tag && !ENUMS.tag.includes(declared.tag))
    die(`files["${name}"].tag is "${declared.tag}" — must be one of: ${ENUMS.tag.join(", ")}`);
  return {
    _key: `f-${i}`,
    _type: "fileEntry",
    name,
    /* Shown on the item page. Derived from the real file when not declared, so
       the size a visitor reads is the size they get. */
    meta: declared.meta ?? `${path.extname(name).slice(1).toUpperCase() || "FILE"} · ${human(bytes)}`,
    tag: declared.tag ?? "Source",
    storagePath: `${slug}/${name}`,
    bytes,
    _local: full,
  };
});

/* ---- the document ------------------------------------------------------- */
const doc = {
  _id: `asset-${slug}`,
  _type: "asset",
  name: meta.name,
  slug: { _type: "slug", current: slug },
  type: String(meta.type).toUpperCase(),
  tags: meta.tags ?? [],
  /* Defaults to Premium: forgetting the field should keep an asset behind the
     paywall, never hand it out. */
  tier: meta.tier ?? (meta.free === true ? "Free" : "Premium"),
  tagline: meta.tagline,
  poster: `${slug}/card.webp`,
  clip: `${slug}/card.mp4`,
  aspect: meta.aspect ?? 1.6,
  files: files.map(({ _local, ...f }) => f),
  ...(meta.prompt || meta.promptBody ? { prompt: meta.prompt ?? meta.promptBody } : {}),
  /* `notes` is plain markdown now, so design.md can be pasted or piped in
     without being parsed into blocks first. */
  ...(meta.notes ? { notes: meta.notes } : {}),
  publishedAt: meta.publishedAt ?? new Date().toISOString(),
};

console.log(`\n${meta.name}  (${slug})`);
console.log(`  ${doc.type} · ${doc.tier}${doc.tags.length ? " · " + doc.tags.join(", ") : ""}`);
console.log(`  ${files.length} file(s), ${human(files.reduce((n, f) => n + f.bytes, 0))} total`);
console.log(`  prompt: ${doc.prompt ? `${doc.prompt.length} chars` : "none"}`);
console.log(`  notes : ${doc.notes ? `${doc.notes.length} chars` : "none"}`);

if (dryRun) {
  console.log("\n--dry-run: nothing written.\n");
  process.exit(0);
}

/* ---- upload, then publish ----------------------------------------------- */
/* Files first. A document pointing at objects that are not there yet is a
   listing whose download button 409s; the reverse is merely an orphan. */
/* Which store the bytes go into is tools/storage.mjs's decision, driven by
   STORAGE_DRIVER. The key is the same either way, which is what makes moving
   providers a config change rather than a re-import. */
for (const f of files) {
  try {
    await putObject(f.storagePath, readFileSync(f._local));
  } catch (e) {
    die(e.message);
  }
  console.log(`  ↑ ${f.storagePath}`);
}

const res = await fetch(`https://${PID}.api.sanity.io/v2024-01-01/data/mutate/${DS}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
  body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
});
if (!res.ok) die(`Sanity mutate ${res.status}: ${(await res.text()).slice(0, 300)}`);

/* Previews are served from Cloudflare Pages, not Sanity. Copy whatever came
   with the asset into public/preview so `npm run media:deploy` ships it. */
const previewSrc = path.join(dir, "preview");
if (existsSync(previewSrc)) {
  const dest = path.join("public", "preview", slug);
  mkdirSync(dest, { recursive: true });
  for (const f of readdirSync(previewSrc)) copyFileSync(path.join(previewSrc, f), path.join(dest, f));
  console.log(`  → public/preview/${slug}/ (run: npm run media:deploy)`);
} else {
  console.log(`  ! no preview/ folder — run: node --env-file=.env.local tools/make-dummy-media.mjs`);
}

console.log(`\nImported. It is live at /item/${slug} once the cache revalidates.\n`);

/* ------------------------------------------------------------------------- */
function die(msg) { console.error(`\n${msg}\n`); process.exit(1); }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function human(b) {
  if (b >= 1 << 30) return `${(b / (1 << 30)).toFixed(1)} GB`;
  if (b >= 1 << 20) return `${(b / (1 << 20)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(b / 1024))} KB`;
}
/* Portable Text from plain paragraphs, so asset.json stays writable by hand. */
