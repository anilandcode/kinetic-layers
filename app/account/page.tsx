import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/kl/viewer";
import { createClient } from "@/lib/supabase/server";
import { getAssets } from "@/lib/sanity/queries";
import { hasRealPreview } from "@/lib/kl/preview-ready";
import { LIMITS, WINDOW_MS, tierOf } from "@/lib/kl/limits";
import type { Asset } from "@/lib/kl/types";
import { HUES } from "@/lib/v2/gradient";
import { stillFor, typeLabel } from "@/lib/v2/kit";
import StatCard from "@/components/v2/account/StatCard";
import { ButtonLink } from "@/components/v2/Button";
import p from "@/components/v2/Page.module.css";
import a from "@/components/v2/account/Account.module.css";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

/* Always fresh: a download made a second ago has to be in the count. */
export const dynamic = "force-dynamic";

const pad = (n: number) => String(n).padStart(2, "0");
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * The dashboard: four figures as the deck's glowing cards, then what is worth
 * a second glance — recent downloads and saved kits. Every number is a count
 * of this account's own rows; today's meter is the rolling 24 hours the gate
 * actually enforces, not "since midnight".
 */
export default async function AccountDashboard() {
  const viewer = await getViewer();
  /* The layout already redirected anyone without one; this is for the type. */
  if (!viewer) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: downloads }, { data: savedRows }, { data: recentUsage }, catalogue] = await Promise.all([
    supabase.from("downloads").select("asset_slug, asset_name, file_name, created_at").order("created_at", { ascending: false }),
    supabase.from("saved_assets").select("asset_slug").order("created_at", { ascending: false }),
    supabase.from("usage").select("kind").gte("created_at", new Date(Date.now() - WINDOW_MS).toISOString()),
    getAssets(),
  ]);

  const bySlug = new Map<string, Asset>(catalogue.map((k) => [k.slug, k]));
  const published = catalogue.filter(hasRealPreview).length;
  const rows = downloads ?? [];
  const now = new Date();
  const thisMonth = rows.filter((d) => {
    const at = new Date(d.created_at);
    return at.getMonth() === now.getMonth() && at.getFullYear() === now.getFullYear();
  }).length;
  const unique = new Set(rows.map((d) => d.asset_slug)).size;
  const saved = savedRows ?? [];

  const allowance = LIMITS[tierOf(viewer)];
  const usedPrompts = (recentUsage ?? []).filter((u) => u.kind === "prompt").length;
  const usedDownloads = (recentUsage ?? []).filter((u) => u.kind === "download").length;

  return (
    <>
      <section className={a.stats} aria-label="Your figures">
        <StatCard
          label="Kits downloaded"
          value={pad(unique)}
          spoken={`${unique} kits downloaded`}
          note={`of ${published} published`}
          hue={HUES.ember}
          second={HUES.rose}
        />
        <StatCard
          label="This month"
          value={pad(thisMonth)}
          spoken={`${thisMonth} files this month`}
          note={thisMonth === 1 ? "1 file" : `${thisMonth} files`}
          hue={HUES.rose}
          second={HUES.violet}
        />
        <StatCard
          label="Saved"
          value={pad(saved.length)}
          spoken={`${saved.length} saved kits`}
          note={saved.length === 1 ? "1 kit kept for later" : "kits kept for later"}
          hue={HUES.violet}
          second={HUES.cobalt}
        />
        <StatCard
          label="Prompt reads today"
          value={`${usedPrompts}/${allowance.prompt}`}
          spoken={`${usedPrompts} of ${allowance.prompt} prompt reads used in the last 24 hours`}
          note={`and ${usedDownloads}/${allowance.download} downloads, rolling 24 hours`}
          hue={HUES.cobalt}
          second={196}
        />
      </section>

      <div className={a.split}>
        <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="recent-title">
          <div className={a.panelHead}>
            <h2 id="recent-title" className={p.panelTitle}>
              Recent downloads
            </h2>
            <span className={a.panelCount}>{rows.length}</span>
          </div>
          {rows.length === 0 ? (
            <>
              <p className={a.muted}>Nothing yet. The free kits are a good place to start.</p>
              <div className={a.actions}>
                <ButtonLink href="/library?price=free" variant="secondary" size="sm" icon="arrow">
                  Free kits
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <ul className={a.rows}>
                {rows.slice(0, 5).map((d, i) => (
                  <KitRow
                    key={`${d.asset_slug}-${d.created_at}-${i}`}
                    kit={bySlug.get(d.asset_slug)}
                    slug={d.asset_slug}
                    name={d.asset_name}
                    meta={d.file_name ?? undefined}
                    date={day(d.created_at)}
                  />
                ))}
              </ul>
              <div className={a.actions}>
                <ButtonLink href="/account/downloads" variant="secondary" size="sm" icon="arrow">
                  All downloads
                </ButtonLink>
              </div>
            </>
          )}
        </section>

        <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="saved-title">
          <div className={a.panelHead}>
            <h2 id="saved-title" className={p.panelTitle}>
              Saved kits
            </h2>
            <span className={a.panelCount}>{saved.length}</span>
          </div>
          {saved.length === 0 ? (
            <p className={a.muted}>Nothing saved. “Save for later” on a kit page keeps it here and under Saved in the library.</p>
          ) : (
            <>
              <ul className={a.rows}>
                {saved.slice(0, 6).map((r) => {
                  const kit = bySlug.get(r.asset_slug);
                  return (
                    <KitRow
                      key={r.asset_slug}
                      kit={kit}
                      slug={r.asset_slug}
                      meta={kit ? typeLabel(kit.type) : undefined}
                    />
                  );
                })}
              </ul>
              <div className={a.actions}>
                <ButtonLink href="/library?saved=1" variant="secondary" size="sm" icon="arrow">
                  Saved in the library
                </ButtonLink>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

function KitRow({
  kit,
  slug,
  name,
  meta,
  date,
}: {
  kit?: Asset;
  slug: string;
  name?: string | null;
  meta?: string;
  date?: string;
}) {
  const still = kit ? stillFor(kit, 200) : undefined;
  return (
    <li className={a.row}>
      <span className={a.rowThumb} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {still ? <img src={still} alt="" loading="lazy" decoding="async" /> : null}
      </span>
      <span className={a.rowMain}>
        <Link href={`/item/${slug}`} className={a.rowTitle}>
          {kit?.name ?? name ?? slug}
        </Link>
        {meta ? <span className={a.rowMeta}>{meta}</span> : null}
      </span>
      {date ? <span className={a.rowDate}>{date}</span> : null}
    </li>
  );
}
