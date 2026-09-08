import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/legacy/Chrome";
import PageShell from "@/components/kl/PageShell";
import GlassButton from "@/components/kl/GlassButton";
import DownloadFilter from "@/components/legacy/DownloadFilter";
import DownloadAgain from "@/components/legacy/DownloadAgain";
import ApiKeys from "@/components/legacy/ApiKeys";
import { getViewer } from "@/lib/kl/viewer";
import { createClient } from "@/lib/supabase/server";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { LIMITS, WINDOW_MS, tierOf } from "@/lib/kl/limits";
import { EARLY_ACCESS } from "@/lib/kl/access";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

/* Always fresh: a download made a second ago has to be in the list. */
export const dynamic = "force-dynamic";

export default async function Account({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/join?next=/account");

  const { kind } = await searchParams;
  const supabase = await createClient();
  /* getViewer already returned a user, so a client must exist here. */
  if (!supabase) redirect("/join");

  /* Every one of these reads through RLS, so they can only ever return this
     user's rows — the filter is the policy, not the query. */
  const [{ data: downloads }, { data: savedCollections }, { data: savedAssets }, { data: apiKeys }, { data: recentUsage }, settings, catalogue] =
    await Promise.all([
      supabase.from("downloads").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("saved_collections").select("collection_slug, created_at").order("created_at", { ascending: false }),
      supabase.from("saved_assets").select("asset_slug, created_at").order("created_at", { ascending: false }),
      supabase
        .from("api_keys")
        .select("id, name, prefix, created_at, last_used")
        .is("revoked_at", null)
        .order("created_at", { ascending: false }),
      /* Reads through RLS, which restricts usage rows to their owner — the
         same policy the meter itself relies on. */
      supabase
        .from("usage")
        .select("kind")
        .gte("created_at", new Date(Date.now() - WINDOW_MS).toISOString()),
      getSettings(),
      getAssets(),
    ]);

  const rows = downloads ?? [];
  const thisMonth = rows.filter((d) => new Date(d.created_at).getMonth() === new Date().getMonth()).length;
  const unique = new Set(rows.map((d) => d.asset_slug)).size;
  const savedTotal = (savedCollections?.length ?? 0) + (savedAssets?.length ?? 0);

  /* A download row records the slug, not the type — type lives in Sanity. This
     resolves it at render rather than denormalising a column, which also means
     rows written before today filter correctly instead of only new ones. */
  const typeOf = new Map(catalogue.map((a) => [a.slug, a.type]));

  /* Today's meter, against this viewer's own tier. Rolling 24 hours, so this
     is "in the last day" rather than "since midnight". */
  const allowance = LIMITS[tierOf(viewer)];
  const usedPrompts = (recentUsage ?? []).filter((u) => u.kind === "prompt").length;
  const usedDownloads = (recentUsage ?? []).filter((u) => u.kind === "download").length;

  /* The chips used to be a hardcoded "Templates / Scenes / Prompts", which
     matched none of the eight types the catalogue actually uses. Deriving them
     from what this user has downloaded means no chip is ever empty and no type
     is ever missing. */
  const kinds = [...new Set(rows.map((d) => typeOf.get(d.asset_slug)).filter(Boolean))].sort() as string[];
  const filtered = kind ? rows.filter((d) => typeOf.get(d.asset_slug) === kind) : rows;

  return (
    <PageShell>
        <section className="kl-pad" style={{ paddingBlock: "64px 34px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
              {viewer.premium
                ? `Premium${viewer.periodEnd ? ` · renews ${new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}`
                : "Free plan"}
            </span>
            <h1 className="kl-prose-h1">
              {rows.length === 0
                ? "Nothing downloaded yet."
                : "Everything you’ve taken out of the library."}
            </h1>
          </div>
        </section>

        <section
          className="kl-pad"
          style={{ paddingBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 20 }}
        >
          <Stat label="Downloaded" value={String(unique)} note={`of ${settings.totalAssets} assets`} big />
          <Stat label="This month" value={String(thisMonth)} note={thisMonth === 1 ? "1 file" : `${thisMonth} files`} big />
          <Stat label="Saved" value={String(savedTotal)} note="assets and collections" big />
          <Stat label="Plan" value={viewer.premium ? "Premium" : "Free"} note={viewer.premium ? "full vault" : `${settings.freeThisMonth} free assets`} />
          {/* Rolling 24 hours, not since midnight — the meter is a moving
              window, so a tile that reset at a fixed hour would disagree with
              the thing actually refusing requests. */}
          <Stat
            label="Today"
            value={`${usedPrompts}/${allowance.prompt}`}
            note={`prompts · ${usedDownloads}/${allowance.download} downloads`}
          />
        </section>

        <div
          className="kl-pad"
          style={{ paddingBlock: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))", gap: 24, alignItems: "start" }}
        >
          {/* --- Downloads --- */}
          <section data-reveal id="downloads" style={{ borderRadius: "18px", border: "1px solid var(--line)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", background: "var(--inset)", borderBottom: "1px solid var(--line2)", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 17, fontWeight: 500 }}>Downloads</h2>
              <div style={{ flex: 1 }} />
              <DownloadFilter active={kind ?? ""} kinds={kinds} />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "40px 22px", display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
                <p style={{ fontSize: 15, color: "var(--muted)" }}>
                  Nothing downloaded yet.{" "}
                  {settings.freeThisMonth > 0
                    ? `The ${settings.freeThisMonth} free assets are a good place to start.`
                    : "Free assets appear here as they are published."}
                </p>
                <GlassButton href="/library" ghost>
                  Browse the library
                </GlassButton>
              </div>
            ) : (
              <ul>
                {filtered.map((d) => (
                  <li key={d.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderBottom: "1px solid var(--line2)", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                      <Link href={`/item/${d.asset_slug}`} style={{ fontSize: 15, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.asset_name ?? d.asset_slug}
                      </Link>
                      <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
                        {d.file_name}{d.bytes ? ` · ${(d.bytes / 1_048_576).toFixed(1)} MB` : ""}
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
          </section>

          <ApiKeys initial={apiKeys ?? []} />

          {/* --- Rail --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section
              data-reveal
              style={{
                borderRadius: "18px",
                border: "1px solid var(--amber-line)",
                background:
                  "radial-gradient(120% 90% at 85% 0%, var(--amber-bg), transparent 62%), var(--card)",
                padding: 26,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--amber)" }}>Subscription</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.03em" }}>
                  {EARLY_ACCESS ? "Early access" : viewer.premium ? "Premium" : "Free"}
                </span>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>
                  {EARLY_ACCESS || !viewer.premium ? "$0" : `$${settings.monthlyPrice}/mo`}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                {EARLY_ACCESS
                  ? `All ${settings.totalAssets} assets and every source file, free while Kinetic Layers is in early access. Nothing to cancel, and anything you download stays yours.`
                  : viewer.premium
                    ? `Renews ${viewer.periodEnd ? new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "automatically"}. Cancel any time and keep every file you downloaded.`
                    : `${settings.freeThisMonth} free assets. Premium opens all ${settings.totalAssets} and every source file.`}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                {!EARLY_ACCESS && !viewer.premium && (
                  <GlassButton href="/pricing" premium size="sm">
                    Go Premium
                  </GlassButton>
                )}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="kl-btn kl-btn--ghost kl-btn--sm">
                    <span className="kl-btn-label" data-btn-label>
                      Sign out
                    </span>
                  </button>
                </form>
              </div>
            </section>

            <section data-reveal style={{ borderRadius: "18px", border: "1px solid var(--line)", background: "var(--inset)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>Saved</h2>
              {savedTotal === 0 ? (
                <p style={{ fontSize: 14, color: "var(--muted)" }}>
                  Nothing saved. The bookmark on an item page keeps it here.
                </p>
              ) : (
                <>
                  {(savedCollections ?? []).map((s) => (
                    <div key={s.collection_slug} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 14, color: "var(--ink)" }}>{s.collection_slug}</span>
                        <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>Collection</span>
                      </div>
                      <Link href={`/collections/${s.collection_slug}`} style={{ fontSize: 13, color: "var(--muted)" }}>Open</Link>
                    </div>
                  ))}
                  {(savedAssets ?? []).map((s) => (
                    <div key={s.asset_slug} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 14, color: "var(--ink)" }}>{s.asset_slug}</span>
                        <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>Asset</span>
                      </div>
                      <Link href={`/item/${s.asset_slug}`} style={{ fontSize: 13, color: "var(--muted)" }}>Open</Link>
                    </div>
                  ))}
                </>
              )}
            </section>

            <section data-reveal style={{ borderRadius: "18px", border: "1px solid var(--line)", background: "var(--inset)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>Invoices</h2>
              {/* Honest: there is no billing yet, so there is nothing to list. */}
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                No invoices yet. Receipts appear here automatically once a subscription is
                charged.
              </p>
            </section>

            <section data-reveal style={{ borderRadius: "18px", border: "1px solid var(--line)", background: "var(--inset)", padding: 24, display: "flex", alignItems: "center", gap: 13 }}>
              <Avatar email={viewer.email} size={40} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>{viewer.email}</span>
                <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>Signed in</span>
              </div>
            </section>
          </div>
        </div>
      </PageShell>
  );
}

function Stat({ label, value, note, big }: { label: string; value: string; note: string; big?: boolean }) {
  return (
    <div data-reveal style={{ borderRadius: "18px", border: "1px solid var(--line)", background: "var(--inset)", padding: 22, display: "flex", flexDirection: "column", gap: 9 }}>
      <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 500, letterSpacing: "-0.03em", fontSize: big ? 34 : 26 }}>{value}</span>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{note}</span>
    </div>
  );
}
