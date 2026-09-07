/**
 * Shapes shared by the Sanity queries and the components that render them.
 *
 * These replace the literal types that used to live beside the hardcoded
 * catalogue. The field names are unchanged, so the components did not have to
 * be rewritten when the data moved to Sanity.
 */

export type Shelf = "Build" | "Motion" | "Craft";
export type Theme = "Dark" | "Light";
/** What the asset is FOR — the question a visitor arrives with. */
export type Category =
  | "Hero" | "Landing page" | "Portfolio" | "SaaS" | "Agency"
  | "Ecommerce" | "Dashboard" | "Editorial" | "Background" | "Texture" | "Workflow";
export type Mood = "Luxe" | "Technical" | "Editorial" | "Organic" | "Brutalist" | "Playful";

export const SHELVES: Array<"All" | Shelf> = ["All", "Build", "Motion", "Craft"];
export const MOODS: Mood[] = ["Luxe", "Technical", "Editorial", "Organic", "Brutalist", "Playful"];

export type Shot = { label: string; gradient?: string; poster?: string; clip?: string };
export type SpecRow = { k: string; v: string };
export type FileEntry = { name: string; meta?: string; tag?: string; bytes?: number };

export type Asset = {
  slug: string;
  name: string;
  type: string;
  stack: string;
  shelf: Shelf;
  mood: Mood;
  category?: Category;
  theme?: Theme;
  free: boolean;
  tagline?: string;
  /** Masonry height in px — the grid is deliberately ragged. */
  h: number;
  /** Preview fill. Paints instantly, and is the fallback when there is no render. */
  g: string;
  /** Still frame, path relative to NEXT_PUBLIC_MEDIA_BASE. */
  poster?: string;
  /** Looping clip, attached on intent rather than on load. */
  clip?: string;
  /** width/height of the media, so the card reserves the right box. */
  aspect?: number;
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
  poster?: string;
  clip?: string;
  aspect?: number;
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

export type Plan = "free" | "premium";

export type Viewer = {
  id: string;
  email: string | null;
  plan: Plan;
  /** True only while a Premium entitlement is active. */
  /** Whether this account may take files. Named for the Premium plan. */
  premium: boolean;
  periodEnd: string | null;
};
