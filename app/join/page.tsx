import type { Metadata } from "next";
import Shell from "@/components/kl/Shell";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mark } from "@/components/legacy/Chrome";
import JoinForm from "@/components/legacy/JoinForm";
import { getViewer } from "@/lib/kl/viewer";
import { getSettings } from "@/lib/sanity/queries";
import { EARLY_ACCESS } from "@/lib/kl/access";

export const metadata: Metadata = {
  title: "Join",
  description: "Start with the free assets. No card needed.",
  robots: { index: false, follow: false },
};

const perks = (s: { totalAssets: number; collectionCount: number }) => [
  `All ${s.totalAssets} assets and every source file`,
  "New assets every Thursday",
  `All ${s.collectionCount} collections`,
  "Commercial use in unlimited client projects",
];

export default async function Join({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const { next, error, mode } = await searchParams;
  const viewer = await getViewer();

  /* Already signed in: sending someone to a sign-in form they do not need is
     a dead end, so bounce them where they were going. */
  if (viewer) {
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
    redirect(dest);
  }

  const settings = await getSettings();

  return (
    <Shell>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a className="skip-link" href="#join">Skip to the form</a>
      <header style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="shell" style={{ height: 66, display: "flex", alignItems: "center", gap: 20 }}>
          <Link data-nav href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}>
            <Mark />
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kinetic Layers</span>
          </Link>
          <div style={{ flex: 1 }} />
          {!EARLY_ACCESS && (
            <Link data-nav href="/pricing" style={{ fontSize: 14, color: "var(--muted)" }}>Pricing</Link>
          )}
          <Link data-nav href="/library" style={{ fontSize: 14, color: "var(--muted)" }}>Browse free</Link>
        </div>
      </header>

      <main id="join" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(440px,100%),1fr))", minHeight: 0 }}>
        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "70px var(--gutter)" }}>
          <JoinForm next={next} initialError={error} initialMode={mode === "signin" ? "signin" : "signup"} />
        </section>

        <section
          style={{
            borderLeft: "1px solid var(--hairline)",
            background: "radial-gradient(120% 80% at 80% 10%,rgba(185,206,149,0.12),rgba(15,15,13,0) 60%),var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px var(--gutter)",
          }}
        >
          <div data-reveal style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}>
            <div data-card style={{ borderRadius: "var(--r-card)", padding: 5 }}>
              <div style={{ height: 240, borderRadius: "var(--r-inner)", overflow: "hidden", position: "relative" }}>
                <div data-preview-inner style={{ width: "100%", height: "100%", background: "linear-gradient(150deg,#1D2410,#0F0F0D 62%)" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(11,11,10,0.55)",
                    backdropFilter: "blur(3px)",
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      color: "var(--sage-ink)",
                      border: "1px solid rgba(185,206,149,0.45)",
                      background: "var(--sage-fill)",
                      borderRadius: "var(--r-pill)",
                      padding: "9px 18px",
                    }}
                  >
                    Unlimited only
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
                <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>Volumetric Drift</span>
                <span className="chip" style={{ padding: "5px 13px" }}>Unlimited</span>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "11px 4px 2px" }}>
                <span className="chip">3d scene</span>
                <span className="chip">three.js</span>
              </div>
            </div>

            <div style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline-3)", background: "var(--surface)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sage)" }}>What Premium opens</span>
              <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {perks(settings).map((p) => (
                  <li key={p} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span aria-hidden="true" style={{ fontSize: 12, color: "var(--sage)", paddingTop: 3 }}>✦</span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>{p}</span>
                  </li>
                ))}
              </ul>
              <div style={{ height: 1, background: "#232219", marginTop: 4 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>
                  {EARLY_ACCESS ? "Free while Kinetic Layers is in early access" : `$${settings.monthlyPrice} a month, cancel anytime`}
                </span>
                <Link data-nav href="/pricing" style={{ fontSize: 14, color: "var(--sage-ink)" }}>
                  {EARLY_ACCESS ? "What it will cost later →" : "See pricing →"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      </div>
    </Shell>
  );
}
