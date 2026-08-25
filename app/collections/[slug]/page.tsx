import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Nav } from "@/components/kiln/Chrome";
import AssetCard from "@/components/kiln/AssetCard";
import { getCollection, getCollectionSlugs } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";
import { createClient } from "@/lib/supabase/server";
import SaveButton from "@/components/kiln/SaveButton";

/* The design links Collections straight to an item and never draws the
   collection itself. This is that missing page. */

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) return { title: "Not found" };
  return {
    title: c.name,
    description: c.blurb,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: { type: "website", title: c.name, description: c.blurb, url: `/collections/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, viewer] = await Promise.all([getCollection(slug), getViewer()]);
  if (!collection) notFound();

  /* Reads through the viewer's own session, so RLS decides what comes back
     rather than this query being trusted to filter. */
  let saved = false;
  if (viewer) {
    const supabase = await createClient();
    const { data } = (await supabase!
      .from("saved_collections")
      .select("collection_slug")
      .eq("collection_slug", slug)
      .maybeSingle()) ?? { data: null };
    saved = Boolean(data);
  }

  return (
    <>
      <a className="skip-link" href="#items">Skip to the assets</a>
      <Nav viewer={viewer} />

      <main>
        <nav className="shell mono" aria-label="Breadcrumb" style={{ paddingBlock: "26px 0", display: "flex", gap: 10, fontSize: 10, color: "var(--faint)" }}>
          <Link data-nav href="/collections" style={{ color: "var(--faint)" }}>Collections</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: "var(--muted)" }}>{collection.name}</span>
        </nav>

        <section className="shell" style={{ paddingBlock: "36px 44px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              {collection.shelf} · {collection.items} items{collection.free > 0 ? ` · ${collection.free} free` : ""}
            </span>
            <h1 style={{ fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.06, fontWeight: 500, letterSpacing: "-0.035em", textWrap: "pretty" }}>
              {collection.name}
            </h1>
            {collection.blurb && (
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)", maxWidth: 540 }}>{collection.blurb}</p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {collection.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
            </div>

            {/* The only place a collection can be saved. Without this the
                account page's saved-collections list could never fill. */}
            <div>
              <SaveButton
                kind="collection"
                slug={collection.slug}
                saved={saved}
                signedIn={Boolean(viewer)}
                labels={{ on: "Saved — remove", off: "Save this collection" }}
              />
            </div>
          </div>
        </section>

        <section id="items" className="shell" style={{ paddingBottom: 90 }}>
          {collection.assets.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 16, paddingBlock: 40 }}>
              Nothing filed under this collection yet.
            </p>
          ) : (
            <div className="kiln-grid">
              {collection.assets.map((a) => (
                <div data-reveal key={a.slug}>
                  <AssetCard asset={a} height={200} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
