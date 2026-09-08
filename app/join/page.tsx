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
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="kl-pad" style={{ height: 66, display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}>
            <Mark />
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kinetic Layers</span>
          </Link>
          <div style={{ flex: 1 }} />
          {!EARLY_ACCESS && (
            <Link href="/pricing" style={{ fontSize: 14, color: "var(--muted)" }}>Pricing</Link>
          )}
          <Link href="/library" style={{ fontSize: 14, color: "var(--muted)" }}>Browse free</Link>
        </div>
      </header>

      <main id="join" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(440px,100%),1fr))", minHeight: 0 }}>
        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "70px 32px" }}>
          <JoinForm next={next} initialError={error} initialMode={mode === "signin" ? "signin" : "signup"} />
        </section>

        <section
          style={{
            borderLeft: "1px solid var(--line)",
            background: "radial-gradient(120% 80% at 80% 10%,var(--amber-bg),transparent 60%),var(--inset)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px 32px",
          }}
        >
          <div data-reveal style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}>
            <div data-card style={{ borderRadius: "18px", padding: 5 }}>
              <div style={{ height: 240, borderRadius: "12px", overflow: "hidden", position: "relative" }}>
                <div data-preview-inner style={{ width: "100%", height: "100%", background: "var(--t4)" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "color-mix(in srgb, var(--ground) 55%, transparent)",
                    backdropFilter: "blur(3px)",
                  }}
                >
                  <span
                    className="kl-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      color: "var(--amber)",
                      border: "1px solid var(--amber-line)",
                      background: "var(--amber-bg)",
                      borderRadius: "99px",
                      padding: "9px 18px",
                    }}
                  >
                    Unlimited only
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
                <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>Volumetric Drift</span>
                <span className="kl-tag" style={{ padding: "5px 13px" }}>Unlimited</span>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "11px 4px 2px" }}>
                <span className="kl-tag">3d scene</span>
                <span className="kl-tag">three.js</span>
              </div>
            </div>

            <div style={{ borderRadius: "18px", border: "1px solid var(--line2)", background: "var(--card)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--amber)" }}>What Premium opens</span>
              <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {perks(settings).map((p) => (
                  <li key={p} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span aria-hidden="true" style={{ fontSize: 12, color: "var(--amber)", paddingTop: 3 }}>✦</span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--body)" }}>{p}</span>
                  </li>
                ))}
              </ul>
              <div style={{ height: 1, background: "#232219", marginTop: 4 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>
                  {EARLY_ACCESS ? "Free while Kinetic Layers is in early access" : `$${settings.monthlyPrice} a month, cancel anytime`}
                </span>
                <Link href="/pricing" style={{ fontSize: 14, color: "var(--amber)" }}>
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
