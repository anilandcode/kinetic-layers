"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AssetCard from "./AssetCard";
import { ASSETS, MOODS, SHELVES, VAULT, type Mood, type Shelf } from "@/lib/kiln/data";

/**
 * The library: a sticky filter bar over a 3-up masonry.
 *
 * Promo cards are injected at fixed positions in the stream rather than
 * appended, so the grid never ends in a wall of advertising.
 */

type Promo = "upgrade" | "hire" | "news";
const PROMO_AT: Record<number, Promo> = { 4: "upgrade", 9: "hire", 14: "news" };

export default function Library({ light = false }: { light?: boolean }) {
  const [shelf, setShelf] = useState<"All" | Shelf>("All");
  const [mood, setMood] = useState<Mood | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);

  const list = useMemo(
    () =>
      ASSETS.filter(
        (a) =>
          (shelf === "All" || a.shelf === shelf) &&
          (!mood || a.mood === mood) &&
          (!freeOnly || a.free)
      ),
    [shelf, mood, freeOnly]
  );

  /* Interleave the promos, then append any that did not fit — but only when
     there are enough cards for them not to dominate. */
  const stream = useMemo(() => {
    const out: Array<{ kind: "asset"; slug: string } | { kind: Promo }> = [];
    const used = new Set<Promo>();
    list.forEach((asset, i) => {
      const promo = PROMO_AT[i];
      if (promo) {
        out.push({ kind: promo });
        used.add(promo);
      }
      out.push({ kind: "asset", slug: asset.slug });
    });
    if (list.length >= 4) {
      (["upgrade", "hire", "news"] as Promo[]).forEach((p) => {
        if (!used.has(p)) out.push({ kind: p });
      });
    }
    return out;
  }, [list]);

  return (
    <>
      <div
        data-morph
        data-bg={light ? "rgba(246,244,238,0.9)" : "rgba(15,15,13,0.94)"}
        data-bg-compact={light ? "rgba(246,244,238,0.96)" : "rgba(13,13,11,0.97)"}
        style={{
          position: "sticky",
          top: 66,
          zIndex: 15,
          background: light ? "rgba(246,244,238,0.9)" : "rgba(15,15,13,0.94)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--hairline)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div
          className="shell"
          style={{
            paddingBlock: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div role="group" aria-label="Shelf" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SHELVES.map((s) => (
              <button
                key={s}
                type="button"
                className="pill"
                aria-pressed={shelf === s}
                onClick={() => setShelf(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <span
            aria-hidden="true"
            style={{ width: 1, height: 22, background: "var(--hairline-3)", margin: "0 6px" }}
          />

          <div role="group" aria-label="Mood" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                className="pill pill--muted"
                aria-pressed={mood === m}
                onClick={() => setMood(mood === m ? null : m)}
              >
                {m}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            className="pill"
            aria-pressed={freeOnly}
            onClick={() => setFreeOnly(!freeOnly)}
          >
            Free only
          </button>
          <span
            className="mono"
            aria-live="polite"
            style={{ fontSize: 10, color: "var(--faint)" }}
          >
            {list.length} of {ASSETS.length}
          </span>
        </div>
      </div>

      <div className="shell" style={{ paddingBlock: "36px 80px" }}>
        {list.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 16, paddingBlock: 60 }}>
            Nothing on that shelf in that mood. Clear a filter to see the rest.
          </p>
        ) : (
          <div className="kiln-masonry">
            {stream.map((entry, i) =>
              entry.kind === "asset" ? (
                <div data-reveal key={entry.slug}>
                  <AssetCard asset={ASSETS.find((a) => a.slug === entry.slug)!} />
                </div>
              ) : (
                <div data-reveal key={`${entry.kind}-${i}`}>
                  <Promo kind={entry.kind} />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Promo({ kind }: { kind: Promo }) {
  if (kind === "upgrade") {
    return (
      <div className="kiln-promo kiln-promo--upgrade">
        <span
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "linear-gradient(150deg,rgba(232,240,216,0.95),rgba(150,178,112,0.6))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "#1A1E12",
          }}
        >
          ✦
        </span>
        <h3
          style={{
            fontSize: 27,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "30px 0 12px",
          }}
        >
          Go full vault.
        </h3>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>
          Every prompt, template and scene — plus the source files and all future drops.
        </p>
        <div style={{ flex: 1, minHeight: 26 }} />
        <Link
          data-nav
          href="/pricing"
          className="btn btn--primary"
          style={{ alignSelf: "flex-start", fontSize: 15, padding: "14px 32px" }}
        >
          Upgrade
        </Link>
      </div>
    );
  }

  if (kind === "hire") {
    return (
      <div className="kiln-promo kiln-promo--hire">
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
          Hire the studio
        </span>
        <h3
          style={{
            fontSize: 25,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.24,
            textWrap: "pretty",
          }}
        >
          Want something built only for you?
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
          Commissioned work never enters the vault.
        </p>
        <Link href="/join" style={{ fontSize: 16, color: "var(--sage-ink)", marginTop: 6 }}>
          Start a project →
        </Link>
      </div>
    );
  }

  return <NewsPromo />;
}

function NewsPromo() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function subscribe(evt: React.FormEvent) {
    evt.preventDefault();
    if (!email) return;
    const body = new FormData();
    body.set("email", email);
    body.set("source", "library-news-card");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", body });
      if (res.ok) setSent(true);
    } catch {
      /* the form stays as it was; the visitor can retry */
    }
  }

  return (
    <form className="kiln-promo kiln-promo--news" onSubmit={subscribe}>
      <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.3 }}>
        Fresh drops, every Thursday.
      </h3>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", marginBottom: 8 }}>
        Nine new assets and what they were built for, once a week.
      </p>
      {sent ? (
        <p style={{ fontSize: 15, color: "var(--sage-ink)" }}>
          You&rsquo;re on the list. First Thursday coming.
        </p>
      ) : (
        <>
          <label className="visually-hidden" htmlFor="news-email">
            Email address
          </label>
          <input
            id="news-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{
              border: "1px solid var(--line)",
              borderRadius: "var(--r-pill)",
              padding: "14px 20px",
              fontSize: 15,
              background: "transparent",
              color: "var(--ink)",
            }}
          />
          <button
            type="submit"
            className="btn"
            style={{ borderColor: "#35332B", color: "var(--ink)" }}
          >
            Subscribe
          </button>
        </>
      )}
      <span style={{ fontSize: 12, lineHeight: 1.5, color: "var(--faint)" }}>
        One email a week. Unsubscribe whenever.
      </span>
    </form>
  );
}
