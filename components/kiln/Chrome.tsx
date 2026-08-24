"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/kiln/data";

/* ============================================================
   Nav, search and footer — shared by every page.
   ============================================================ */

const NAV = [
  { href: "/", label: "Library" },
  { href: "/collections", label: "Collections" },
  { href: "/account", label: "Account" },
  { href: "/pricing", label: "Pricing" },
];

export function Mark() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        background: "linear-gradient(140deg,rgba(185,206,149,0.9),rgba(120,150,95,0.55))",
        border: "1px solid rgba(185,206,149,0.5)",
        flexShrink: 0,
      }}
    />
  );
}

export function Nav({ light = false }: { light?: boolean }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (evt: KeyboardEvent) => {
      if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === "k") {
        evt.preventDefault();
        setSearchOpen(true);
      }
      if (evt.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const ink = "var(--ink)";
  const muted = "var(--muted)";

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: light ? "rgba(246,244,238,0.92)" : "rgba(15,15,13,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${"var(--hairline)"}`,
        }}
      >
        <nav
          className="shell site-nav"
          style={{ height: 66, display: "flex", alignItems: "center", gap: 36 }}
          aria-label="Primary"
        >
          <Link
            data-nav
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 9, color: ink }}
          >
            <Mark />
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kiln</span>
          </Link>

          <div
            data-hide-narrow
            style={{ display: "flex", gap: 26, fontSize: 14, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  data-nav
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  style={{ color: active ? ink : muted }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          <button
            data-hide-narrow
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search the vault"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flex: "0 1 250px",
              minWidth: 190,
              border: `1px solid ${"var(--hairline-3)"}`,
              borderRadius: "var(--r-pill)",
              padding: "8px 12px",
              background: "transparent",
              cursor: "pointer",
              overflow: "hidden",
              transition: "filter var(--t-fast) var(--ease)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--faint)" }}>
              Search the vault
            </span>
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--faint)",
                border: `1px solid ${"var(--hairline-3)"}`,
                borderRadius: "var(--r-pill)",
                padding: "3px 8px",
                flexShrink: 0,
              }}
            >
              ⌘K
            </span>
          </button>

          <Link
            data-nav
            data-hide-small
            href={light ? "/" : "/light"}
            aria-label={light ? "Switch to dark" : "Switch to light"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${"var(--hairline-3)"}`,
              borderRadius: "var(--r-pill)",
              padding: 4,
              flexShrink: 0,
            }}
          >
            <ModeDot on={!light} glyph="☾" />
            <ModeDot on={light} glyph="☀" />
          </Link>

          <Link
            data-nav
            data-hide-small
            href="/join"
            style={{ fontSize: 14, color: muted, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Sign in
          </Link>

          <Link
            data-nav
            href="/pricing"
            className="btn btn--primary"
            style={{
              fontSize: 13,
              padding: "10px 18px",
              ...(light
                ? { background: "var(--forest)", borderColor: "var(--forest)", color: "var(--cream)" }
                : null),
            }}
          >
            Get unlimited
          </Link>
        </nav>
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function ModeDot({ on, glyph }: { on: boolean; glyph: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 28,
        height: 28,
        borderRadius: "var(--r-pill)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        background: on
          ? "linear-gradient(140deg,rgba(185,206,149,0.30),rgba(185,206,149,0.10))"
          : "transparent",
        border: `1px solid ${on ? "rgba(185,206,149,0.42)" : "transparent"}`,
        color: on ? "var(--sage-ink)" : "var(--faint)",
      }}
    >
      {glyph}
    </span>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const hits = ASSETS.slice(0, 5);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the vault"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "rgba(8,8,7,0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "14vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(620px,90vw)",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid var(--hairline-3)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--sage)", fontSize: 16 }}>
            ⌕
          </span>
          <input
            autoFocus
            placeholder="Search prompts, templates, scenes…"
            aria-label="Search query"
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              outline: "none",
              fontSize: 16,
              color: "var(--ink)",
            }}
          />
        </div>
        <ul style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
          {hits.map((h) => (
            <li key={h.slug}>
              <Link
                data-nav
                href={`/item/${h.slug}`}
                style={{
                  padding: "13px 14px",
                  borderRadius: "var(--r-pill)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "var(--ink-3)",
                }}
              >
                <span style={{ fontSize: 14 }}>{h.name}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
                  {h.type}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div
          className="mono"
          style={{
            padding: "14px 22px",
            borderTop: "1px solid var(--hairline-3)",
            fontSize: 10,
            color: "var(--faint)",
          }}
        >
          Esc to close
        </div>
      </div>
    </div>
  );
}

export function Footer({ light = false }: { light?: boolean }) {
  return (
    <footer style={{ borderTop: `1px solid ${"var(--hairline)"}` }}>
      <div
        className="shell mono"
        style={{
          paddingBlock: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "var(--faint)",
        }}
      >
        <span>Kiln — one studio, since 2026</span>
        {/* The design hides the primary nav below 1180px and offers nothing in
            its place, which strands three of the four pages on a phone. These
            repeat it here rather than inventing a drawer the design never
            specified. */}
        <nav aria-label="Footer" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {NAV.map((item) => (
            <Link key={item.href} data-nav href={item.href} style={{ color: "inherit" }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 24 }}>
          <span>License</span>
          <span>Changelog</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
