import type { Asset, Mood, Shelf } from "./types";

/**
 * Faceted counts for the library filters.
 *
 * Each facet is counted against the OTHER active filters, never against the
 * whole catalogue and never against the fully-filtered set. That is the only
 * count that tells the truth about what clicking will do: showing "Motion (6)"
 * while a mood filter is on, when picking Motion would actually return 2, is a
 * worse lie than showing no number at all — and inventing numbers is exactly
 * what the old hardcoded "240 assets" did.
 *
 * getlayers.ai puts a count on every chip; it is the single clearest thing
 * they do that we did not.
 */

export type Filters = { shelf?: Shelf; mood?: Mood; freeOnly?: boolean };

const matches = (a: Asset, f: Filters) =>
  (!f.shelf || a.shelf === f.shelf) &&
  (!f.mood || a.mood === f.mood) &&
  (!f.freeOnly || a.free);

export function applyFilters(all: Asset[], f: Filters): Asset[] {
  return all.filter((a) => matches(a, f));
}

export type Facets = {
  shelf: Record<string, number>;
  mood: Record<string, number>;
  free: number;
  /** Total with every current filter applied — what the grid actually shows. */
  matching: number;
};

export function countFacets(all: Asset[], f: Filters): Facets {
  /* For each dimension, drop that dimension's own selection before counting,
     so a chip's number answers "what would I get if I picked this instead". */
  const forShelf = all.filter((a) => matches(a, { ...f, shelf: undefined }));
  const forMood = all.filter((a) => matches(a, { ...f, mood: undefined }));
  const forFree = all.filter((a) => matches(a, { ...f, freeOnly: false }));

  const tally = (rows: Asset[], key: (a: Asset) => string) =>
    rows.reduce<Record<string, number>>((m, a) => {
      const k = key(a);
      m[k] = (m[k] ?? 0) + 1;
      return m;
    }, {});

  return {
    shelf: { All: forShelf.length, ...tally(forShelf, (a) => a.shelf) },
    mood: tally(forMood, (a) => a.mood),
    free: forFree.filter((a) => a.free).length,
    matching: applyFilters(all, f).length,
  };
}

export const SORTS = ["newest", "name", "free"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABEL: Record<Sort, string> = {
  newest: "Newest",
  name: "A–Z",
  free: "Free first",
};

/**
 * The Sanity query already returns newest-first, so "newest" is a no-op rather
 * than a re-sort on a date the card projection does not even carry.
 */
export function sortAssets(assets: Asset[], sort: Sort): Asset[] {
  if (sort === "newest") return assets;
  const out = [...assets];
  if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "free") out.sort((a, b) => Number(b.free) - Number(a.free));
  return out;
}

export const asSort = (v: unknown): Sort =>
  typeof v === "string" && (SORTS as readonly string[]).includes(v) ? (v as Sort) : "newest";
