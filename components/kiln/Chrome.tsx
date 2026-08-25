import Link from "next/link";
import SearchTrigger from "./SearchTrigger";
import NavLinks, { ModeToggle } from "./NavLinks";
import type { Viewer } from "@/lib/kiln/types";

/* ============================================================
   Nav and footer — shared by every page.

   Server components, so the signed-in state is correct on first paint
   rather than flickering in after hydration. Only the search palette
   and the active-link highlight run on the client.
   ============================================================ */

export const NAV = [
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

export function Nav({ light = false, viewer = null }: { light?: boolean; viewer?: Viewer | null }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: light ? "rgba(246,244,238,0.92)" : "rgba(15,15,13,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <nav
        className="shell site-nav"
        style={{ height: 66, display: "flex", alignItems: "center", gap: 36 }}
        aria-label="Primary"
      >
        <Link data-nav href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}>
          <Mark />
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kiln</span>
        </Link>

        <NavLinks />

        <div style={{ flex: 1 }} />

        <SearchTrigger />
        <ModeToggle light={light} />

        {viewer ? (
          <Link
            data-nav
            href="/account"
            data-hide-small
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid var(--hairline-3)",
              borderRadius: "var(--r-pill)",
              padding: "5px 14px 5px 5px",
              flexShrink: 0,
              color: "var(--ink-3)",
            }}
          >
            <Avatar email={viewer.email} />
            <span style={{ fontSize: 13 }}>{viewer.email ?? "Account"}</span>
          </Link>
        ) : (
          <Link
            data-nav
            data-hide-small
            href="/join"
            style={{ fontSize: 14, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Sign in
          </Link>
        )}

        {!viewer?.unlimited && (
          <Link
            data-nav
            href={viewer ? "/pricing" : "/join?next=/pricing"}
            className="btn btn--primary"
            style={{ fontSize: 13, padding: "10px 18px" }}
          >
            Get unlimited
          </Link>
        )}
      </nav>
    </header>
  );
}

export function Avatar({ email, size = 26 }: { email: string | null; size?: number }) {
  const initial = (email ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "var(--r-pill)",
        /* Solid, not a gradient: the initial has to clear contrast against the
           darkest part of the fill, and the system bans gradient surfaces. */
        background: "var(--sage)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.42),
        color: "var(--sage-deep)",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}

export function Footer({ light = false }: { light?: boolean }) {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)" }}>
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
