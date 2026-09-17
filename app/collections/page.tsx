
import { hasRealPreview } from "@/lib/kl/preview-ready";
import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/kl/PageShell";
import CollectionFilter from "@/components/legacy/CollectionFilter";
import { getCollections, getSettings } from "@/lib/sanity/queries";
import PreviewMedia from "@/components/legacy/PreviewMedia";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: "Collections",
  description: "A collection is one brief solved end to end — the prompts, the template, the scene and the source files that shipped with it.",
};

export default async function Collections({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const [all, settings] = await Promise.all([getCollections(), getSettings()]);
  const filtered = tag ? all.filter((collection) => collection.tags?.includes(tag)) : all;
  // A wall is an image-first browse surface. A collection without a real cover
  // remains reachable through its direct URL, but does not receive a made-up card.
  const list = filtered.filter(hasRealPreview);

  return (
    <PageShell>
      <section className="collections-hero">
        <span>Collections</span>
        <h1>Directions built to sit together.</h1>
        <p>Each collection gathers a visual direction, its components, and the pieces of a brief that belong in the same system.</p>
        <div><strong>{settings.collectionCount} collections</strong>{tag ? <Link href="/collections">Clear filter →</Link> : null}</div>
      </section>

      <div className="collections-filter"><CollectionFilter active={tag} options={[...new Set(all.flatMap((collection) => collection.tags ?? []))].sort()} shown={list.length} total={all.length} /></div>

      <section id="sets" className="collections-grid" aria-label="Collections">
        {list.map((collection) => (
          <article key={collection.slug} className="collection-card">
            <Link href={`/collections/${collection.slug}`} className="collection-card-media" aria-label={`${collection.name} — ${collection.items} items`} style={{ aspectRatio: String(collection.aspect && collection.aspect > 0 ? collection.aspect : 1.35) }}>
              <PreviewMedia gradient="var(--canvas-bg)" poster={collection.poster} clip={collection.clip} alt={collection.name} play="auto" style={{ position: "absolute", inset: 0 }} />
            </Link>
            <div className="collection-card-copy"><div><span>{collection.items} items · {collection.free} free now</span><h2>{collection.name}</h2></div><p>{collection.blurb || "A curated direction from the library."}</p><div>{collection.tags.map((item) => <small key={item}>{item}</small>)}</div></div>
          </article>
        ))}
        {!list.length ? <p className="bench-empty">Nothing in this collection shelf yet.</p> : null}
      </section>
    </PageShell>
  );
}
