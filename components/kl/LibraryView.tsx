
import { hasRealPreview } from "@/lib/kl/preview-ready";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import GlassButton from "./GlassButton";
import AssetCard from "./AssetCard";
import { UpgradeCard, NewsCard } from "./PromoCards";
import { getAssets, getFilterTags, getSettings } from "@/lib/sanity/queries";
import { sanityConfigured } from "@/lib/sanity/client";
import { getPopularity } from "@/lib/kl/popularity";
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
import type { Asset } from "@/lib/kl/types";
import { MotionGrid } from "./BenchMotion";

/**
 * The library, in the Kinetic Layers treatment.
 *
 * The design's own library screen filters by shelf and mood. This one keeps
 * the axes the app actually slices on — type and tags — because
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
  const [raw, settings, viewer, filterTags, popularity] = await Promise.all([
    getAssets(),
    getSettings(),
    getViewer(),
    getFilterTags(),
    getPopularity(),
  ]);

  /* The catalogue is in Sanity and the counts are in Supabase, so the two meet
     here rather than inside either query. Skipped entirely when there is no
     signal, which keeps every asset's shape identical to what it was. */
  const media = raw.filter(hasRealPreview);
  const all: Asset[] = popularity.size
    ? media.map((a) => ({ ...a, popularity: popularity.get(a.slug) ?? 0 }))
    : media;

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
    /* Repeated ?tag= params, so two tags narrow rather than replace. */
    tags: params.tag ? (Array.isArray(params.tag) ? params.tag : [params.tag]) : undefined,
    saved: one(params.saved) === "1" || undefined,
    price: one(params.price) === "free" ? "free" : one(params.price) === "premium" ? "premium" : undefined,
  };
  const sort = asSort(one(params.sort));

  const facets = countFacets(all, filters, saved);
  const items = sortAssets(applyFilters(all, filters, saved), sort);

  /* The upgrade promo hides only from someone who already subscribes. It used
     to hide from anyone `unlocked`, which early access makes everyone, so the
     design's "Take the whole library." card never appeared at all. */
  const subscribed = Boolean(viewer?.premium);

  /* A pill toggles its own value off when it is already on, so the rail never
     becomes a trap you can only escape via Clear. */
  const href = (patch: Partial<Record<string, string | string[] | undefined>>) => {
    const q = new URLSearchParams();
    const merged: Record<string, string | string[] | undefined> = {
      type: filters.type,
      tag: filters.tags,
      saved: filters.saved ? "1" : undefined,
      price: filters.price,
      /* Featured is the default, so it is the one value left out of the URL. */
      sort: sort === "featured" ? undefined : sort,
      ...patch,
    };
    /* append, not set: `tags` is a list, and a second ?tag= has to survive
       rather than overwrite the first. */
    for (const [k, v] of Object.entries(merged)) {
      if (Array.isArray(v)) v.forEach((x) => x && q.append(k, x));
      else if (v) q.set(k, v);
    }
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

  /**
   * A disclosure, not a client component.
   *
   * This page has no client state at all — every control is a link and the
   * filters live in the URL. `<details>` is the one native element that opens a
   * menu without hydration, so the menus cost nothing and keep working before
   * (and without) JavaScript. components/legacy/CollectionFilter.tsx is the
   * client-state counterpart; deliberately not copied here.
   */
  const Drop = ({
    label,
    value,
    children,
  }: {
    label: string;
    value?: string;
    children: React.ReactNode;
  }) => (
    <details className="kl-drop">
      <summary className="kl-pill" aria-haspopup="menu">
        {label}
        {value ? <span className="kl-drop-value">{value}</span> : null}
        <span className="kl-drop-caret" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </summary>
      <div className="kl-drop-menu" role="menu">
        {children}
      </div>
    </details>
  );

  const DropItem = ({
    label,
    count,
    active,
    to,
  }: {
    label: string;
    count?: number;
    active: boolean;
    to: string;
  }) => {
    const body = (
      <>
        <span>{label}</span>
        {typeof count === "number" ? <span className="kl-pill-n">{count}</span> : null}
      </>
    );
    /* A tag nothing carries is still worth listing — it is the vocabulary, and
       an author needs to see it — but it is not worth clicking, because the
       only place it goes is the empty state. Shown, counted, not offered. */
    if (count === 0 && !active) {
      return (
        <span className="kl-drop-item kl-drop-item--empty" aria-disabled="true">
          {body}
        </span>
      );
    }
    return (
      <Link
        href={to}
        role="menuitem"
        className="kl-drop-item"
        aria-current={active ? "true" : undefined}
        scroll={false}
      >
        {body}
      </Link>
    );
  };

  const types = Object.entries(facets.type).sort((a, b) => b[1] - a[1]);

  /* The curated vocabulary from Sanity, not everything the catalogue happens to
     contain — that is what grew the old rail to ~35 chips. A tag that is
     selected but no longer featured is appended anyway, so a shared URL still
     explains itself instead of filtering by something invisible. */
  const selectedTags = filters.tags ?? [];
  /* The whole curated list, including tags nothing carries yet.

     The rail hid empty tags, and that rule was right for the rail: a chip row
     drawn from the catalogue should not offer a filter that returns nothing.
     This menu is the opposite thing — a vocabulary somebody chose in the Studio
     — and hiding the unused half of it makes a correctly configured library
     look broken. An empty menu says "this is not working"; a menu reading
     "Hero 0" says "nothing is tagged Hero yet", which is true and useful.

     Zero-count entries render as text rather than links below, so nothing here
     ever offers a click that lands on an empty grid. */
  const categories = [
    ...filterTags,
    ...selectedTags.filter((t) => !filterTags.includes(t)),
  ];

  const categoryValue =
    selectedTags.length === 0
      ? undefined
      : selectedTags.length === 1
        ? selectedTags[0]
        : `${selectedTags.length} selected`;

  const isEmpty = items.length === 0;
  const filtering = Boolean(
    filters.type || filters.tags?.length || filters.saved || filters.price
  );
  const emptyState = filtering
    ? {
        title: "No kits match those filters.",
        body: "Try clearing the filters or choose a broader category.",
        href: "/library",
        action: "Clear filters",
      }
    : !sanityConfigured
      ? {
          title: "The library is temporarily unavailable.",
          body: "The catalogue connection is unavailable on this deployment. Please check back shortly.",
          href: "/contact",
          action: "Contact the studio",
        }
      : raw.length > 0
        ? {
            title: "The first kits are in review.",
            body: "Catalogue entries exist, but none has a complete public preview yet. Only release-ready kits appear here.",
            href: "/contact",
            action: "Request a kit",
          }
        : {
            title: "The first drop is being prepared.",
            body: "No release-ready Kinetic Layers kits are published yet. Tell the studio what would help your next project.",
            href: "/contact",
            action: "Tell us what you need",
          };

  return (
    <Shell>
      <SiteHeader />

      <main data-view>
        {/* ---------- Rail ---------- */}
        <div className="kl-rail" id="library" data-rail>
          <div className="kl-pad kl-rail-inner">
            <Pill label="All" active={!filters.type} to={href({ type: undefined })} count={all.length} />
            {types.map(([t, n]) => (
              <Pill
                key={t}
                label={t.toLowerCase().replace(/^\w/, c => c.toUpperCase()).replace(/^3d/, "3D")}
                count={n}
                active={filters.type === t}
                to={href({ type: filters.type === t ? undefined : t })}
              />
            ))}

            <span className="kl-divider" aria-hidden="true" />

            <span className="kl-spacer" />

            {viewer ? (
              <Pill
                label="Saved"
                active={Boolean(filters.saved)}
                to={href({ saved: filters.saved ? undefined : "1" })}
              />
            ) : null}

            <Drop label="Category" value={categoryValue}>
              <DropItem label="All" active={selectedTags.length === 0} to={href({ tag: undefined })} />
              {categories.map((t) => {
                const on = selectedTags.includes(t);
                return (
                  <DropItem
                    key={t}
                    label={t}
                    count={facets.tags[t] ?? 0}
                    active={on}
                    /* Toggling adds or removes one and leaves the rest, so the
                       menu composes rather than resetting. Tags are AND. */
                    to={href({
                      tag: on ? selectedTags.filter((x) => x !== t) : [...selectedTags, t],
                    })}
                  />
                );
              })}
            </Drop>

            <Drop label="Sort" value={SORT_LABEL[sort]}>
              {SORTS.map((s) => (
                <DropItem key={s} label={SORT_LABEL[s]} active={sort === s} to={href({ sort: s })} />
              ))}
            </Drop>

            <Drop
              label="Pricing"
              value={filters.price ? (filters.price === "free" ? "Free" : "Premium") : undefined}
            >
              <DropItem label="All" active={!filters.price} to={href({ price: undefined })} />
              <DropItem
                label="Free"
                count={facets.price.free}
                active={filters.price === "free"}
                to={href({ price: filters.price === "free" ? undefined : "free" })}
              />
              <DropItem
                label="Premium"
                count={facets.price.premium}
                active={filters.price === "premium"}
                to={href({ price: filters.price === "premium" ? undefined : "premium" })}
              />
            </Drop>

            <span className="kl-count">
              {facets.matching} of {all.length}
            </span>
          </div>
        </div>

        {/* ---------- Grid ---------- */}
        <div className="kl-pad" style={{ paddingTop: 24 }}>
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
              <h2>{emptyState.title}</h2>
              <p>{emptyState.body}</p>
              <GlassButton href={emptyState.href} ghost>
                {emptyState.action}
              </GlassButton>
            </div>
          ) : (
            <MotionGrid className="kl-masonry">
              {items.flatMap((asset: Asset, i: number) => {
                const card = (
                  <AssetCard key={asset.slug} asset={asset} />
                );
                /* Promos are seeded into the grid, but never while filtering —
                   someone who narrowed the shelf asked a question, and an
                   advert is not an answer to it. */
                if (filtering) return [card];
                if (i === PROMO_AT.upgrade && !subscribed)
                  return [card, <UpgradeCard key="promo-upgrade" price={settings.monthlyPrice} />];
                if (i === PROMO_AT.news) return [card, <NewsCard key="promo-news" />];
                return [card];
              })}
            </MotionGrid>
          )}
        </div>

      </main>

      <Footer />
    </Shell>
  );
}
