#!/usr/bin/env node
/**
 * Plants the tag vocabulary that used to be a `TAGS` array in the schema.
 *
 * Twelve are marked `featured`, which is what the library offers as filters.
 * The rest stay available for tagging but off the rail — that split is the
 * whole point of moving this into the dataset. The old rail listed whatever the
 * catalogue happened to contain and had grown to ~35 chips, which is a
 * vocabulary nobody chose.
 *
 * `createIfNotExists`, with a deterministic `tag.<slug>` id, so this is safe to
 * re-run and will never clobber a featured flag or a rename you made in the
 * Studio. Deleting a tag is a Studio action; this script does not remove
 * anything.
 *
 *   node --env-file=.env.local tools/seed-tags.mjs --dry
 *   node --env-file=.env.local tools/seed-tags.mjs
 */
const DRY = process.argv.includes("--dry");

const PID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!PID) die("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
if (!TOKEN && !DRY) die("SANITY_WRITE_TOKEN is not set, or pass --dry.");

/* Featured first, in the order they should appear in the menu. These are the
   ones that answer "what did you come looking for" — the axis a visitor
   actually browses by. Everything after the divider is real vocabulary that
   simply does not deserve a permanent slot on the rail. */
const FEATURED = [
  "Hero", "Landing page", "Portfolio", "SaaS", "Agency", "Ecommerce",
  "Dashboard", "Background", "Texture", "Workflow", "Dark", "Light",
];

const REST = [
  /* was `shelf` */
  "Build", "Motion", "Craft",
  /* was `mood` */
  "Luxe", "Technical", "Editorial", "Organic", "Brutalist", "Playful",
  /* was `stack` */
  "Next.js", "React", "Astro", "Tailwind", "Three.js", "R3F", "GSAP",
  "Blender", "Figma", "Flux", "Claude", "GPT",
];

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const docs = [
  ...FEATURED.map((title, i) => ({ title, featured: true, order: i })),
  ...REST.map((title, i) => ({ title, featured: false, order: 100 + i })),
].map((d) => ({
  _id: `tag.${slugify(d.title)}`,
  _type: "tag",
  title: d.title,
  slug: { _type: "slug", current: slugify(d.title) },
  featured: d.featured,
  order: d.order,
}));

const main = async () => {
  console.log(`${docs.length} tag(s): ${FEATURED.length} featured, ${REST.length} not.\n`);
  console.log("  featured  " + FEATURED.join(", "));
  console.log("  rest      " + REST.join(", "));

  if (DRY) return console.log("\n--dry: nothing written.");

  const res = await fetch(`https://${PID}.api.sanity.io/v2024-01-01/data/mutate/${DS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: docs.map((doc) => ({ createIfNotExists: doc })) }),
  });
  if (!res.ok) die(`mutate ${res.status}: ${(await res.text()).slice(0, 300)}`);

  console.log(`\nSeeded. Existing documents were left exactly as they were.`);
  console.log(`Add, rename or delete tags in the Studio from here on.`);
};

function die(m) {
  console.error(`\n${m}\n`);
  process.exit(1);
}

main().catch((e) => die(e.message));
