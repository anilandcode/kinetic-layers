import Link from "next/link";
import Header from "./Header";
import Shell from "./Shell";
import Footer from "./Footer";
import GlassButton from "./GlassButton";
import AssetCard from "./AssetCard";
import DotFieldCta from "./DotFieldCta";
import { UpgradeCard, HireCard, NewsCard } from "./PromoCards";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import { createClient } from "@/lib/supabase/server";
import {
  applyFilters,
  asSort,
  countFacets,
  sortAssets,
  SORTS,
  SORT_LABEL,
  type Filters,
} from "@/lib/kl/facets";
import { EARLY_ACCESS } from "@/lib/kl/access";
import type { Asset, Category, Theme } from "@/lib/kl/types";

/**
 * The library, in the Kinetic Layers treatment.
 *
 * The design's own library screen filters by shelf and mood. This one keeps
 * the axes the app actually slices on — type, category and theme — because
 * those are the ones with faceted counts behind them, and a chip that cannot
 * tell you what it would return is the thing facets.ts was written to fix.
 * The rail is the design's; the vocabulary is the product's.
 *
 * Every count is computed against the OTHER active filters, so a chip's number
 * answers "what would I get if I picked this instead" rather than describing
 * the whole catalogue or the already-filtered set.
 *
 * Filters live in the URL, so a filtered view is shareable and the back button
 * works — which is also why every control here is a link.
 */

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const PROMO_AT = { upgrade: 4, hire: 9, news: 14 };

export default async function LibraryView({ searchParams }: { searchParams?: Promise<Search> }) {
  const params = (await searchParams) ?? {};
  const [all, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);

  /* Favourites are the viewer's own rows, so this reads through the
     RLS-scoped client rather than the service role. Signed out, no query. */
  let saved: ReadonlySet<string> = new Set();
  if (viewer) {
    const supabase = await createClient();
    const { data } = (await supabase!.from("saved_assets").select("asset_slug")) ?? { data: null };
    saved = new Set((data ?? []).map((r) => r.asset_slug));
  }

  const filters: Filters = {
    type: one(params.type) || undefined,
    category: (one(params.category) as Category) || undefined,
    theme: (one(params.theme) as Theme) || undefined,
    saved: one(params.saved) === "1" || undefined,
  };
  const sort = asSort(one(params.sort));

  const facets = countFacets(all, filters, saved);
  const items = sortAssets(applyFilters(all, filters, saved), sort);

  const unlocked = EARLY_ACCESS || Boolean(viewer?.unlimited);

  /* A pill toggles its own value off when it is already on, so the rail never
     becomes a trap you can only escape via Clear. */
  const href = (patch: Partial<Record<string, string | undefined>>) => {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      type: filters.type,
      category: filters.category,
      theme: filters.theme,
      saved: filters.saved ? "1" : undefined,
      sort: sort === "newest" ? undefined : sort,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const qs = q.toString();
    return qs ? `/library?${qs}` : "/library";
  };

  const Pill = ({
    label,
    count,
    active,
    to,
  }: {
    label: string;
    count?: number;
    active: boolean;
    to: string;
  }) => (
    <Link href={to} className="kl-pill" aria-current={active ? "true" : undefined} scroll={false}>
      {label}
      {typeof count === "number" ? <span className="kl-pill-n">{count}</span> : null}
    </Link>
  );

  const types = Object.entries(facets.type).sort((a, b) => b[1] - a[1]);
  const categories = Object.entries(facets.category).sort((a, b) => b[1] - a[1]);
  const themes = Object.entries(facets.theme);

  const isEmpty = items.length === 0;
  const filtering = Boolean(filters.type || filters.category || filters.theme || filters.saved);

  return (
    <Shell>
      <Header />

      <main data-view>
        <div
          className="kl-pad"
          style={{ paddingTop: 76, paddingBottom: 34, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <span className="kl-kicker">THE LIBRARY</span>
          {/* data-mask rebuilds this into per-word spans, so it stays plain text. */}
          <h1 className="kl-h1 kl-h1--library" data-mask data-h1>
            {`${settings.totalAssets} assets, filed by shelf.`}
          </h1>
          <p className="kl-lede" data-rise>
            {settings.freeThisMonth} are free to download now. Filter by type, category or theme —
            every card opens on its source files.
          </p>
        </div>

        {/* ---------- Rail ---------- */}
        <div className="kl-rail" id="library" data-rail>
          <div className="kl-pad kl-rail-inner">
            <Pill label="ALL" active={!filters.type} to={href({ type: undefined })} count={all.length} />
            {types.map(([t, n]) => (
              <Pill
                key={t}
                label={t.toUpperCase()}
                count={n}
                active={filters.type === t}
                to={href({ type: filters.type === t ? undefined : t })}
              />
            ))}

            <span className="kl-divider" aria-hidden="true" />

            {categories.map(([c, n]) => (
              <Pill
                key={c}
                label={c.toUpperCase()}
                count={n}
                active={filters.category === c}
                to={href({ category: filters.category === c ? undefined : c })}
              />
            ))}

            <span className="kl-divider" data-hide-narrow aria-hidden="true" />

            {themes.map(([t, n]) => (
              <Pill
                key={t}
                label={t.toUpperCase()}
                count={n}
                active={filters.theme === t}
                to={href({ theme: filters.theme === t ? undefined : t })}
              />
            ))}

            <span className="kl-spacer" />

            {viewer ? (
              <Pill
                label="SAVED"
                active={Boolean(filters.saved)}
                to={href({ saved: filters.saved ? undefined : "1" })}
              />
            ) : null}

            {SORTS.map((s) => (
              <Pill
                key={s}
                label={SORT_LABEL[s].toUpperCase()}
                active={sort === s}
                to={href({ sort: s })}
              />
            ))}

            <span className="kl-count">
              {facets.matching} of {all.length}
            </span>
          </div>
        </div>

        {/* ---------- Grid ---------- */}
        <div className="kl-pad" style={{ paddingTop: 30 }}>
          {isEmpty ? (
            <div className="kl-empty">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                style={{ color: "var(--muted)" }}
                aria-hidden="true"
              >
                <path d="M0.5 39.5V0.5H39.5" strokeOpacity="0.7" />
                <path d="M12.5 39.5V12.5H39.5" strokeOpacity="0.45" />
                <path d="M24.5 39.5V24.5H39.5" strokeOpacity="0.25" />
              </svg>
              <h2>Nothing on that shelf yet.</h2>
              <p>
                That combination is empty for now. Drop a filter, or tell the studio what you were
                looking for — requests jump the drop queue.
              </p>
              <GlassButton href="/library" ghost>
                Clear filters
              </GlassButton>
            </div>
          ) : (
            <div className="kl-masonry" data-masonry>
              {items.flatMap((asset: Asset, i: number) => {
                const card = (
                  <AssetCard
                    key={asset.slug}
                    asset={asset}
                    index={i}
                    locked={!unlocked && !asset.free}
                  />
                );
                /* Promos are seeded into the grid, but never while filtering —
                   someone who narrowed the shelf asked a question, and an
                   advert is not an answer to it. */
                if (filtering) return [card];
                if (i === PROMO_AT.upgrade && !unlocked)
                  return [card, <UpgradeCard key="promo-upgrade" price={settings.monthlyPrice} />];
                if (i === PROMO_AT.hire) return [card, <HireCard key="promo-hire" />];
                if (i === PROMO_AT.news) return [card, <NewsCard key="promo-news" />];
                return [card];
              })}
            </div>
          )}
        </div>

        <DotFieldCta
          heading={`Start with the ${settings.freeThisMonth} free ones.`}
          body={
            EARLY_ACCESS
              ? "No card, no trial timer. Everything is open while the library is in early access."
              : `No card, no trial timer. If the source files are what you hoped, the rest is $${settings.monthlyPrice} a month.`
          }
          secondaryHref="/library"
          secondaryLabel={`Browse ${settings.freeThisMonth} free`}
          primaryHref="/pricing"
          primaryLabel={EARLY_ACCESS ? "See what's included" : "Go Premium"}
        />
      </main>

      <Footer total={all.length} />
    </Shell>
  );
}
