#!/usr/bin/env node
/**
 * Moves existing assets onto the simplified schema.
 *
 * Five taxonomies become one tag list, a boolean becomes a tier, and two prose
 * fields get their new names:
 *
 *   shelf, mood, category, theme, stack  ->  tags[]
 *   free: true|false                     ->  tier: "Free" | "Premium"
 *   promptBody                           ->  prompt
 *   body (block array)                   ->  notes (markdown text)
 *
 * What it does NOT touch:
 *
 *   files[]        paths into the private bucket. Nothing here goes near them.
 *   poster, clip   still path strings. Existing documents keep rendering
 *                  through the legacy branch in lib/kl/media.ts; only assets
 *                  uploaded in the Studio from now on carry a `media` asset.
 *
 * Old fields are left in place rather than unset, so rolling back is a redeploy
 * rather than a restore. Clean them up by hand once the new shape has stuck.
 *
 *   node --env-file=.env.local tools/migrate-asset-schema.mjs --dry
 *   node --env-file=.env.local tools/migrate-asset-schema.mjs
 */
const DRY = process.argv.includes("--dry");

const PID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!PID) die("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
if (!TOKEN && !DRY) die("SANITY_WRITE_TOKEN is not set, or pass --dry.");

const API = `https://${PID}.api.sanity.io/v2024-01-01`;
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

/**
 * `stack` was one free-text string, often naming two things — "NEXT · TW",
 * "CLAUDE · MCP". As a tag that is useless: nothing else will ever equal it, so
 * it filters exactly one asset. Split it, and normalise the shouty forms onto
 * the curated vocabulary so the picker recognises them. Anything unrecognised
 * survives title-cased rather than being dropped — a tag we did not anticipate
 * is still better data than no tag.
 */
const STACK_ALIASES = {
  NEXT: "Next.js", "NEXT.JS": "Next.js", TW: "Tailwind", TAILWIND: "Tailwind",
  "THREE.JS": "Three.js", THREE: "Three.js", R3F: "R3F", WEBGL: "WebGL",
  GSAP: "GSAP", ASTRO: "Astro", REACT: "React", CSS: "CSS",
  CLAUDE: "Claude", MCP: "MCP / Agent", GPT: "GPT", FLUX: "Flux",
  MIDJOURNEY: "Midjourney", RUNWAY: "Runway", CURSOR: "Cursor",
  BLENDER: "Blender", FIGMA: "Figma", LORA: "LoRA",
};

const splitStack = (stack) =>
  typeof stack === "string"
    ? stack
        .split(/[·,/]+/)
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => STACK_ALIASES[x.toUpperCase()] ?? x.charAt(0) + x.slice(1).toLowerCase())
    : [];

/* Blocks to markdown, shallowly. These bodies are paragraphs — no lists, no
   marks — so anything cleverer would be scaffolding for content that does not
   exist. A block with children joins its spans; anything else is skipped. */
const blocksToText = (body) =>
  Array.isArray(body)
    ? body
        .filter((b) => b?._type === "block" && Array.isArray(b.children))
        .map((b) => b.children.map((c) => c?.text ?? "").join(""))
        .filter(Boolean)
        .join("\n\n")
    : undefined;

const main = async () => {
  const query = encodeURIComponent(
    `*[_type == "asset"]{_id, name, shelf, mood, category, theme, stack, free, tier, tags, promptBody, prompt, body, notes}`
  );
  const res = await fetch(`${API}/data/query/${DS}?query=${query}`, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined,
  });
  const { result: docs = [] } = await res.json();
  if (!docs.length) return console.log("No assets found.");

  const patches = [];
  for (const d of docs) {
    const set = {};

    /* Dedupe and drop empties: several assets share a theme or a shelf, and a
       tag list with "Dark" twice is a filter that looks broken. */
    const tags = [
      ...new Set([d.shelf, d.mood, d.category, d.theme, ...splitStack(d.stack)].filter(Boolean)),
    ];
    if (tags.length && !d.tags?.length) set.tags = tags;

    if (!d.tier) set.tier = d.free ? "Free" : "Premium";
    if (d.promptBody && !d.prompt) set.prompt = d.promptBody;

    const notes = blocksToText(d.body);
    if (notes && !d.notes) set.notes = notes;

    if (Object.keys(set).length) patches.push({ id: d._id, name: d.name, set });
  }

  console.log(`${docs.length} asset(s); ${patches.length} need patching.\n`);
  for (const p of patches.slice(0, 20)) {
    const bits = Object.entries(p.set).map(
      ([k, v]) => `${k}=${Array.isArray(v) ? `[${v.join(", ")}]` : String(v).slice(0, 40)}`
    );
    console.log(`  ${(p.name ?? p.id).padEnd(26)} ${bits.join("  ")}`);
  }
  if (patches.length > 20) console.log(`  … ${patches.length - 20} more`);

  if (DRY) return console.log("\n--dry: nothing written.");
  if (!patches.length) return;

  const mutations = patches.map((p) => ({ patch: { id: p.id, set: p.set } }));
  const w = await fetch(`${API}/data/mutate/${DS}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ mutations }),
  });
  if (!w.ok) die(`mutate ${w.status}: ${(await w.text()).slice(0, 300)}`);
  console.log(`\nPatched ${patches.length} document(s). Old fields left in place as the rollback.`);
};

function die(m) {
  console.error(`\n${m}\n`);
  process.exit(1);
}

main().catch((e) => die(e.message));
