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
      <section
        className="kl-pad"
        style={{ paddingBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 20 }}
      >
        <AccountStat label="Downloaded" value={String(unique)} note={`of ${settings.totalAssets} assets`} big />
        <AccountStat label="This month" value={String(thisMonth)} note={thisMonth === 1 ? "1 file" : `${thisMonth} files`} big />
        <AccountStat label="Saved" value={String(savedTotal)} note="assets and collections" big />
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

      <section
        className="kl-pad"
        style={{ paddingBlock: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(360px,100%),1fr))", gap: 24, alignItems: "start" }}
      >
        <div data-reveal style={{ borderRadius: 18, border: "1px solid var(--line)", background: "var(--inset)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500 }}>Saved</h2>
            <div style={{ flex: 1 }} />
            <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
              {savedTotal}
            </span>
          </div>

          {savedTotal === 0 ? (
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Nothing saved. The bookmark on an item page keeps it here.
            </p>
          ) : (
            <>
              {(savedCollections ?? []).slice(0, 5).map((s) => (
                <Row key={s.collection_slug} label={s.collection_slug} kind="Collection" href={`/collections/${s.collection_slug}`} />
              ))}
              {(savedAssets ?? []).slice(0, 5).map((s) => (
                <Row key={s.asset_slug} label={s.asset_slug} kind="Asset" href={`/item/${s.asset_slug}`} />
              ))}
            </>
          )}
        </div>

        <div data-reveal style={{ borderRadius: 18, border: "1px solid var(--line)", background: "var(--inset)", padding: 24, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>Downloads</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
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

function Row({ label, kind, href }: { label: string; kind: string; href: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
          {kind}
        </span>
      </div>
      <Link href={href} style={{ fontSize: 13, color: "var(--muted)" }}>
        Open
      </Link>
    </div>
  );
}
