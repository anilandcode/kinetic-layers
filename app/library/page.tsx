import type { Metadata } from "next";
import { getViewer } from "@/lib/kl/viewer";
import { getLibrary } from "@/lib/v2/data";
import Shell from "@/components/v2/Shell";
import PageHero from "@/components/v2/PageHero";
import Library from "@/components/v2/Library";
import AccessBand from "@/components/v2/AccessBand";
import l from "@/components/v2/layout.module.css";
import p from "@/components/v2/Page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/library" },
  title: "Library",
  description:
    "Every Kinetic Layers kit — websites, components and motion — each with its spec and the prompts that rebuild it. Filter by type and price.",
};

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * The library — Home's grid, whole, under a short hero.
 *
 * Filtering runs in the browser (components/v2/Library.tsx) and keeps the URL
 * in step, so the search params here only seed the first render: a shared
 * link opens on the view it was copied from.
 */
export default async function LibraryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const viewer = await getViewer();
  const { real, shown, saved } = await getLibrary(viewer);
  const free = real.filter((k) => k.free).length;
  const price = one(params.price);

  return (
    <Shell>
      <main className={p.page}>
        <PageHero
          compact
          id="library-title"
          kicker="The library"
          title="Kits, shown running."
          lede={`${real.length} ${real.length === 1 ? "kit" : "kits"} published. Each one is a finished design, its spec, and the prompts that rebuild it in your stack.`}
        />

        <section className={l.container} aria-labelledby="library-title">
          <Library
            kits={shown}
            headingId="library-title"
            syncUrl
            saved={viewer ? saved : undefined}
            initial={{
              type: one(params.type) || undefined,
              price: price === "free" || price === "premium" ? price : undefined,
              sort: one(params.sort),
              q: one(params.q),
              saved: one(params.saved) === "1",
            }}
          />
        </section>

        <section className={`${l.container} ${p.section}`} aria-labelledby="access-title">
          <AccessBand viewer={viewer} published={real.length} free={free} />
        </section>
      </main>
    </Shell>
  );
}
