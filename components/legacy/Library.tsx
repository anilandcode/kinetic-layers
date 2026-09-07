"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import AssetCard from "./AssetCard";
import { type Asset, type Viewer } from "@/lib/kl/types";
import { SORTS, SORT_LABEL, type Facets, type Sort } from "@/lib/kl/facets";
import { canDownload } from "@/lib/kl/gate";
import { EARLY_ACCESS } from "@/lib/kl/access";

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

/** Every filter except `sort`. Clear All drops exactly these. */
const FILTER_KEYS = ["type", "category", "theme", "saved"] as const;

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

  const type = params.get("type");
  const category = params.get("category");
  const theme = params.get("theme");
  const saved = params.get("saved") === "1";
  const filtered = FILTER_KEYS.some((k) => params.get(k));

  /* Drawn from what the catalogue actually holds, in a stable order, so no
     chip is ever offered for a category nothing has been filed under. */
  const categories = Object.keys(facets.category).sort();
  const themes = Object.keys(facets.theme).sort();
  /* Types read biggest-first: the tab row is a hierarchy, not an index, and a
     tab holding one asset should not open the row. */
  const types = Object.keys(facets.type).sort(
    (a, b) => (facets.type[b] ?? 0) - (facets.type[a] ?? 0) || a.localeCompare(b)
  );

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  /* One replace, not four. Clearing key by key would push four history entries
     and re-render between each, so back would walk them one at a time. Sort is
     deliberately kept: an ordering is a preference, not a filter. */
  function clearAll() {
    const next = new URLSearchParams(params.toString());
    FILTER_KEYS.forEach((k) => next.delete(k));
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
        {/* ---- Row 1: type, as tabs ------------------------------------
            Type is the coarsest cut — a 3D scene and a prompt are different
            things, not different flavours of one thing — so it reads as
            navigation rather than as another chip in the pile. Tabs carry that
            and pills do not.

            The row scrolls in its own box. Eight types will not fit on a
            phone, and a wrapping tab row stops looking like tabs at the moment
            it becomes two lines. */}
        <div className="shell" style={{ paddingTop: 12, display: "flex", alignItems: "flex-end", gap: 18 }}>
          <div
            role="group"
            aria-label="Asset type"
            className="kiln-tabs"
            style={{ flex: 1, minWidth: 0, display: "flex", gap: 22, overflowX: "auto", overscrollBehavior: "contain" }}
          >
            <Tab on={!type} onClick={() => setParam("type", null)}>
              All
            </Tab>
            {types.map((t) => (
              <Tab key={t} on={type === t} onClick={() => setParam("type", type === t ? null : t)}>
                {titleCase(t)}
                <Count n={facets.type[t] ?? 0} />
              </Tab>
            ))}
          </div>

          {/* Sort. URL-driven like the filters, so an ordering is shareable
              and survives the back button. */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0, paddingBottom: 8 }}>
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
        </div>

        {/* ---- Row 2: tone ---------------------------------------------- */}
        {/* Favourites and Clear all ride the tone row rather than the industry
            row below it. They belong with industry conceptually — they act on
            every filter — but that row fills its width with pills, so the pair
            wrapped onto a line of their own and sat at the far left of it,
            reading as an orphaned third filter group. Tone never fills the
            row, so here they stay put and right-aligned at every width. */}
        {/* Rendered unconditionally. It was gated on `themes.length > 1`, which
            on four of the eight type tabs left every asset sharing one tone —
            and took Favourites and Clear all down with the row, so the controls
            that undo a filter vanished exactly when a filter was on. */}
        {(
          <FilterRow
            label="Tone"
            trailing={
              <>
                {/* Signed out this is disabled rather than hidden: a control
                    that vanishes teaches nothing, and the label says what to
                    do about it. */}
                <button
                  type="button"
                  className="pill pill--muted"
                  disabled={!signedIn}
                  aria-pressed={signedIn ? saved : undefined}
                  title={signedIn ? undefined : "Sign in to save assets"}
                  aria-label={signedIn ? "Show only favourites" : "Favourites — sign in to save assets"}
                  onClick={() => setParam("saved", saved ? null : "1")}
                >
                  <Glyph name="heart" />
                  Favourites
                </button>
                <button
                  type="button"
                  className="pill pill--muted"
                  disabled={!filtered}
                  onClick={clearAll}
                >
                  Clear all
                </button>
              </>
            }
          >
            <div role="group" aria-label="Tone" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* One tone is not a choice, so the pills go — but if that tone
                  is the one currently filtered on, it stays, or the filter has
                  no control to switch it off. */}
              {(themes.length > 1 ? themes : themes.filter((t) => t === theme)).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="pill pill--muted"
                  aria-pressed={theme === t}
                  onClick={() => setParam("theme", theme === t ? null : t)}
                >
                  <Glyph name={t === "Light" ? "sun" : "moon"} />
                  {t}
                  <Count n={facets.theme[t] ?? 0} />
                </button>
              ))}
            </div>
          </FilterRow>
        )}

        {/* ---- Row 3: industry, plus the two controls that act on all of
            them. Favourites and Clear All sit here rather than in their own
            row because they are the end of the filter sentence, not a fourth
            taxonomy. */}
        {/* Same rule as tone: more than one choice, or a choice already made
            that must stay removable. */}
        {(categories.length > 1 || category) && (
          <FilterRow label="Industry">
            <div role="group" aria-label="Industry" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="pill"
                  aria-pressed={category === c}
                  onClick={() => setParam("category", category === c ? null : c)}
                >
                  <Glyph name={CATEGORY_GLYPH[c] ?? "dot"} />
                  {c}
                  <Count n={facets.category[c] ?? 0} />
                </button>
              ))}
            </div>
          </FilterRow>
        )}

        {/* The running total. Its own line under the filters, right-aligned to
            sit under Clear all. */}
        <div className="shell" style={{ paddingBottom: 12, display: "flex", justifyContent: "flex-end" }}>
          <span
            className="mono"
            aria-live="polite"
            /* nowrap: React renders this as three text nodes — "15", " of ",
               "15" — so the browser is free to break it at either space. When
               it does, the tail lands on its own line reading "OF 15", which
               looks like a second stray label rather than half of this one. */
            style={{
              fontSize: 10,
              color: "var(--faint)",
              opacity: pending ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {facets.matching} of {total}
          </span>
        </div>
      </div>

      <div className="shell" style={{ paddingBlock: "36px 80px" }}>
        {assets.length === 0 ? (
          <div style={{ paddingBlock: 60, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <p style={{ color: "var(--muted)", fontSize: 16 }}>
              {saved && signedIn
                ? "You have not saved anything matching that yet."
                : "Nothing matches all of those at once."}
            </p>
            <button type="button" className="btn btn--ghost" onClick={clearAll}>
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
          {EARLY_ACCESS ? "It is all free right now." : "Go full vault."}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>
          Every prompt, template and scene — plus the source files and all future drops.
          {EARLY_ACCESS ? " An account is the only thing between you and the lot." : ""}
        </p>
        <div style={{ flex: 1, minHeight: 26 }} />
        <Link
          data-nav
          href={EARLY_ACCESS ? "/join" : "/pricing"}
          className="btn btn--primary"
          style={{ alignSelf: "flex-start", fontSize: 15, padding: "14px 32px" }}
        >
          {EARLY_ACCESS ? "Make an account" : "Upgrade"}
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
  const [message, setMessage] = useState("");

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
      const json = await res.json().catch(() => ({}));
      setMessage(typeof json.message === "string" ? json.message : "");
      setState(res.ok && json.ok ? "sent" : "error");
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
        /* The server decides the wording now: whether an address is on the
           list depends on double opt-in and on whether a mail provider is
           configured, and this card cannot know either. It used to hardcode
           "You're on the list", which was the same false promise the route
           was making. */
        <p role="status" aria-live="polite" style={{ fontSize: 15, color: "var(--sage-ink)" }}>
          {message || "Check your email to confirm."}
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
        Subscribing sends one email asking you to confirm. After that: one a
        week, nothing else, and every one of them can unsubscribe you.
      </span>
    </form>
  );
}

/**
 * One labelled filter row: "TONE  [pills]        [trailing]".
 *
 * The label is a real element rather than a pseudo, so it wraps and lines up
 * with the pills instead of hanging off the first one.
 */
function FilterRow({
  label,
  children,
  trailing,
}: {
  label: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className="shell"
      style={{ paddingTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
    >
      <span
        aria-hidden="true"
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--faint)",
          /* Both labels align to the same column, so the pill rows start at one
             left edge rather than stepping in and out with the word length. */
          minWidth: 64,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {children}
      {trailing && (
        <>
          <div style={{ flex: 1, minWidth: 12 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{trailing}</div>
        </>
      )}
    </div>
  );
}

/** A type tab. Underlined when active — navigation, not a chip. */
function Tab({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        display: "inline-flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px 0 8px",
        fontSize: 14,
        color: on ? "var(--ink)" : "var(--muted)",
        /* The underline is drawn on the element itself rather than on a
           pseudo-element, so it inherits the same 2px whether or not the tab
           is active and the row never shifts by a pixel on selection. */
        borderBottom: `2px solid ${on ? "var(--ink)" : "transparent"}`,
        marginBottom: -1,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Category → glyph. Missing entries fall back to a dot rather than to nothing,
 * so a category added in Sanity gets a placeholder instead of a ragged row.
 */
const CATEGORY_GLYPH: Record<string, GlyphName> = {
  Hero: "spark",
  "Landing page": "layout",
  Portfolio: "folder",
  SaaS: "layers",
  Agency: "asterisk",
  Ecommerce: "bag",
  Dashboard: "chart",
  Editorial: "text",
  Background: "image",
  Texture: "grain",
  Workflow: "flow",
};

type GlyphName =
  | "sun" | "moon" | "heart" | "spark" | "layout" | "folder" | "layers"
  | "asterisk" | "bag" | "chart" | "text" | "image" | "grain" | "flow" | "dot";

/**
 * The chip icons. Inline SVG rather than an icon package: fifteen 40-byte
 * paths do not justify a dependency, and these inherit currentColor so they
 * follow the pill's pressed and disabled states for free.
 */
function Glyph({ name }: { name: GlyphName }) {
  const d: Record<GlyphName, React.ReactNode> = {
    sun: <><circle cx="8" cy="8" r="3.2" /><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1" /></>,
    moon: <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z" />,
    heart: <path d="M8 13.5S2.2 10 2.2 6.2A2.9 2.9 0 0 1 8 4.7a2.9 2.9 0 0 1 5.8 1.5C13.8 10 8 13.5 8 13.5Z" />,
    spark: <path d="M8 1.6 9.6 6 14 7.6 9.6 9.2 8 13.6 6.4 9.2 2 7.6 6.4 6Z" />,
    layout: <><rect x="2" y="2.6" width="12" height="10.8" rx="1.6" /><path d="M2 6.4h12" /></>,
    folder: <path d="M2.2 4.6a1 1 0 0 1 1-1h2.9l1.3 1.6h5.4a1 1 0 0 1 1 1v5.8a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1Z" />,
    layers: <><path d="M8 1.9 14.2 5 8 8.1 1.8 5Z" /><path d="m2.6 8 5.4 2.7L13.4 8" /><path d="m2.6 11 5.4 2.7L13.4 11" /></>,
    asterisk: <path d="M8 2.2v11.6M3 4.9l10 6.2M13 4.9 3 11.1" />,
    bag: <><path d="M3.2 5.2h9.6l-.8 8.2H4Z" /><path d="M6 5.2V4a2 2 0 0 1 4 0v1.2" /></>,
    chart: <path d="M2.6 13.4V9m3.6 4.4V5.6M9.8 13.4v-5m3.6 5V3.2" />,
    text: <path d="M3 3.6h10M3 8h10M3 12.4h6.4" />,
    image: <><rect x="2" y="3" width="12" height="10" rx="1.6" /><circle cx="5.8" cy="6.5" r="1.1" /><path d="m2.6 11.4 3.3-3 3 2.6 2-1.7 2.5 2.1" /></>,
    grain: <><circle cx="4.2" cy="4.4" r=".9" /><circle cx="9.1" cy="3.4" r=".9" /><circle cx="12.4" cy="6.6" r=".9" /><circle cx="6.4" cy="8.2" r=".9" /><circle cx="11" cy="11.2" r=".9" /><circle cx="3.6" cy="11.8" r=".9" /></>,
    flow: <><circle cx="4" cy="4" r="2" /><circle cx="12" cy="12" r="2" /><path d="M4 6.2v3.4a2.4 2.4 0 0 0 2.4 2.4h3.3" /></>,
    dot: <circle cx="8" cy="8" r="2.6" />,
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: 6, flexShrink: 0, opacity: 0.8 }}
    >
      {d[name]}
    </svg>
  );
}

/**
 * "3D SCENE" → "3D Scene". The catalogue stores types shouting, and a plain
 * title-case turns LORA into "Lora" and MCP into "Mcp" — which is not a
 * capitalisation choice, it is a misspelling of the thing being sold. Words
 * that are not words get spelled out rather than cased.
 */
const ACRONYM: Record<string, string> = {
  "3D": "3D",
  LORA: "LoRA",
  MCP: "MCP",
  AI: "AI",
  SAAS: "SaaS",
  UI: "UI",
  UX: "UX",
  CSS: "CSS",
};

const titleCase = (s: string) =>
  s
    .split(/(\s+|\/)/)
    .map((w) => {
      const key = w.trim().toUpperCase();
      if (ACRONYM[key]) return ACRONYM[key];
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join("");

/** The number on a chip. Muted, and hidden from assistive tech because the
    pill's own pressed state and label already carry the meaning — a screen
    reader hearing "Motion 6 pressed" gains nothing from the 6. */
function Count({ n }: { n: number }) {
  return (
    /* 10px is the floor. At 9 these counts measured as the smallest text on
       the site and were genuinely hard to read on a phone. */
    <span aria-hidden="true" className="mono" style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>
      {n}
    </span>
  );
}
