import Link from "next/link";
import { Footer, Nav } from "@/components/legacy/Chrome";
import AssetCard from "@/components/legacy/AssetCard";
import { getAssets, getDrops, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import { canDownload } from "@/lib/kl/gate";
import { Spell } from "@/lib/kl/words";
import type { Drop } from "@/lib/kl/types";
import { EARLY_ACCESS } from "@/lib/kl/access";

/**
 * The landing page, in either treatment.
 *
 * The filter bar and the full masonry used to live here, which meant a first
 * visitor met a browse UI before being told what the place was. Both moved to
 * /library. What stays is the pitch and enough of the goods to prove it — the
 * newest eight, with a way through to the rest.
 */

/* Enough to fill the masonry and show range, few enough that the page still
   ends somewhere. */
const STRIP = 8;

export default async function HomeView({
  light = false,
}: {
  light?: boolean;
  /** Accepted and ignored: /?category=… links predate the move to /library. */
  searchParams?: Promise<Record<string, string>>;
}) {
  const [all, drops, settings, viewer] = await Promise.all([
    getAssets(),
    getDrops(),
    getSettings(),
    getViewer(),
  ]);

  const newest = all.slice(0, STRIP);

  return (
    <div className={light ? "kiln-light" : undefined}>
      <a className="skip-link" href="#newest">
        Skip to the assets
      </a>
      <Nav light={light} viewer={viewer} />

      <main>
        {/* ============ Hero ============ */}
        <section className="shell kiln-hero" style={{ paddingBlock: "88px 56px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <p
              className="mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "var(--sage)",
              }}
            >
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 99, background: "var(--sage)" }} />
              Drop {settings.currentDrop} — shipped Thursday
            </p>

            <h1
              style={{
                fontSize: "clamp(38px, 5vw, 66px)",
                lineHeight: 1.06,
                fontWeight: 500,
                letterSpacing: "-0.035em",
                textWrap: "pretty",
              }}
            >
              {Spell(settings.totalAssets)} things worth stealing.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.65, color: "var(--muted)", maxWidth: 480 }}>
              Prompts, templates, scenes and workflows built in one studio and shipped weekly. Every
              item comes with the output, the source, and one site already running on it.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
              <Link
                data-nav
                href={viewer?.unlimited ? "/account" : EARLY_ACCESS ? "/join" : "/pricing"}
                className="btn btn--primary"
              >
                {viewer?.unlimited
                  ? "Your vault"
                  : EARLY_ACCESS
                    ? "Get free access"
                    : `Get unlimited — $${settings.monthlyPrice}/mo`}
              </Link>
              <Link data-nav href="/library" className="btn btn--ghost">
                Browse {settings.freeThisMonth} free
              </Link>
            </div>
          </div>

          <dl style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 6 }}>
            <div
              className="mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingBottom: 12,
                borderBottom: "1px solid var(--hairline)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--faint)",
              }}
            >
              <span>The vault</span>
              <span>Aug 2026</span>
            </div>
            <Stat label="Assets" value={String(settings.totalAssets)} />
            <Stat label="Free this month" value={String(settings.freeThisMonth)} />
            <Stat label="Added this week" value={String(settings.addedThisWeek)} accent />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <dt style={{ fontSize: 14, color: "var(--muted)" }}>Sole maker</dt>
              <dd className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                One studio
              </dd>
            </div>
          </dl>
        </section>

        {/* ============ Newest ============ */}
        <section id="newest" style={{ borderTop: "1px solid var(--hairline)" }}>
          <div className="shell" style={{ paddingBlock: "40px 0", display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Newest in the vault</h2>
            <div style={{ flex: 1, minWidth: 12 }} />
            <Link data-nav href="/library" style={{ fontSize: 15, color: "var(--sage-ink)", whiteSpace: "nowrap" }}>
              Browse the library →
            </Link>
          </div>
          <div className="shell" style={{ paddingBlock: "26px 72px" }}>
            <div className="kiln-masonry">
              {newest.map((asset) => (
                <div data-reveal key={asset.slug}>
                  <AssetCard asset={asset} canCopy={canDownload(viewer, asset)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ Thursday drops ============ */}
        <DropsSection drops={drops} />

        {/* ============ Closing ============ */}
        <section style={{ borderTop: "1px solid var(--hairline)" }}>
          <div
            className="shell"
            style={{
              paddingBlock: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(30px, 3.6vw, 44px)",
                lineHeight: 1.12,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                maxWidth: 640,
                textWrap: "pretty",
              }}
            >
              {/* `${'{'}x}` in JSX is a literal $ followed by an expression, not a
                  template placeholder — so this rendered "$5 are free. The
                  other $10". Only the price is money. */}
              {EARLY_ACCESS
                ? "All of it is free right now."
                : `${settings.freeThisMonth} are free. The other ${Math.max(0, settings.totalAssets - settings.freeThisMonth)} are $${settings.monthlyPrice} a month.`}
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)", maxWidth: 460 }}>
              {EARLY_ACCESS
                ? "The whole vault and every source file, free while Kinetic Layers is in early access. Make an account and take what you need."
                : "One subscription, the whole vault, every source file. Cancel and keep everything you downloaded."}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                data-nav
                href={EARLY_ACCESS ? (viewer ? "/library" : "/join") : viewer ? "/pricing" : "/join"}
                className="btn btn--primary"
              >
                {EARLY_ACCESS
                  ? viewer
                    ? "Browse the library"
                    : "Get free access"
                  : viewer?.unlimited
                    ? "Manage your plan"
                    : "Get unlimited"}
              </Link>
              <Link data-nav href="/pricing" className="btn btn--ghost">
                {EARLY_ACCESS ? "What it will cost later" : "See pricing"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer light={light} />
    </div>
  );
}

function DropsSection({ drops }: { drops: Drop[] }) {
  if (!drops.length) return null;
  return (
    <section data-reveal style={{ borderTop: "1px solid var(--hairline)", background: "var(--surface-2)" }}>
      <div
        className="shell"
        style={{
          paddingBlock: 72,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(340px,100%),1fr))",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
            Every Thursday
          </span>
          <h2 style={{ fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.12, fontWeight: 500, letterSpacing: "-0.025em" }}>
            New assets every week, and nothing that didn&rsquo;t ship somewhere first.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--muted)", maxWidth: 440 }}>
            Each drop is built for a real brief, used on a real page, then cleaned up and filed. If it
            never left the studio, it never enters the vault.
          </p>
        </div>

        <ul
          style={{
            /* The reset in kiln.css keys on ul[class], and this list has none,
               so the UA default padding-inline-start: 40px survived — showing
               as a strip of the --hairline background down the left inside the
               rounded border. */
            padding: 0,
            margin: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: "var(--hairline)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--r-xl)",
            overflow: "hidden",
          }}
        >
          {drops.map((d) => (
            <li
              key={d.slug}
              style={{
                background: "var(--void)",
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 15, color: "var(--ink)" }}>{d.title}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                  {d.meta}
                </span>
              </div>
              <DropTag tag={d.tag ?? "LIVE"} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <dt style={{ fontSize: 14, color: "var(--muted)" }}>{label}</dt>
      <dd style={{ fontSize: 26, fontWeight: 500, color: accent ? "var(--sage)" : "var(--ink)" }}>{value}</dd>
    </div>
  );
}

function DropTag({ tag }: { tag: "NEW" | "LIVE" | "SOON" }) {
  const style: React.CSSProperties =
    tag === "NEW"
      ? { background: "var(--sage-fill)", border: "1px solid var(--sage-line)", color: "var(--sage-ink)" }
      : tag === "SOON"
        ? { border: "1px solid rgba(185,206,149,0.34)", color: "var(--sage)" }
        : { border: "1px solid var(--line)", color: "var(--muted)" };

  return (
    <span
      className="mono"
      style={{ fontSize: 10, letterSpacing: "0.1em", borderRadius: "var(--r-pill)", padding: "5px 11px", whiteSpace: "nowrap", ...style }}
    >
      {tag}
    </span>
  );
}
