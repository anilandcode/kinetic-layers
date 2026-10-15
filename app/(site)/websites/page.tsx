import type { Metadata } from "next";
import { getWebsites } from "@/lib/sanity/websites";
import { WEBSITE_CATEGORIES } from "@/lib/kl/website-categories";
import PageHero from "@/components/v2/PageHero";
import WebsiteBrowser from "@/components/v2/WebsiteBrowser";
import { ButtonLink } from "@/components/v2/Button";
import l from "@/components/v2/layout.module.css";
import p from "@/components/v2/Page.module.css";
import s from "@/components/v2/Website.module.css";

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata(): Promise<Metadata> {
  const sites = await getWebsites();
  return {
    alternates: { canonical: "/websites" },
    title: "Websites",
    description:
      "Complete, ready-made websites — each with its full code, its design system as Markdown, and the project as a ZIP.",
    /* An empty index is a thin page; keep it out of search until there is something on it. */
    robots: sites.length ? undefined : { index: false, follow: true },
  };
}

/**
 * The websites gallery — land-book's shape: category pills over a grid of
 * full-page screenshots cropped to their top. Filtering runs in the browser
 * (components/v2/WebsiteBrowser.tsx); the search params only seed it, so a
 * shared link opens on the view it was copied from.
 */
export default async function WebsitesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const sites = await getWebsites();
  const category = one(params.category);
  const price = one(params.price);

  return (
    <main className={p.page}>
      <PageHero
        compact
        id="websites-title"
        kicker="Websites"
        title="Whole websites, ready to ship."
        lede={
          sites.length
            ? `${sites.length} ${sites.length === 1 ? "website" : "websites"}. Each comes with its complete code, its design system as Markdown, and the project as a ZIP.`
            : "Complete websites, each with its full code, its design system as Markdown, and the project as a ZIP."
        }
      />

      <section className={l.container} aria-labelledby="websites-title">
        {sites.length ? (
          <WebsiteBrowser
            sites={sites}
            initial={{
              category: category && (WEBSITE_CATEGORIES as readonly string[]).includes(category) ? category : undefined,
              price: price === "free" || price === "premium" ? price : undefined,
            }}
          />
        ) : (
          <div className={s.empty}>
            <h2>No websites published yet.</h2>
            <p>The first complete websites are being prepared. The library already has kits you can rebuild in your stack.</p>
            <ButtonLink href="/library" icon="arrow">
              Browse the library
            </ButtonLink>
          </div>
        )}
      </section>
    </main>
  );
}
