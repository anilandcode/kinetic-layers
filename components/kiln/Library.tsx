"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import AssetCard from "./AssetCard";
import { type Asset, type Viewer } from "@/lib/kiln/types";
import { SORTS, SORT_LABEL, type Facets, type Sort } from "@/lib/kiln/facets";
import { canDownload } from "@/lib/kiln/gate";

/**
 * The library: a sticky filter bar over a masonry.
 *
 * Filter state lives in the URL, not in component state, so a filtered view is
 * shareable and the back button steps through filters the way a visitor
 * expects. The server does the filtering; this only writes the query string.
 *
 * Promo cards are injected at fixed positions in the stream rather than
 * appended, so the grid never ends in a wall of advertising.
 */

type Promo = "upgrade" | "hire" | "news";
const PROMO_AT: Record<number, Promo> = { 4: "upgrade", 9: "hire", 14: "news" };

export default function Library({
  assets,
  total,
  facets,
  sort,
  light = false,
  viewer = null,
}: {
  assets: Asset[];
  total: number;
  facets: Facets;
  sort: Sort;
  light?: boolean;
  viewer?: Viewer | null;
}) {
  const signedIn = Boolean(viewer);
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const category = params.get("category");
  const theme = params.get("theme");

  /* Drawn from what the catalogue actually holds, in a stable order, so no
     chip is ever offered for a category nothing has been filed under. */
  const categories = Object.keys(facets.category).sort();
  const themes = Object.keys(facets.theme).sort();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  const stream = useMemo(() => {
    const out: Array<{ kind: "asset"; asset: Asset } | { kind: Promo }> = [];
    const used = new Set<Promo>();
    assets.forEach((asset, i) => {
      const promo = PROMO_AT[i];
      if (promo) {
        out.push({ kind: promo });
        used.add(promo);
      }
      out.push({ kind: "asset", asset });
    });
    if (assets.length >= 4) {
      (["upgrade", "hire", "news"] as Promo[]).forEach((p) => {
        if (!used.has(p)) out.push({ kind: p });
      });
    }
    return out;
  }, [assets]);

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
        {/* "Used for" leads, because it is the question a visitor arrives
            with — both reference libraries put it first. It only draws when
            there is more than one answer to choose between. */}
        {categories.length > 1 && (
          <div
            className="shell"
            style={{ paddingTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
          >
            <div role="group" aria-label="Used for" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="pill"
                aria-pressed={!category}
                onClick={() => setParam("category", null)}
              >
                All uses
                <Count n={facets.matching} />
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="pill"
                  aria-pressed={category === c}
                  onClick={() => setParam("category", category === c ? null : c)}
                >
                  {c}
                  <Count n={facets.category[c] ?? 0} />
                </button>
              ))}
            </div>

            {themes.length > 1 && (
              <>
                <span aria-hidden="true" style={{ width: 1, height: 22, background: "var(--hairline-3)", margin: "0 6px" }} />
                <div role="group" aria-label="Theme" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {themes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="pill pill--muted"
                      aria-pressed={theme === t}
                      onClick={() => setParam("theme", theme === t ? null : t)}
                    >
                      {t}
                      <Count n={facets.theme[t] ?? 0} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Sort and the count. Shelf and Mood used to live here too — four
            taxonomies over two rows, in which "Editorial" was both a category
            and a mood, telling a visitor two different things under one word.
            Category answers what someone came for; theme answers how it looks.
            Shelf and mood remain as data (getRelated falls back to shelf, and
            /collections filters by it) but are no longer ways to slice the
            library. */}
        <div
          className="shell"
          style={{ paddingBlock: 14, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
        >
          <div style={{ flex: 1 }} />


          {/* Sort. URL-driven like the filters, so an ordering is shareable
              and survives the back button. */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span className="visually-hidden">Sort the library</span>
            <select
              className="pill pill--muted"
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "newest" ? null : e.target.value)}
              style={{ cursor: "pointer", paddingRight: 26 }}
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {SORT_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <span
            className="mono"
            aria-live="polite"
            style={{ fontSize: 10, color: "var(--faint)", opacity: pending ? 0.5 : 1 }}
          >
            {facets.matching} of {total}
          </span>
        </div>
      </div>

      <div className="shell" style={{ paddingBlock: "36px 80px" }}>
        {assets.length === 0 ? (
          <div style={{ paddingBlock: 60, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <p style={{ color: "var(--muted)", fontSize: 16 }}>
              Nothing on that shelf in that mood.
            </p>
            <button type="button" className="btn btn--ghost" onClick={() => startTransition(() => router.replace("?"))}>
              Clear the filters
            </button>
          </div>
        ) : (
          <div className="kiln-masonry">
            {stream.map((entry, i) =>
              entry.kind === "asset" ? (
                <div data-reveal key={entry.asset.slug}>
                  <AssetCard asset={entry.asset} canCopy={canDownload(viewer, entry.asset)} />
                </div>
              ) : (
                <div data-reveal key={`${entry.kind}-${i}`}>
                  <Promo kind={entry.kind} signedIn={signedIn} />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Promo({ kind, signedIn }: { kind: Promo; signedIn: boolean }) {
  if (kind === "upgrade") {
    return (
      <div className="kiln-promo kiln-promo--upgrade">
        <span
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "var(--sage)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: "var(--sage-deep)",
          }}
        >
          ✦
        </span>
        <h2 style={{ fontSize: 27, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "30px 0 12px" }}>
          Go full vault.
        </h2>
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
        <h2 style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.24, textWrap: "pretty" }}>
          Want something built only for you?
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
          Commissioned work never enters the vault.
        </p>
        <Link data-nav href={signedIn ? "/account" : "/join"} style={{ fontSize: 16, color: "var(--sage-ink)", marginTop: 6 }}>
          Start a project →
        </Link>
      </div>
    );
  }

  return <NewsPromo />;
}

function NewsPromo() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function subscribe(evt: React.FormEvent) {
    evt.preventDefault();
    if (!email) return;
    setState("sending");
    const body = new FormData();
    body.set("email", email);
    body.set("source", "library-news-card");
    /* Submitting a form whose button says "Subscribe", under copy stating what
       arrives and how often, IS the opt-in. Without this the row was stored and
       the provider was never told, so nobody was actually subscribed. */
    body.set("consent", "1");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", body, headers: { Accept: "application/json" } });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form className="kiln-promo kiln-promo--news" onSubmit={subscribe}>
      <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.3 }}>
        Fresh drops, every Thursday.
      </h2>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", marginBottom: 8 }}>
        New assets and what they were built for, once a week.
      </p>
      {/* Swapping the form for a paragraph is invisible to a screen reader
          unless the paragraph announces itself — success was silent. */}
      {state === "sent" ? (
        <p role="status" aria-live="polite" style={{ fontSize: 15, color: "var(--sage-ink)" }}>
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
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={state === "error" ? "news-message" : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{
              border: "1px solid var(--field-line)",
              borderRadius: "var(--r-pill)",
              padding: "14px 20px",
              fontSize: 15,
              background: "transparent",
              color: "var(--ink)",
            }}
          />
          <button
            type="submit"
            data-track="form_submit"
            data-track-detail="newsletter"
            disabled={state === "sending"}
            className="btn"
            style={{ borderColor: "#35332B", color: "var(--ink)" }}
          >
            {state === "sending" ? "Sending…" : "Subscribe"}
          </button>
          {state === "error" && (
            <span id="news-message" role="alert" style={{ fontSize: 13, color: "var(--danger)" }}>
              That did not go through. Try again.
            </span>
          )}
        </>
      )}
      <span style={{ fontSize: 12, lineHeight: 1.5, color: "var(--faint)" }}>
        Subscribing adds you to the Thursday email. One a week, nothing else,
        unsubscribe from any of them.
      </span>
    </form>
  );
}

/** The number on a chip. Muted, and hidden from assistive tech because the
    pill's own pressed state and label already carry the meaning — a screen
    reader hearing "Motion 6 pressed" gains nothing from the 6. */
function Count({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="mono" style={{ marginLeft: 6, fontSize: 9, opacity: 0.55 }}>
      {n}
    </span>
  );
}
