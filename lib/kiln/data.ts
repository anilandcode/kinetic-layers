/**
 * The vault.
 *
 * Placeholder catalogue lifted from the design files. Every gradient here
 * stands in for a real preview render — the design calls for looping muted
 * video previews, which is a content job, not a code one.
 */

export type Shelf = "Build" | "Motion" | "Craft";
export type Mood = "Luxe" | "Technical" | "Editorial" | "Organic" | "Brutalist" | "Playful";

export type Asset = {
  slug: string;
  name: string;
  type: string;
  stack: string;
  shelf: Shelf;
  mood: Mood;
  free: boolean;
  /** Masonry height in px — the grid is deliberately ragged. */
  h: number;
  /** Preview fill. */
  g: string;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const raw: Omit<Asset, "slug">[] = [
  { name: "Volumetric Drift", type: "3D SCENE", stack: "THREE.JS", shelf: "Motion", mood: "Luxe", free: true, h: 230, g: "linear-gradient(155deg,#1D2410,#0F0F0D 65%)" },
  { name: "Editorial Landing 04", type: "TEMPLATE", stack: "NEXT · TW", shelf: "Build", mood: "Editorial", free: false, h: 300, g: "linear-gradient(155deg,#242014,#0F0F0D 60%)" },
  { name: "Cold Open", type: "PROMPT", stack: "CLAUDE", shelf: "Build", mood: "Technical", free: true, h: 170, g: "linear-gradient(155deg,#10241A,#0F0F0D 60%)" },
  { name: "Soft Static Field", type: "BACKGROUND", stack: "WEBGL", shelf: "Motion", mood: "Organic", free: false, h: 200, g: "linear-gradient(155deg,#1A1D26,#0F0F0D 62%)" },
  { name: "Brutal Grid Pack", type: "TEMPLATE", stack: "ASTRO", shelf: "Build", mood: "Brutalist", free: false, h: 260, g: "linear-gradient(155deg,#26221A,#0F0F0D 58%)" },
  { name: "Ash & Ember 24", type: "IMAGE PACK", stack: "MIDJOURNEY", shelf: "Craft", mood: "Luxe", free: false, h: 320, g: "linear-gradient(155deg,#2A1C12,#0F0F0D 60%)" },
  { name: "Research Swarm", type: "MCP / AGENT", stack: "CLAUDE · MCP", shelf: "Build", mood: "Technical", free: true, h: 180, g: "linear-gradient(155deg,#141C24,#0F0F0D 60%)" },
  { name: "Chrome Liquid", type: "3D SCENE", stack: "R3F", shelf: "Motion", mood: "Luxe", free: false, h: 280, g: "linear-gradient(155deg,#1E1E24,#0F0F0D 60%)" },
  { name: "Paper Grain LoRA", type: "LORA", stack: "FLUX", shelf: "Craft", mood: "Organic", free: false, h: 210, g: "linear-gradient(155deg,#241F16,#0F0F0D 62%)" },
  { name: "Slow Pan Loop", type: "VIDEO", stack: "RUNWAY", shelf: "Motion", mood: "Editorial", free: false, h: 250, g: "linear-gradient(155deg,#161D18,#0F0F0D 60%)" },
  { name: "Terminal Hero", type: "TEMPLATE", stack: "NEXT · TW", shelf: "Build", mood: "Technical", free: true, h: 190, g: "linear-gradient(155deg,#131614,#0F0F0D 60%)" },
  { name: "Warm Studio Set", type: "IMAGE PACK", stack: "FLUX", shelf: "Craft", mood: "Organic", free: false, h: 290, g: "linear-gradient(155deg,#2A2318,#0F0F0D 58%)" },
  { name: "Refactor Pass", type: "PROMPT", stack: "CURSOR", shelf: "Build", mood: "Technical", free: false, h: 165, g: "linear-gradient(155deg,#1A1A1E,#0F0F0D 62%)" },
  { name: "Playful Blocks", type: "BACKGROUND", stack: "CSS", shelf: "Motion", mood: "Playful", free: true, h: 220, g: "linear-gradient(155deg,#20240F,#0F0F0D 60%)" },
  { name: "Marble Depth", type: "3D SCENE", stack: "THREE.JS", shelf: "Motion", mood: "Luxe", free: false, h: 270, g: "linear-gradient(155deg,#1C1A22,#0F0F0D 60%)" },
];

export const ASSETS: Asset[] = raw.map((a) => ({ ...a, slug: slugify(a.name) }));

export const SHELVES: Array<"All" | Shelf> = ["All", "Build", "Motion", "Craft"];
export const MOODS: Mood[] = ["Luxe", "Technical", "Editorial", "Organic", "Brutalist", "Playful"];

/** Headline counts. The catalogue above is a sample of the full vault. */
export const VAULT = {
  total: 240,
  freeThisMonth: 12,
  addedThisWeek: 9,
  monthly: 24,
  lifetime: 240,
  drop: "019",
} as const;

export type Drop = { title: string; meta: string; tag: "NEW" | "LIVE" | "SOON" };

export const DROPS: Drop[] = [
  { title: "Drop 019 — Volumetric set", meta: "3 SCENES · 2 PROMPTS · AUG 20", tag: "NEW" },
  { title: "Drop 018 — Editorial templates", meta: "4 TEMPLATES · AUG 13", tag: "LIVE" },
  { title: "Drop 017 — Agent workflows", meta: "5 MCP CHAINS · AUG 6", tag: "LIVE" },
  { title: "Drop 020 — Grain & film", meta: "IN THE KILN · AUG 27", tag: "SOON" },
];

export function findAsset(slug: string): Asset | undefined {
  return ASSETS.find((a) => a.slug === slug);
}
