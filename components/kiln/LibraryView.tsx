import { Suspense } from "react";
import { Footer, Nav } from "@/components/kiln/Chrome";
import Library from "@/components/kiln/Library";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";
import { createClient } from "@/lib/supabase/server";
import { applyFilters, asSort, countFacets, sortAssets } from "@/lib/kiln/facets";
import type { Category, Theme } from "@/lib/kiln/types";

/**
 * The library, in either treatment.
 *
 * This used to be the second half of the home page, which meant a first-time
 * visitor met a filter bar before they had been told what the place was, and
 * the filters lived on the one page nobody arrives at wanting to filter. Home
 * is a landing page now; browsing happens here.
 *
 * Split out of the route for the same reason HomeView is: /light renders the
 * identical page in the storefront treatment, and two routes rendering one
 * component cannot drift the way two copies would.
 */
export default async function LibraryView({
  light = false,
  searchParams,
}: {
  light?: boolean;
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = (await searchParams) ?? {};
  const [all, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);

  /* Favourites needs the viewer's own rows, so it reads through the RLS-scoped
     client rather than the service role — the same call the item page makes to
     decide whether its save button starts filled. Signed out, no query runs. */
  let saved: ReadonlySet<string> = new Set();
  if (viewer) {
    const supabase = await createClient();
    const { data } = (await supabase!.from("saved_assets").select("asset_slug")) ?? { data: null };
    saved = new Set((data ?? []).map((r) => r.asset_slug));
  }

  const filters = {
    type: params.type || undefined,
    category: (params.category as Category) || undefined,
    theme: (params.theme as Theme) || undefined,
    saved: params.saved === "1" || undefined,
  };
  const sort = asSort(params.sort);

  const facets = countFacets(all, filters, saved);
  const assets = sortAssets(applyFilters(all, filters, saved), sort);

  return (
    <div className={light ? "kiln-light" : undefined}>
      <a className="skip-link" href="#library">
        Skip to the library
      </a>
      <Nav light={light} viewer={viewer} />

      <main>
        {/* A header, not a hero. The hero belongs on the page someone lands on;
            here the filters should be reachable without a scroll. */}
        <section className="shell" style={{ paddingBlock: "52px 22px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 620 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              {settings.totalAssets} assets · {settings.freeThisMonth} free this month
            </span>
            <h1
              style={{
                fontSize: "clamp(30px, 3.8vw, 46px)",
                lineHeight: 1.08,
                fontWeight: 500,
                letterSpacing: "-0.035em",
                textWrap: "pretty",
              }}
            >
              The whole vault.
            </h1>
          </div>
        </section>

        <div id="library">
          <Suspense fallback={<div className="shell" style={{ paddingBlock: 80 }} />}>
            <Library
              assets={assets}
              total={all.length}
              facets={facets}
              sort={sort}
              light={light}
              viewer={viewer}
            />
          </Suspense>
        </div>
      </main>

      <Footer light={light} />
    </div>
  );
}
