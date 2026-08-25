#!/usr/bin/env node
/**
 * Writes the placeholder catalogue out as NDJSON for `sanity dataset import`.
 *
 *   node tools/seed-sanity.mjs && npx sanity dataset import /tmp/kiln-seed.ndjson production --replace
 *
 * Importing through the CLI uses its own session, so this needs no write
 * token. Ids are deterministic (`asset-<slug>`), which makes the import
 * idempotent — re-running updates rather than duplicating.
 */
import { writeFileSync } from "node:fs";

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const slug = (s) => ({ _type: "slug", current: slugify(s) });

/* --- Drops ----------------------------------------------------------- */
const drops = [
  { title: "Drop 019 — Volumetric set", meta: "3 SCENES · 2 PROMPTS · AUG 20", tag: "NEW", shippedAt: "2026-08-20" },
  { title: "Drop 018 — Editorial templates", meta: "4 TEMPLATES · AUG 13", tag: "LIVE", shippedAt: "2026-08-13" },
  { title: "Drop 017 — Agent workflows", meta: "5 MCP CHAINS · AUG 6", tag: "LIVE", shippedAt: "2026-08-06" },
  { title: "Drop 020 — Grain & film", meta: "IN THE KILN · AUG 27", tag: "SOON", shippedAt: "2026-08-27" },
].map((d) => ({
  _id: `drop-${slugify(d.title)}`,
  _type: "drop",
  title: d.title,
  slug: slug(d.title),
  meta: d.meta,
  tag: d.tag,
  shippedAt: new Date(d.shippedAt).toISOString(),
}));

/* --- Assets ---------------------------------------------------------- */
const raw = [
  ["Volumetric Drift", "3D SCENE", "THREE.JS", "Motion", "Luxe", true, 230, "#1D2410"],
  ["Editorial Landing 04", "TEMPLATE", "NEXT · TW", "Build", "Editorial", false, 300, "#242014"],
  ["Cold Open", "PROMPT", "CLAUDE", "Build", "Technical", true, 170, "#10241A"],
  ["Soft Static Field", "BACKGROUND", "WEBGL", "Motion", "Organic", false, 200, "#1A1D26"],
  ["Brutal Grid Pack", "TEMPLATE", "ASTRO", "Build", "Brutalist", false, 260, "#26221A"],
  ["Ash & Ember 24", "IMAGE PACK", "MIDJOURNEY", "Craft", "Luxe", false, 320, "#2A1C12"],
  ["Research Swarm", "MCP / AGENT", "CLAUDE · MCP", "Build", "Technical", true, 180, "#141C24"],
  ["Chrome Liquid", "3D SCENE", "R3F", "Motion", "Luxe", false, 280, "#1E1E24"],
  ["Paper Grain LoRA", "LORA", "FLUX", "Craft", "Organic", false, 210, "#241F16"],
  ["Slow Pan Loop", "VIDEO", "RUNWAY", "Motion", "Editorial", false, 250, "#161D18"],
  ["Terminal Hero", "TEMPLATE", "NEXT · TW", "Build", "Technical", true, 190, "#131614"],
  ["Warm Studio Set", "IMAGE PACK", "FLUX", "Craft", "Organic", false, 290, "#2A2318"],
  ["Refactor Pass", "PROMPT", "CURSOR", "Build", "Technical", false, 165, "#1A1A1E"],
  ["Playful Blocks", "BACKGROUND", "CSS", "Motion", "Playful", true, 220, "#20240F"],
  ["Marble Depth", "3D SCENE", "THREE.JS", "Motion", "Luxe", false, 270, "#1C1A22"],
];

const TAGLINE = {
  "3D SCENE": "Fog, light shafts and depth for hero sections that need to feel expensive. Runs at 60fps, tunes from one config.",
  TEMPLATE: "A full page in production code, on your stack, with the content structure already argued out.",
  PROMPT: "The exact wording that produced the output beside it — including the constraints that stop it drifting.",
  BACKGROUND: "An ambient field that adds depth without a page rebuild, with a static fallback and a reduced-motion path.",
  "IMAGE PACK": "A consistent set shot to one lighting setup, with the reference sheet and the retouch pass included.",
  "MCP / AGENT": "A chain that survived a real client deadline, with the tool definitions and the failure handling intact.",
  LORA: "Weights plus the reference sheet they were trained on, so you can retrain rather than guess.",
  VIDEO: "A loop that runs under 4% CPU on a laptop, with the source project and the export settings.",
};

/* Real text, so the gate has a true character count to show and a genuine
   first two lines to leave unblurred. */
const PROMPT = `Create a cinematic hero section with a slow volumetric fog pass, camera easing on scroll,
and a grain overlay at 6% opacity layered beneath the type. Use a single warm key light
positioned camera-left at 35 degrees above the horizon, with a cool rim at 15% intensity
from behind and slightly right. Fog density should fall off exponentially from the
camera, not linearly — linear reads as haze, exponential reads as depth.

Keep the dust layer on a separate pass so it can be dialled independently: six EXR maps,
rotating at different rates so the field never visibly repeats. Cap the whole scene at
60fps on integrated graphics; if it cannot hold that, cut the dust maps before you cut
the fog resolution.

Expose exactly four parameters: palette, density, drift rate and key angle. Everything
else is baked. A client changing the palette must not be able to break the composition.`;

const FILES = [
  { name: "scene.js", meta: "MODULE · 42 KB", tag: "Code", storagePath: "placeholder/scene.js", bytes: 43008 },
  { name: "Component.tsx", meta: "R3F COMPONENT · 11 KB", tag: "Code", storagePath: "placeholder/Component.tsx", bytes: 11264 },
  { name: "source.blend", meta: "SOURCE FILE · 61 MB", tag: "Source", storagePath: "placeholder/source.blend", bytes: 63963136 },
  { name: "maps/ (6)", meta: "EXR · 18 MB", tag: "Assets", storagePath: "placeholder/maps.zip", bytes: 18874368 },
  { name: "palette.config.json", meta: "4 PARAMETERS · 2 KB", tag: "Config", storagePath: "placeholder/palette.config.json", bytes: 2048 },
  { name: "prompts.md", meta: "2 PROMPTS · FLUX", tag: "Prompts", storagePath: "placeholder/prompts.md", bytes: 4096 },
];

const SHOTS = [
  ["Hero — default palette", "#1D2410"],
  ["Cold palette", "#141C24"],
  ["Depth pass", "#1E1E24"],
  ["Dust layer only", "#241F16"],
];

const assets = raw.map(([name, type, stack, shelf, mood, free, h, tint]) => ({
  _id: `asset-${slugify(name)}`,
  _type: "asset",
  name,
  slug: slug(name),
  type,
  stack,
  shelf,
  mood,
  free,
  tagline: TAGLINE[type] ?? "Built for a real brief, shipped, then cleaned up and filed.",
  previewHeight: h,
  gradient: `linear-gradient(155deg,${tint},#0F0F0D 62%)`,
  /* Paths, not URLs — lib/kiln/media.ts resolves them against whichever host
     NEXT_PUBLIC_MEDIA_BASE names. tools/make-dummy-media.mjs writes exactly
     these names, so the two stay in step without a manifest. */
  poster: `${slugify(name)}/card.webp`,
  clip: `${slugify(name)}/card.mp4`,
  aspect: 1.6,
  shots: SHOTS.map(([label, g], i) => ({
    _key: `shot-${i}`,
    _type: "shot",
    label,
    gradient: `linear-gradient(150deg,${g},#0F0F0D 64%)`,
    poster: `${slugify(name)}/shot-${i + 1}.webp`,
    clip: `${slugify(name)}/shot-${i + 1}.mp4`,
  })),
  specs: [
    { _key: "s1", _type: "specRow", k: "Type", v: type },
    { _key: "s2", _type: "specRow", k: "Shelf", v: shelf },
    { _key: "s3", _type: "specRow", k: "Stack", v: stack },
    { _key: "s4", _type: "specRow", k: "Size", v: "84 MB total" },
    { _key: "s5", _type: "specRow", k: "Performance", v: "60fps · 4% CPU idle" },
    { _key: "s6", _type: "specRow", k: "Shipped on", v: "1 client landing page" },
  ],
  files: FILES.map((f, i) => ({ _key: `f-${i}`, _type: "fileEntry", ...f })),
  promptBody: PROMPT,
  body: [
    {
      _key: "b1",
      _type: "block",
      style: "normal",
      children: [
        {
          _key: "b1s",
          _type: "span",
          text: "Built for a real brief in July, then simplified until it ran at 60fps on a four-year-old laptop. Everything ships with the source, not just the render.",
        },
      ],
    },
  ],
  drop: { _type: "reference", _ref: drops[0]._id },
  publishedAt: new Date("2026-08-20").toISOString(),
}));

/* --- Collections ------------------------------------------------------ */
const collections = [
  ["Editorial Suite", "Build", "A full magazine-style landing system: type scale, section templates and the prompts that wrote the copy.", ["templates", "prompts", "next.js"], 230, "#242014", ["Editorial Landing 04", "Terminal Hero", "Cold Open"]],
  ["Volumetric Set", "Motion", "Fog, light shafts and depth passes for hero sections that need to feel expensive.", ["3d scenes", "webgl", "three.js"], 260, "#1D2410", ["Volumetric Drift", "Chrome Liquid", "Marble Depth"]],
  ["Agent Bench", "Build", "Research, review and refactor chains that survived a real client deadline.", ["agents", "mcp", "claude"], 200, "#141C24", ["Research Swarm", "Refactor Pass"]],
  ["Grain & Film", "Craft", "Paper, halide and dust LoRAs with the reference sheets they were trained on.", ["loras", "flux", "image packs"], 250, "#2A1C12", ["Paper Grain LoRA", "Ash & Ember 24"]],
  ["Brutal Grid", "Build", "Hard-edged layout kits, oversized type and the rules that keep them readable.", ["templates", "astro", "css"], 210, "#26221A", ["Brutal Grid Pack"]],
  ["Slow Motion", "Motion", "Loops, pans and background fields that run under 4% CPU on a laptop.", ["backgrounds", "video", "webgl"], 240, "#161D18", ["Slow Pan Loop", "Soft Static Field", "Playful Blocks"]],
  ["Studio Light", "Craft", "Product lighting setups as prompts, plus the retouch passes that finish them.", ["image packs", "prompts", "midjourney"], 220, "#2A2318", ["Warm Studio Set", "Ash & Ember 24"]],
].map(([name, shelf, blurb, tags, h, tint, members]) => ({
  _id: `collection-${slugify(name)}`,
  _type: "collection",
  name,
  slug: slug(name),
  shelf,
  blurb,
  tags,
  previewHeight: h,
  gradient: `linear-gradient(150deg,${tint},#0F0F0D 62%)`,
  poster: `collections/${slugify(name)}/card.webp`,
  clip: `collections/${slugify(name)}/card.mp4`,
  aspect: 1.6,
  assets: members.map((m, i) => ({
    _key: `a-${i}`,
    _type: "reference",
    _ref: `asset-${slugify(m)}`,
  })),
}));

const settings = {
  _id: "settings",
  _type: "settings",
  totalAssets: 240,
  freeThisMonth: 12,
  addedThisWeek: 9,
  monthlyPrice: 24,
  annualPrice: 240,
  currentDrop: "019",
  collectionCount: 18,
};

const docs = [...drops, ...assets, ...collections, settings];
const out = docs.map((d) => JSON.stringify(d)).join("\n") + "\n";
const path = process.argv[2] ?? "/tmp/kiln-seed.ndjson";
writeFileSync(path, out);
console.log(
  `${docs.length} documents → ${path}  (${drops.length} drops, ${assets.length} assets, ${collections.length} collections, 1 settings)`
);
