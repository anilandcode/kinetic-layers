"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer, Nav } from "./Chrome";
import AssetCard from "./AssetCard";
import type { Asset, Viewer } from "@/lib/kiln/types";

/**
 * Item page.
 *
 * The gate here is presentation. The truth is in /api/download, which re-checks
 * entitlement server-side — this only decides which of three states to draw, so
 * the two can never disagree about what is allowed.
 */

type Gate = "open" | "needs-account" | "needs-unlimited";

export default function ItemView({
  asset,
  related,
  viewer,
  gate,
  saved: initiallySaved,
}: {
  asset: Asset;
  related: Asset[];
  viewer: Viewer | null;
  gate: Gate;
  saved: boolean;
}) {
  const [shot, setShot] = useState(0);
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  /* An anonymous visitor on a paid asset needs an account *and* a
     subscription. Saying "create a free account" there would be true but
     misleading — it is not what unlocks the file. */
  const unlockLabel =
    gate === "needs-unlimited" || (gate === "needs-account" && !asset.free)
      ? "Get unlimited"
      : "Create a free account";
  const unlockHref =
    gate === "needs-unlimited"
      ? "/pricing"
      : asset.free
        ? `/join?next=/item/${asset.slug}`
        : "/join?next=/pricing";

  const shots = asset.shots?.length
    ? asset.shots
    : [{ label: "Preview", gradient: asset.g, image: undefined }];
  const current = shots[Math.min(shot, shots.length - 1)];

  async function download() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: asset.slug }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice({ kind: "error", text: json.message ?? "That did not work." });
        return;
      }
      /* The signed URL is short-lived, so it is used immediately rather than
         held in state where it could go stale. */
      window.location.href = json.url;
      setNotice({ kind: "ok", text: `Downloading ${json.name}.` });
    } catch {
      setNotice({ kind: "error", text: "Network trouble. Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (!viewer) return;
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "asset", slug: asset.slug, saved: next }),
      });
      if (!res.ok) setSaved(!next);
    } catch {
      setSaved(!next);
    }
  }

  return (
    <>
      <a className="skip-link" href="#shot">
        Skip to the preview
      </a>
      <Nav viewer={viewer} />

      <main>
        <nav
          className="shell mono"
          aria-label="Breadcrumb"
          style={{ paddingBlock: "26px 0", display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "var(--faint)" }}
        >
          <Link data-nav href="/" style={{ color: "var(--faint)" }}>
            Library
          </Link>
          <span aria-hidden="true">/</span>
          <Link data-nav href={`/?shelf=${asset.shelf}`} style={{ color: "var(--faint)" }}>
            {asset.shelf}
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: "var(--muted)" }}>{asset.name}</span>
        </nav>

        <div
          className="shell"
          style={{
            paddingBlock: "24px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))",
            gap: 34,
            alignItems: "start",
          }}
        >
          {/* --- Gallery --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div data-hero style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                id="shot"
                style={{
                  height: 520,
                  borderRadius: "var(--r-card)",
                  overflow: "hidden",
                  background: current.image ? undefined : current.gradient ?? asset.g,
                  position: "relative",
                }}
              >
                {current.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.image}
                    alt={`${asset.name} — ${current.label}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                <span
                  className="mono"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: 16,
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: "var(--sage-ink)",
                    background: "rgba(11,11,10,0.5)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(232,240,216,0.18)",
                    borderRadius: "var(--r-pill)",
                    padding: "7px 14px",
                  }}
                >
                  {current.label}
                </span>
              </div>

              {shots.length > 1 && (
                <div role="group" aria-label="Preview shots" style={{ display: "flex", gap: 10 }}>
                  {shots.map((s, i) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={s.label}
                      aria-pressed={i === shot}
                      onClick={() => setShot(i)}
                      style={{
                        flex: 1,
                        height: 74,
                        borderRadius: "var(--r-inner)",
                        cursor: "pointer",
                        background: s.gradient ?? asset.g,
                        border: 0,
                        outline: `1px solid ${i === shot ? "rgba(185,206,149,0.55)" : "transparent"}`,
                        outlineOffset: 2,
                        transition: "outline-color var(--t-mid) var(--ease)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <section data-reveal style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 22 }}>
              <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>What this is</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", maxWidth: 640 }}>
                {asset.tagline ?? "Built for a real brief, shipped, then cleaned up and filed."}
              </p>
            </section>

            {/* --- The gate --- */}
            {asset.promptLength ? (
              <PromptGate asset={asset} gate={gate} unlockHref={unlockHref} />
            ) : null}

            {asset.files?.length ? (
              <section
                data-reveal
                aria-label="Files included"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, paddingTop: 14 }}
              >
                {asset.files.map((f) => (
                  <div
                    key={f.name}
                    style={{
                      borderRadius: "var(--r-card)",
                      border: "1px solid var(--hairline)",
                      background: "var(--surface-2)",
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                      <span style={{ fontSize: 15, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.name}
                      </span>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                        {f.meta}
                      </span>
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        color: "var(--muted)",
                        border: "1px solid var(--hairline-3)",
                        borderRadius: "var(--r-pill)",
                        padding: "5px 11px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                ))}
              </section>
            ) : null}
          </div>

          {/* --- Buy rail --- */}
          <div style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{asset.name}</h1>
                <span className={asset.free ? "chip chip--sage" : "chip"} style={{ padding: "5px 13px" }}>
                  {asset.free ? "Free" : "Unlimited"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[asset.type, asset.stack, asset.shelf, asset.mood].map((t) => (
                  <span className="chip" key={t}>
                    {t.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--sage-line-2)",
                background: "radial-gradient(120% 90% at 85% 0%,rgba(185,206,149,0.15),rgba(20,20,17,0) 62%),var(--surface)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 13,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sage)" }}>
                {gate === "open" ? "Yours to download" : asset.free ? "Free with an account" : "Included with unlimited"}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)" }}>
                {gate === "open"
                  ? "Every file, including the source. Yours to keep even if you cancel."
                  : gate === "needs-account"
                    ? "This one is free — it just needs an account so your downloads have somewhere to live."
                    : "Download the scene, both integrations and every source file. $24 a month for the whole vault."}
              </span>

              {gate === "open" ? (
                <button type="button" className="btn btn--primary" onClick={download} disabled={busy} style={{ fontSize: 15, padding: "15px 22px" }}>
                  {busy ? "Preparing…" : "Download"}
                </button>
              ) : (
                <Link data-nav href={unlockHref} className="btn btn--primary" style={{ fontSize: 15, padding: "15px 22px" }}>
                  {unlockLabel}
                </Link>
              )}

              {viewer ? (
                <button type="button" className="btn btn--quiet" onClick={toggleSave}>
                  {saved ? "Saved — remove" : "Save for later"}
                </button>
              ) : (
                <Link data-nav href={`/join?next=/item/${asset.slug}`} className="btn btn--quiet">
                  Save for later
                </Link>
              )}

              {notice && (
                <span
                  role={notice.kind === "error" ? "alert" : "status"}
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: "0.1em", textAlign: "center", color: notice.kind === "error" ? "var(--danger)" : "var(--sage)" }}
                >
                  {notice.text}
                </span>
              )}
              {!notice && (
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)", textAlign: "center" }}>
                  Cancel anytime · keep your downloads
                </span>
              )}
            </div>

            {asset.specs?.length ? (
              <dl style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", background: "var(--surface-2)", overflow: "hidden" }}>
                {asset.specs.map((s) => (
                  <div
                    key={s.k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "14px 20px",
                      borderBottom: "1px solid #1A1917",
                    }}
                  >
                    <dt className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--faint)" }}>
                      {s.k}
                    </dt>
                    <dd style={{ fontSize: 14, color: "var(--ink-3)", textAlign: "right" }}>{s.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline)",
                background: "var(--surface-2)",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 11,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>
                License
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                Use it in unlimited personal and client projects. Don&rsquo;t resell the file or
                republish it to another marketplace.
              </span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section data-reveal className="shell" style={{ paddingBlock: "64px 90px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 20, gap: 20 }}>
              <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>From the same drop</h2>
              <Link data-nav href="/collections" className="mono" style={{ fontSize: 10 }}>
                See the collections
              </Link>
            </div>
            <div className="kiln-grid">
              {related.map((r) => (
                <AssetCard key={r.slug} asset={r} height={190} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

/**
 * The prompt gate.
 *
 * Two real lines, then progressive blur — never a flat overlay. The character
 * count is true, and it is the only thing about the hidden text that reaches
 * the browser: the rest of the prompt is never sent until the gate opens.
 */
function PromptGate({ asset, gate, unlockHref }: { asset: Asset; gate: Gate; unlockHref: string }) {
  const lines = (asset.promptPreview ?? "").split("\n").filter(Boolean);
  const hidden = Math.max(0, (asset.promptLength ?? 0) - (asset.promptPreview?.length ?? 0));

  return (
    <section
      data-reveal
      style={{
        marginTop: 22,
        border: "1px solid var(--hairline-3)",
        borderRadius: "var(--r-card)",
        background: "var(--surface)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
        The prompt
      </span>

      <div
        className="mono"
        style={{
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 20,
          background: "var(--void)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          fontSize: 12,
          lineHeight: 1.7,
          color: "var(--ink-3)",
          textTransform: "none",
          letterSpacing: 0,
        }}
      >
        {lines.map((l, i) => (
          <span key={i}>{l}</span>
        ))}

        {gate !== "open" && hidden > 0 && (
          <>
            <span aria-hidden="true" style={{ filter: "blur(4px)", color: "var(--faint)" }}>
              and a grain overlay at 6% opacity layered beneath the type
            </span>
            <span aria-hidden="true" style={{ filter: "blur(5px)", color: "var(--faint)" }}>
              use a single warm key light positioned camera-left at 35 degrees
            </span>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                marginTop: 8,
                paddingTop: 14,
                borderTop: "1px solid var(--line)",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "var(--faint)", fontSize: 10, letterSpacing: "0.1em" }}>
                {hidden.toLocaleString()} characters hidden
              </span>
              <Link data-nav href={unlockHref} className="btn btn--primary" style={{ padding: "8px 14px", fontSize: 13 }}>
                Unlock
              </Link>
            </div>
          </>
        )}
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
        {gate === "open"
          ? "The full prompt ships in the download, alongside the output it produced."
          : "Two real lines, then the rest. The count is exact — there is something behind it."}
      </p>
    </section>
  );
}
