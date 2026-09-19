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
    <section className="kl-pad kl-account-section">
      <div data-reveal className="kl-account-downloads">
        <div className="kl-account-downloads-head">
          <h2>Downloads</h2>
          <div className="kl-spacer" />
          <DownloadFilter active={kind ?? ""} kinds={kinds} />
        </div>

        {filtered.length === 0 ? (
          <div className="kl-account-empty">
            <p>
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
          <ul className="kl-account-download-list">
            {filtered.map((d) => (
              <li key={d.id} className="kl-account-download-row">
                <div className="kl-account-download-item">
                  <Link
                    href={`/item/${d.asset_slug}`}
                    className="kl-account-download-name"
                  >
                    {d.asset_name ?? d.asset_slug}
                  </Link>
                  <span className="kl-mono kl-account-download-meta">
                    {d.file_name}
                    {d.bytes ? ` · ${(d.bytes / 1_048_576).toFixed(1)} MB` : ""}
                  </span>
                </div>
                <span className="kl-mono kl-account-download-date">
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
