/**
 * Shapes shared by the Sanity queries and the components that render them.
 *
 * These replace the literal types that used to live beside the hardcoded
 * catalogue. The field names are unchanged, so the components did not have to
 * be rewritten when the data moved to Sanity.
 */

/* Shelf, Mood, Category and Theme used to be four closed unions and four
   required fields. They are values in `tags` now — see sanity/schemas/index.ts.
   Nothing types a tag, deliberately: the vocabulary is editorial, and a union
   here would mean a deploy every time someone coins one. */

export type SpecRow = { k: string; v: string };
export type FileEntry = { name: string; meta?: string; tag?: string; bytes?: number };

export type Asset = {
  slug: string;
  name: string;
  type: string;
  /**
   * One list where there used to be five fields. `shelf`, `mood`, `category`,
   * `theme` and `stack` are all in here now — the library filters on membership
   * rather than on equality against a named column.
   */
  tags: string[];
  free: boolean;
  /**
   * Editorial ordering. `featured` leads the library under the Featured sort;
   * `priority` breaks ties among featured assets, lower first. Both are set in
   * the Studio — nothing derives them.
   */
  featured?: boolean;
  priority?: number;
  /**
   * Downloads plus saves, counted in Supabase and merged in by the library.
   * Absent everywhere else, and zero for everything until there is traffic.
   */
  popularity?: number;
  tagline?: string;
  /**
   * Masonry height in px. Derived from the uploaded image's real dimensions
   * where there is one, so nobody types a number that the picture then
   * disagrees with. Falls back to a default for video-only and legacy rows.
   */
  h: number;
  /**
   * Still frame. Either an absolute Sanity CDN URL for anything uploaded in the
   * Studio, or a path relative to NEXT_PUBLIC_MEDIA_BASE for rows that predate
   * that — mediaUrl() passes absolute URLs straight through, so both work.
   */
  poster?: string;
  /** Looping clip, attached on intent rather than on load. */
  clip?: string;
  /** width/height of the media, so the card reserves the right box. */
  aspect?: number;
  /** Markdown. The old block-array `body`, and where design.md gets pasted. */
  notes?: string;
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
  tags: string[];
  h: number;
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
  /** profiles.display_name, when the account has set one. */
  name: string | null;
  plan: Plan;
  /** Whether this account may take files. Named for the Premium plan. */
  premium: boolean;
  periodEnd: string | null;
};
