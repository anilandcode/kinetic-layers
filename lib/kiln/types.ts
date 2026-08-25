/**
 * Shapes shared by the Sanity queries and the components that render them.
 *
 * These replace the literal types that used to live beside the hardcoded
 * catalogue. The field names are unchanged, so the components did not have to
 * be rewritten when the data moved to Sanity.
 */

export type Shelf = "Build" | "Motion" | "Craft";
export type Mood = "Luxe" | "Technical" | "Editorial" | "Organic" | "Brutalist" | "Playful";

export const SHELVES: Array<"All" | Shelf> = ["All", "Build", "Motion", "Craft"];
export const MOODS: Mood[] = ["Luxe", "Technical", "Editorial", "Organic", "Brutalist", "Playful"];

export type Shot = { label: string; gradient?: string; image?: string };
export type SpecRow = { k: string; v: string };
export type FileEntry = { name: string; meta?: string; tag?: string; bytes?: number };

export type Asset = {
  slug: string;
  name: string;
  type: string;
  stack: string;
  shelf: Shelf;
  mood: Mood;
  free: boolean;
  tagline?: string;
  /** Masonry height in px — the grid is deliberately ragged. */
  h: number;
  /** Preview fill, standing in until a real render exists. */
  g: string;
  cover?: string;
  body?: unknown;
  shots?: Shot[];
  specs?: SpecRow[];
  files?: FileEntry[];
  /** Length of the full prompt. Sent to everyone; the text itself is not. */
  promptLength?: number;
  /** First two lines only. The design blurs the remainder. */
  promptPreview?: string;
  drop?: { title: string; slug: string; meta?: string; tag?: string };
};

export type Collection = {
  slug: string;
  name: string;
  blurb?: string;
  shelf: Shelf;
  tags: string[];
  h: number;
  g: string;
  cover?: string;
  items: number;
  free: number;
};

export type Drop = {
  title: string;
  slug: string;
  meta?: string;
  tag?: "NEW" | "LIVE" | "SOON";
};

export type Settings = {
  totalAssets: number;
  freeThisMonth: number;
  addedThisWeek: number;
  monthlyPrice: number;
  annualPrice: number;
  currentDrop: string;
  collectionCount: number;
};

export type Plan = "free" | "unlimited";

export type Viewer = {
  id: string;
  email: string | null;
  plan: Plan;
  /** True only while an unlimited entitlement is active. */
  unlimited: boolean;
  periodEnd: string | null;
};
