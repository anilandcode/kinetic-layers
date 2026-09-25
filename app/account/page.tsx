import type { Metadata } from "next";
import Link from "next/link";
import GlassButton from "@/components/kl/GlassButton";
import AccountStat from "@/components/kl/AccountStat";
import { getViewer } from "@/lib/kl/viewer";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/sanity/queries";
import { LIMITS, WINDOW_MS, tierOf } from "@/lib/kl/limits";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

/* Always fresh: a download made a second ago has to be in the count. */
export const dynamic = "force-dynamic";

/**
 * The dashboard: the numbers, and what is worth a second glance.
 *
 * The long list of downloads moved to /account/downloads and the plan card to
 * /account/billing. What stays is the summary — the thing you open the account
 * for when you are not looking for anything in particular.
 */
export default async function AccountDashboard() {
  const viewer = await getViewer();
  /* The layout already redirected anyone without one; this is for the type. */
  if (!viewer) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: downloads }, { data: savedCollections }, { data: savedAssets }, { data: recentUsage }, settings] =
    await Promise.all([
      supabase.from("downloads").select("asset_slug, created_at").order("created_at", { ascending: false }),
      supabase.from("saved_collections").select("collection_slug").order("created_at", { ascending: false }),
      supabase.from("saved_assets").select("asset_slug").order("created_at", { ascending: false }),
      supabase.from("usage").select("kind").gte("created_at", new Date(Date.now() - WINDOW_MS).toISOString()),
      getSettings(),
    ]);

  const rows = downloads ?? [];
  const now = new Date();
  const thisMonth = rows.filter((d) => {
    const at = new Date(d.created_at);
    return at.getMonth() === now.getMonth() && at.getFullYear() === now.getFullYear();
  }).length;
  const unique = new Set(rows.map((d) => d.asset_slug)).size;
  const savedTotal = (savedCollections?.length ?? 0) + (savedAssets?.length ?? 0);

  /* Today's meter, against this viewer's own tier. Rolling 24 hours, so this is
     "in the last day" rather than "since midnight" — a tile that reset at a
     fixed hour would disagree with the thing actually refusing requests. */
  const allowance = LIMITS[tierOf(viewer)];
  const usedPrompts = (recentUsage ?? []).filter((u) => u.kind === "prompt").length;
  const usedDownloads = (recentUsage ?? []).filter((u) => u.kind === "download").length;

  return (
    <>
      <section className="kl-pad kl-account-stat-grid">
        <AccountStat label="Downloaded" value={String(unique)} note={`of ${settings.totalAssets} assets`} big />
        <AccountStat label="This month" value={String(thisMonth)} note={thisMonth === 1 ? "1 file" : `${thisMonth} files`} big />
        <AccountStat label="Saved" value={String(savedTotal)} note="saved items" big />
        <AccountStat
          label="Plan"
          value={viewer.premium ? "Premium" : "Free"}
          note={viewer.premium ? "full vault" : `${settings.freeThisMonth} free assets`}
        />
        <AccountStat
          label="Today"
          value={`${usedPrompts}/${allowance.prompt}`}
          note={`prompts · ${usedDownloads}/${allowance.download} downloads`}
        />
      </section>

      <section className="kl-pad kl-account-summary-grid">
        <div data-reveal className="kl-account-panel">
          <div className="kl-account-panel-head">
            <h2>Saved</h2>
            <span className="kl-mono kl-account-panel-count">
              {savedTotal}
            </span>
          </div>

          {savedTotal === 0 ? (
            <p className="kl-account-panel-copy">
              Nothing saved. The bookmark on an item page keeps it here.
            </p>
          ) : (
            <>
              {(savedCollections ?? []).slice(0, 5).map((s) => (
                <Row key={s.collection_slug} label={s.collection_slug} kind="Saved collection" />
              ))}
              {(savedAssets ?? []).slice(0, 5).map((s) => (
                <Row key={s.asset_slug} label={s.asset_slug} kind="Asset" href={`/item/${s.asset_slug}`} />
              ))}
            </>
          )}
        </div>

        <div data-reveal className="kl-account-panel kl-account-panel--actions">
          <h2>Downloads</h2>
          <p className="kl-account-panel-copy">
            {rows.length === 0
              ? settings.freeThisMonth > 0
                ? `Nothing yet. The ${settings.freeThisMonth} free assets are a good place to start.`
                : "Nothing yet. Free assets appear in the library as they are published."
              : `${rows.length} ${rows.length === 1 ? "file" : "files"} taken out, across ${unique} ${unique === 1 ? "asset" : "assets"}.`}
          </p>
          <GlassButton href={rows.length === 0 ? "/library" : "/account/downloads"} ghost>
            {rows.length === 0 ? "Browse the library" : "See all downloads"}
          </GlassButton>
        </div>
      </section>
    </>
  );
}

function Row({ label, kind, href }: { label: string; kind: string; href?: string }) {
  return (
    <div className="kl-account-saved-row">
      <div className="kl-account-saved-copy">
        <span className="kl-account-saved-name">
          {label}
        </span>
        <span className="kl-mono kl-account-saved-kind">
          {kind}
        </span>
      </div>
      {href ? <Link href={href} className="kl-account-saved-link">Open</Link> : <span className="kl-account-saved-status">Coming back soon</span>}
    </div>
  );
}
