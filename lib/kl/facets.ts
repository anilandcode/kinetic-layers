import type { Asset } from "./types";

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

/**
 * `type` is still its own axis because it is the tab row — the thing the UI
 * navigates by. Everything else that used to be a named column (category,
 * theme, mood, shelf, stack) is a tag, and filtering is membership rather than
 * equality. `tags` is AND, not OR: picking two narrows, which is what a filter
 * row is for.
 */
export type Filters = {
  /** Asset type: the tab row. A free string on Asset, so no enum to widen. */
  type?: string;
  tags?: string[];
  /** Favourites. Not a field on Asset — see `saved` below. */
  saved?: boolean;
  /** Tier. Its own axis rather than a tag, because it is what you can take. */
  price?: "free" | "premium";
};

/**
 * `saved` is the one filter that is not a property of the asset. It lives in
 * Supabase, per viewer, so it arrives as a set of slugs the page has already
 * read rather than as something that could be answered from the catalogue.
 * Passing it in keeps Asset honest: no phantom field that is only ever
 * populated for one signed-in request.
 */
const matches = (a: Asset, f: Filters, saved: ReadonlySet<string>) =>
  (!f.type || a.type === f.type) &&
  (!f.tags?.length || f.tags.every((t) => a.tags?.includes(t))) &&
  (!f.price || (f.price === "free") === a.free) &&
  (!f.saved || saved.has(a.slug));

const NONE: ReadonlySet<string> = new Set();

export function applyFilters(all: Asset[], f: Filters, saved: ReadonlySet<string> = NONE): Asset[] {
  return all.filter((a) => matches(a, f, saved));
}

export type Facets = {
  type: Record<string, number>;
  tags: Record<string, number>;
  price: { free: number; premium: number };
  /** Total with every current filter applied — what the grid actually shows. */
  matching: number;
};

export function countFacets(all: Asset[], f: Filters, saved: ReadonlySet<string> = NONE): Facets {
  /* For each dimension, drop that dimension's own selection before counting,
     so a chip's number answers "what would I get if I picked this instead". */
  const forType = all.filter((a) => matches(a, { ...f, type: undefined }, saved));
  const forPrice = all.filter((a) => matches(a, { ...f, price: undefined }, saved));

  const tally = (rows: Asset[], key: (a: Asset) => string) =>
    rows.reduce<Record<string, number>>((m, a) => {
      const k = key(a);
      m[k] = (m[k] ?? 0) + 1;
      return m;
    }, {});

  /* A tag's count is measured with the OTHER selected tags still applied but
     that tag itself dropped, so the number answers "what would adding this
     give me" — the same rule as before, now per tag rather than per column. */
  const tagCounts: Record<string, number> = {};
  const selected = f.tags ?? [];
  const universe = new Set(all.flatMap((a) => a.tags ?? []));
  for (const tag of universe) {
    const others = selected.filter((t) => t !== tag);
    tagCounts[tag] = all.filter(
      (a) => matches(a, { ...f, tags: others }, saved) && a.tags?.includes(tag)
    ).length;
  }

  return {
    /* Only values that actually occur are tallied, so the chip list is drawn
       from the catalogue rather than from an aspirational enum — the same
       reason DownloadFilter derives its options. */
    type: tally(forType.filter((a) => a.type), (a) => a.type),
    tags: tagCounts,
    price: {
      free: forPrice.filter((a) => a.free).length,
      premium: forPrice.filter((a) => !a.free).length,
    },
    matching: applyFilters(all, f, saved).length,
  };
}

export const SORTS = ["featured", "popular", "newest", "name"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABEL: Record<Sort, string> = {
  featured: "Featured",
  popular: "Popular",
  newest: "Recent",
  name: "A–Z",
};

/**
 * The Sanity query already returns newest-first, so "newest" is a no-op rather
 * than a re-sort on a date the card projection does not even carry. Every other
 * sort is stable on top of that, so ties fall back to newest rather than to
 * whatever order the array happened to be in.
 */
export function sortAssets(assets: Asset[], sort: Sort): Asset[] {
  if (sort === "newest") return assets;
  const out = [...assets];

  if (sort === "name") {
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }

  if (sort === "featured") {
    out.sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        (a.priority ?? Number.POSITIVE_INFINITY) - (b.priority ?? Number.POSITIVE_INFINITY)
    );
    return out;
  }

  /* Popularity is real but young: until someone has downloaded or saved
     something, every count is zero and sorting by it would present an arbitrary
     order as a ranking. Fall back to the editorial one until there is a signal
     worth showing. */
  if (sort === "popular") {
    if (!assets.some((a) => (a.popularity ?? 0) > 0)) return sortAssets(assets, "featured");
    out.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return out;
  }

  return out;
}

/** Featured is the default: it is the one order somebody actually chose. */
export const asSort = (v: unknown): Sort =>
  typeof v === "string" && (SORTS as readonly string[]).includes(v) ? (v as Sort) : "featured";
