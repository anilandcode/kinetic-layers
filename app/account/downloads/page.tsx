import type { Metadata } from "next";
import Link from "next/link";
import GlassButton from "@/components/kl/GlassButton";
import DownloadFilter from "@/components/legacy/DownloadFilter";
import DownloadAgain from "@/components/legacy/DownloadAgain";
import { createClient } from "@/lib/supabase/server";
import { getAssets, getSettings } from "@/lib/sanity/queries";

export const metadata: Metadata = { title: "Downloads", robots: { index: false, follow: false } };

/* Always fresh: a download made a second ago has to be in the list. */
export const dynamic = "force-dynamic";

/**
 * Everything taken out of the library, newest first.
 *
 * Lifted whole from the old single-page account. The one thing worth repeating
 * from that move: a download row records the slug, not the type — type lives in
 * Sanity — so the filter chips resolve it at render rather than denormalising a
 * column. Rows written before today therefore filter correctly, not just new
 * ones.
 */
export default async function AccountDownloads({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: downloads }, settings, catalogue] = await Promise.all([
    supabase.from("downloads").select("*").order("created_at", { ascending: false }).limit(200),
    getSettings(),
    getAssets(),
  ]);

  const rows = downloads ?? [];
  const typeOf = new Map(catalogue.map((a) => [a.slug, a.type]));

  /* Derived from what this account actually has, so no chip is ever empty and
     no type is ever missing — the hardcoded three it replaced matched none of
     the eight the catalogue uses. */
  const kinds = [...new Set(rows.map((d) => typeOf.get(d.asset_slug)).filter(Boolean))].sort() as string[];
  const filtered = kind ? rows.filter((d) => typeOf.get(d.asset_slug) === kind) : rows;

  return (
    <section className="kl-pad" style={{ paddingBlock: 20 }}>
      <div data-reveal style={{ borderRadius: 18, border: "1px solid var(--line)", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 22px",
            background: "var(--inset)",
            borderBottom: "1px solid var(--line2)",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 500 }}>Downloads</h2>
          <div style={{ flex: 1 }} />
          <DownloadFilter active={kind ?? ""} kinds={kinds} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 22px", display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
            <p style={{ fontSize: 15, color: "var(--muted)" }}>
              {rows.length === 0 ? (
                <>
                  Nothing downloaded yet.{" "}
                  {settings.freeThisMonth > 0
                    ? `The ${settings.freeThisMonth} free assets are a good place to start.`
                    : "Free assets appear here as they are published."}
                </>
              ) : (
                <>Nothing of that type yet.</>
              )}
            </p>
            <GlassButton href="/library" ghost>
              Browse the library
            </GlassButton>
          </div>
        ) : (
          <ul>
            {filtered.map((d) => (
              <li
                key={d.id}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderBottom: "1px solid var(--line2)", flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                  <Link
                    href={`/item/${d.asset_slug}`}
                    style={{ fontSize: 15, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {d.asset_name ?? d.asset_slug}
                  </Link>
                  <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
                    {d.file_name}
                    {d.bytes ? ` · ${(d.bytes / 1_048_576).toFixed(1)} MB` : ""}
                  </span>
                </div>
                <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
                  {new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}
                </span>
                <DownloadAgain slug={d.asset_slug} file={d.file_name} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
