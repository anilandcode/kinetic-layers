import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, Footer, Nav } from "@/components/kiln/Chrome";
import DownloadFilter from "@/components/kiln/DownloadFilter";
import { getViewer } from "@/lib/kiln/viewer";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/sanity/queries";

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
  const [{ data: downloads }, { data: savedCollections }, { data: savedAssets }, settings] =
    await Promise.all([
      supabase.from("downloads").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("saved_collections").select("collection_slug, created_at").order("created_at", { ascending: false }),
      supabase.from("saved_assets").select("asset_slug, created_at").order("created_at", { ascending: false }),
      getSettings(),
    ]);

  const rows = downloads ?? [];
  const thisMonth = rows.filter((d) => new Date(d.created_at).getMonth() === new Date().getMonth()).length;
  const unique = new Set(rows.map((d) => d.asset_slug)).size;
  const savedTotal = (savedCollections?.length ?? 0) + (savedAssets?.length ?? 0);

  const filtered = kind ? rows.filter((d) => (d.asset_name ?? "").length > 0) : rows;

  return (
    <>
      <a className="skip-link" href="#downloads">Skip to downloads</a>
      <Nav viewer={viewer} />

      <main>
        <section className="shell" style={{ paddingBlock: "64px 34px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              {viewer.unlimited
                ? `Unlimited${viewer.periodEnd ? ` · renews ${new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}`
                : "Free plan"}
            </span>
            <h1 style={{ fontSize: "clamp(30px, 3.8vw, 46px)", lineHeight: 1.08, fontWeight: 500, letterSpacing: "-0.035em" }}>
              {rows.length === 0
                ? "Nothing out of the kiln yet."
                : "Everything you’ve pulled out of the kiln."}
            </h1>
          </div>
        </section>

        <section
          className="shell"
          style={{ paddingBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}
        >
          <Stat label="Downloaded" value={String(unique)} note={`of ${settings.totalAssets} assets`} big />
          <Stat label="This month" value={String(thisMonth)} note={thisMonth === 1 ? "1 file" : `${thisMonth} files`} big />
          <Stat label="Saved" value={String(savedTotal)} note="assets and collections" big />
          <Stat label="Plan" value={viewer.unlimited ? "Unlimited" : "Free"} note={viewer.unlimited ? "full vault" : "12 rotating assets"} />
        </section>

        <div
          className="shell"
          style={{ paddingBlock: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))", gap: 24, alignItems: "start" }}
        >
          {/* --- Downloads --- */}
          <section data-reveal id="downloads" style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", background: "var(--surface-2)", borderBottom: "1px solid #1A1917", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 17, fontWeight: 500 }}>Downloads</h2>
              <div style={{ flex: 1 }} />
              <DownloadFilter active={kind ?? "All"} />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "40px 22px", display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
                <p style={{ fontSize: 15, color: "var(--muted)" }}>
                  Nothing downloaded yet. The twelve free assets are a good place to start.
                </p>
                <Link data-nav href="/?free=1" className="btn btn--ghost">Browse the free twelve</Link>
              </div>
            ) : (
              <ul>
                {filtered.map((d) => (
                  <li key={d.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderBottom: "1px solid #171614", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                      <Link data-nav href={`/item/${d.asset_slug}`} style={{ fontSize: 15, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.asset_name ?? d.asset_slug}
                      </Link>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                        {d.file_name}{d.bytes ? ` · ${(d.bytes / 1_048_576).toFixed(1)} MB` : ""}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                      {new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}
                    </span>
                    <Link data-nav href={`/item/${d.asset_slug}`} className="btn btn--ghost" style={{ fontSize: 13, padding: "7px 15px", color: "var(--ink-3)" }}>
                      Download again
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* --- Rail --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section
              data-reveal
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--sage-line-2)",
                background: "radial-gradient(120% 90% at 85% 0%,rgba(185,206,149,0.15),rgba(20,20,17,0) 62%),var(--surface)",
                padding: 26,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sage)" }}>Subscription</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.03em" }}>
                  {viewer.unlimited ? "Unlimited" : "Free"}
                </span>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>
                  {viewer.unlimited ? `$${settings.monthlyPrice}/mo` : "$0"}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                {viewer.unlimited
                  ? `Renews ${viewer.periodEnd ? new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "automatically"}. Cancel any time and keep every file you downloaded.`
                  : `Twelve rotating assets, refreshed monthly. Unlimited opens all ${settings.totalAssets} and every source file.`}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                {!viewer.unlimited && (
                  <Link data-nav href="/pricing" className="btn btn--primary" style={{ fontSize: 13, padding: "11px 20px" }}>
                    Get unlimited
                  </Link>
                )}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="btn btn--ghost" style={{ fontSize: 13, padding: "11px 20px", color: "var(--ink-3)" }}>
                    Sign out
                  </button>
                </form>
              </div>
            </section>

            <section data-reveal style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", background: "var(--surface-2)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
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
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>Collection</span>
                      </div>
                      <Link data-nav href={`/collections/${s.collection_slug}`} style={{ fontSize: 13, color: "var(--muted)" }}>Open</Link>
                    </div>
                  ))}
                  {(savedAssets ?? []).map((s) => (
                    <div key={s.asset_slug} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 14, color: "var(--ink)" }}>{s.asset_slug}</span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>Asset</span>
                      </div>
                      <Link data-nav href={`/item/${s.asset_slug}`} style={{ fontSize: 13, color: "var(--muted)" }}>Open</Link>
                    </div>
                  ))}
                </>
              )}
            </section>

            <section data-reveal style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", background: "var(--surface-2)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>Invoices</h2>
              {/* Honest: there is no billing yet, so there is nothing to list. */}
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                No invoices. Checkout is not connected yet — when it is, receipts appear here
                automatically.
              </p>
            </section>

            <section data-reveal style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", background: "var(--surface-2)", padding: 24, display: "flex", alignItems: "center", gap: 13 }}>
              <Avatar email={viewer.email} size={40} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }}>{viewer.email}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>Signed in</span>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Stat({ label, value, note, big }: { label: string; value: string; note: string; big?: boolean }) {
  return (
    <div data-reveal style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", background: "var(--surface-2)", padding: 22, display: "flex", flexDirection: "column", gap: 9 }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>{label}</span>
      <span style={{ fontWeight: 500, letterSpacing: "-0.03em", fontSize: big ? 34 : 26 }}>{value}</span>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{note}</span>
    </div>
  );
}
