import Link from "next/link";
import SearchTrigger from "./SearchTrigger";
import NavLinks, { ModeToggle } from "./NavLinks";
import type { Viewer } from "@/lib/kiln/types";
import { EARLY_ACCESS } from "@/lib/kiln/access";

/* ============================================================
   Nav and footer — shared by every page.

   Server components, so the signed-in state is correct on first paint
   rather than flickering in after hydration. Only the search palette
   and the active-link highlight run on the client.
   ============================================================ */

/**
 * Primary navigation.
 *
 * Account is deliberately NOT here. It was, and it was wrong twice over: for a
 * signed-out visitor it is a link to a redirect to the sign-in page, and for a
 * signed-in one it duplicates the avatar sitting a few pixels to its right.
 * Nav is for places anyone might want to go; your own account is reached from
 * the thing showing your own name.
 */
export const NAV = [
  { href: "/library", label: "Library" },
  { href: "/collections", label: "Collections" },
  /* Pricing leaves the nav while everything is free. The page stays reachable
     and still says what it will cost — that is honest, and it sets the anchor
     before there is anything to buy — but a Pricing tab on a site with no
     prices sends people to a dead end. */
  ...(EARLY_ACCESS ? [] : [{ href: "/pricing", label: "Pricing" }]),
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

        {/* Signed in during early access there is nothing left to get, so the
            button goes rather than offering an upgrade that already happened. */}
        {!viewer?.unlimited && (
          <Link
            data-nav
            href={EARLY_ACCESS ? "/join" : viewer ? "/pricing" : "/join?next=/pricing"}
            className="btn btn--primary"
            style={{ fontSize: 13, padding: "10px 18px" }}
          >
            {EARLY_ACCESS ? "Get free access" : "Get unlimited"}
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
          {/* Account belongs here rather than in the primary nav, but it does
              have to be somewhere: the avatar that normally reaches it is
              hidden below 620px, and without this a signed-in visitor on a
              phone would have no route to their own downloads. */}
          <Link data-nav href="/account" style={{ color: "inherit" }}>
            Account
          </Link>
        </nav>
        {/* These were three bare <span>s styled to read as links. Text that
            looks clickable and is not is worse than no link at all. */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link data-nav href="/docs" style={{ color: "inherit" }}>
            Docs
          </Link>
          <Link data-nav href="/mcp" style={{ color: "inherit" }}>
            MCP
          </Link>
          <Link data-nav href="/license" style={{ color: "inherit" }}>
            License
          </Link>
          <Link data-nav href="/privacy" style={{ color: "inherit" }}>
            Privacy
          </Link>
          <Link data-nav href="/terms" style={{ color: "inherit" }}>
            Terms
          </Link>
          <Link data-nav href="/changelog" style={{ color: "inherit" }}>
            Changelog
          </Link>
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com"}`}
            style={{ color: "inherit" }}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
