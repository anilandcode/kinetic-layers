import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/supabase";

/**
 * How often an asset has actually been taken.
 *
 * Downloads plus saves — the two things a visitor does that cost them
 * something. Opening a card is curiosity; downloading it is intent, and intent
 * is what a "Popular" sort is claiming to rank.
 *
 * This counts across everyone, so it reads through the service-role client
 * rather than the RLS-scoped one. A per-viewer client would count only that
 * viewer's own rows and present the result as popularity, which is worse than
 * having no ranking at all.
 *
 * Cached for an hour, matching the catalogue's own revalidate. A ranking that
 * changes between two page loads is noise dressed as information.
 */

export type Popularity = ReadonlyMap<string, number>;

const EMPTY: Popularity = new Map();

/**
 * Two full-column reads and a tally in memory.
 *
 * That is the right shape at this size and the wrong shape later: once these
 * tables run to thousands of rows this should be a Postgres view doing the
 * group-by, and this function should read the view. It is one query either way,
 * so the swap is local to here.
 */
async function tally(): Promise<Record<string, number>> {
  const db = getDb();
  const counts: Record<string, number> = {};

  for (const table of ["downloads", "saved_assets"] as const) {
    const { data, error } = await db.from(table).select("asset_slug");
    if (error) throw new Error(`${table}: ${error.message}`);
    for (const row of data ?? []) {
      const slug = (row as { asset_slug?: string }).asset_slug;
      if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
    }
  }
  return counts;
}

const cached = unstable_cache(tally, ["kl-popularity"], {
  revalidate: 3600,
  tags: ["popularity"],
});

export async function getPopularity(): Promise<Popularity> {
  try {
    return new Map(Object.entries(await cached()));
  } catch {
    /* getDb() throws when Supabase is unconfigured, and a query can fail.
       Popularity is decoration on a page that is otherwise complete: every
       other sort still works, and sortAssets falls back to the editorial order
       when nothing has a count. Failing the whole library over a ranking would
       be the wrong trade. */
    return EMPTY;
  }
}
