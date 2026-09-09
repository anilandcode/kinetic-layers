import Link from "next/link";
import GlassButton from "@/components/kl/GlassButton";
import type { Metadata } from "next";
import PageShell from "@/components/kl/PageShell";
import CollectionFilter from "@/components/legacy/CollectionFilter";
import { getCollections, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import PreviewMedia from "@/components/legacy/PreviewMedia";
import { EARLY_ACCESS } from "@/lib/kl/access";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: "Collections",
  description: "A collection is one brief solved end to end — the prompts, the template, the scene and the source files that shipped with it.",
};

export default async function Collections({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [all, settings, viewer] = await Promise.all([getCollections(), getSettings(), getViewer()]);
  const list = tag ? all.filter((c) => c.tags?.includes(tag)) : all;

  return (
    <PageShell>
        <section className="kl-pad" style={{ paddingBlock: "80px 44px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 660 }}>
            <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
              {settings.collectionCount} collections
            </span>
            <h1
              style={{
                fontSize: "clamp(34px, 4.4vw, 56px)",
                lineHeight: 1.06,
                fontWeight: 500,
                letterSpacing: "-0.035em",
                textWrap: "pretty",
              }}
            >
              Assets that were built to sit together.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)", maxWidth: 520 }}>
              A collection is one brief solved end to end — the prompts, the template, the scene and
              the source files that shipped with it.
            </p>
          </div>
        </section>

        {/* Options come from the collections on the page, so a chip cannot
            offer a filter that returns nothing. */}
        <CollectionFilter
          active={tag}
          options={[...new Set(all.flatMap((c) => c.tags ?? []))].sort()}
          shown={list.length}
          total={all.length}
        />

        {/* The same masonry the library uses. This was a bespoke inline grid
            with its own column width and its own card proportions, which is why
            the page read as a different site — the cards are the same object in
            the same system and should be built on the same bones. */}
        <section id="sets" className="kl-pad" style={{ paddingBlock: "36px 90px" }}>
          <div className="kl-masonry" data-masonry>
          {list.map((c) => (
            <div key={c.slug} style={{ breakInside: "avoid", marginBottom: 26 }}>
            <Link data-card data-reveal href={`/collections/${c.slug}`} className="kl-card kl-card-link" aria-label={`${c.name} — ${c.items} items`}>
              {/* background and position: relative match AssetCard — the
                  gradient paints under a poster that has not loaded, and the
                  wrapper is the positioning context an overlay needs. */}
              <div
                style={{
                  height: c.h,
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "var(--t3)",
                  position: "relative",
                }}
              >
                <div data-preview-inner style={{ width: "100%", height: "100%" }}>
                  <PreviewMedia gradient="var(--t3)" poster={c.poster} clip={c.clip} alt="" style={{ width: "100%", height: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
                <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)" }}>{c.name}</span>
                <span className={c.free > 0 ? "kl-badge kl-badge--amber" : "kl-tag"} style={{ padding: "5px 13px" }}>
                  {c.free > 0 ? `${c.free} free` : "Premium"}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "9px 4px 0", maxWidth: 420 }}>{c.blurb}</p>
              <div data-meta style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 4px 2px" }}>
                {c.tags.map((t) => (
                  <span className="kl-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </Link>
            </div>
          ))}

          <div data-reveal className="kl-promo kl-promo--hire" style={{ breakInside: "avoid", marginBottom: 26, minHeight: 280 }}>
            <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
              Hire the studio
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.24, textWrap: "pretty" }}>
              Want a collection built only for you?
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
              Commissioned work never enters the vault.
            </p>
            <Link href={viewer ? "/account" : "/join"} style={{ fontSize: 16, color: "var(--amber)", marginTop: 4 }}>
              Start a project →
            </Link>
          </div>
          </div>
        </section>

        <section data-reveal style={{ borderTop: "1px solid var(--line)" }}>
          <div className="kl-pad" style={{ paddingBlock: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(30px, 3.5vw, 42px)", lineHeight: 1.12, fontWeight: 500, letterSpacing: "-0.03em", maxWidth: 620, textWrap: "pretty" }}>
              Every collection is included in Premium.
            </h2>
            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
              <GlassButton
                href={viewer?.premium ? "/account" : EARLY_ACCESS ? "/join" : "/pricing"}
                premium
              >
                {viewer?.premium ? "Your vault" : EARLY_ACCESS ? "Get free access" : "Go Premium"}
              </GlassButton>
              <GlassButton href="/library" ghost>
                Browse everything
              </GlassButton>
            </div>
          </div>
        </section>
      </PageShell>
  );
}
