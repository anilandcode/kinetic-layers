import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAssets } from "@/lib/sanity/queries";
import type { Asset } from "@/lib/kl/types";
import { stillFor, typeLabel } from "@/lib/v2/kit";
import DownloadFilter from "@/components/v2/account/DownloadFilter";
import DownloadAgain from "@/components/v2/account/DownloadAgain";
import { ButtonLink } from "@/components/v2/Button";
import p from "@/components/v2/Page.module.css";
import a from "@/components/v2/account/Account.module.css";

export const metadata: Metadata = { title: "Downloads", robots: { index: false, follow: false } };

/* Always fresh: a download made a second ago has to be in the list. */
export const dynamic = "force-dynamic";

/**
 * Everything taken out of the library, newest first. A download row records
 * the slug, not the type — type lives in Sanity — so the filter resolves it
 * at render, and rows written before any change still filter correctly.
 */
export default async function AccountDownloads({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: downloads }, catalogue] = await Promise.all([
    supabase.from("downloads").select("*").order("created_at", { ascending: false }).limit(200),
    getAssets(),
  ]);

  const rows = downloads ?? [];
  const bySlug = new Map<string, Asset>(catalogue.map((k) => [k.slug, k]));
  const typeOf = (slug: string) => bySlug.get(slug)?.type;
  const kinds = [...new Set(rows.map((d) => typeOf(d.asset_slug)).filter(Boolean))].sort() as string[];
  const filtered = kind ? rows.filter((d) => typeOf(d.asset_slug) === kind) : rows;

  return (
    <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="downloads-title">
      <div className={a.panelHead}>
        <h2 id="downloads-title" className={p.panelTitle}>
          Downloads <span className={a.panelCount}>{rows.length}</span>
        </h2>
        <DownloadFilter active={kind ?? ""} kinds={kinds} />
      </div>

      {filtered.length === 0 ? (
        <>
          <p className={a.muted}>
            {rows.length === 0 ? "Nothing downloaded yet. The free kits are a good place to start." : "Nothing of that type yet."}
          </p>
          <div className={a.actions}>
            <ButtonLink href="/library" variant="secondary" size="sm" icon="arrow">
              Browse the library
            </ButtonLink>
          </div>
        </>
      ) : (
        <ul className={a.rows}>
          {filtered.map((d) => {
            const kit = bySlug.get(d.asset_slug);
            const still = kit ? stillFor(kit, 200) : undefined;
            return (
              <li key={d.id} className={a.row}>
                <span className={a.rowThumb} aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {still ? <img src={still} alt="" loading="lazy" decoding="async" /> : null}
                </span>
                <span className={a.rowMain}>
                  <Link href={`/item/${d.asset_slug}`} className={a.rowTitle}>
                    {kit?.name ?? d.asset_name ?? d.asset_slug}
                  </Link>
                  <span className={a.rowMeta}>
                    {[kit ? typeLabel(kit.type) : null, d.file_name, d.bytes ? `${(d.bytes / 1_048_576).toFixed(1)} MB` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className={a.rowDate}>
                  {new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <DownloadAgain slug={d.asset_slug} file={d.file_name} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
