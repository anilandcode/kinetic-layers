import type { Asset, Category, Theme } from "./types";

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

/* Shelf, mood and free-only were filters until the bar collapsed to one row.
   They stay on Asset as data — getRelated falls back to shelf — but nothing
   slices the library by them any more. */
export type Filters = { category?: Category; theme?: Theme };

const matches = (a: Asset, f: Filters) =>
  (!f.category || a.category === f.category) && (!f.theme || a.theme === f.theme);

export function applyFilters(all: Asset[], f: Filters): Asset[] {
  return all.filter((a) => matches(a, f));
}

export type Facets = {
  category: Record<string, number>;
  theme: Record<string, number>;
  /** Total with every current filter applied — what the grid actually shows. */
  matching: number;
};

export function countFacets(all: Asset[], f: Filters): Facets {
  /* For each dimension, drop that dimension's own selection before counting,
     so a chip's number answers "what would I get if I picked this instead". */
  const forCategory = all.filter((a) => matches(a, { ...f, category: undefined }));
  const forTheme = all.filter((a) => matches(a, { ...f, theme: undefined }));

  const tally = (rows: Asset[], key: (a: Asset) => string) =>
    rows.reduce<Record<string, number>>((m, a) => {
      const k = key(a);
      m[k] = (m[k] ?? 0) + 1;
      return m;
    }, {});

  return {
    /* Only values that actually occur are tallied, so the chip list is drawn
       from the catalogue rather than from an aspirational enum — the same
       reason DownloadFilter derives its options. */
    category: tally(forCategory.filter((a) => a.category), (a) => a.category!),
    theme: tally(forTheme.filter((a) => a.theme), (a) => a.theme!),
    matching: applyFilters(all, f).length,
  };
}

export const SORTS = ["newest", "name"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABEL: Record<Sort, string> = {
  newest: "Newest",
  name: "A–Z",
};

/**
 * The Sanity query already returns newest-first, so "newest" is a no-op rather
 * than a re-sort on a date the card projection does not even carry.
 */
export function sortAssets(assets: Asset[], sort: Sort): Asset[] {
  if (sort === "newest") return assets;
  const out = [...assets];
  if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export const asSort = (v: unknown): Sort =>
  typeof v === "string" && (SORTS as readonly string[]).includes(v) ? (v as Sort) : "newest";
