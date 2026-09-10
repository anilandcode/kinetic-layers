"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Mark from "./Mark";
import SearchPalette from "./SearchPalette";
import GlassButton from "./GlassButton";
import ThemeToggle from "./ThemeToggle";
import { Avatar } from "@/components/legacy/Chrome";
import type { Viewer } from "@/lib/kl/types";

/**
 * The floating bar.
 *
 * Nav items are real links, not click handlers, so the middle-click and
 * open-in-new-tab that the prototype's onClick could not support both work.
 * The amber underline is a child span the motion layer wipes in on hover; it
 * is also shown outright for the current page, which is the only state that
 * has to survive without JavaScript.
 *
 * It takes a viewer now. It used to take nothing at all, which made it
 * structurally incapable of knowing anyone was signed in — so a signed-in
 * visitor saw "Go Premium" and had no route to /account from anywhere in the
 * chrome. SiteHeader supplies it; getViewer is React-cached, so asking on every
 * page costs one round trip per render rather than one per header.
 *
 * `pending` is for loading boundaries, which must not block on a session just to
 * paint a skeleton. It holds the slot with a shimmer so the CTA does not flash
 * "Go Premium" at someone who is signed in.
 */

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/collections", label: "Collections" },
  { href: "/how", label: "Process" },
  { href: "/pricing", label: "Pricing" },
];

export default function Header({
  viewer = null,
  pending = false,
}: {
  viewer?: Viewer | null;
  pending?: boolean;
} = {}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  /* ⌘K opens it, Escape closes it. Bound once on the document rather than on
     the trigger, because the shortcut has to work wherever focus happens to
     be — including inside the palette itself. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="kl-header">
      <div className="kl-pad">
        <div className="kl-bar">
          <Link href="/" className="kl-wordmark">
            <Mark size={20} />
            Kinetic Layers
          </Link>

          <nav className="kl-nav" data-hide-narrow aria-label="Primary">
            {NAV.map((n) => {
              const current = pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="kl-nav-link"
                  data-nav-link
                  aria-current={current ? "page" : undefined}
                >
                  <span className="kl-nav-label" data-nav-label style={{ display: "inline-block" }}>
                    {n.label}
                  </span>
                  <span className="kl-nav-ink" data-nav-ink aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <div className="kl-spacer" />

          <button type="button" className="kl-search-trigger" data-hide-narrow onClick={() => setSearchOpen(true)}>
            <span>Search the library</span>
            <span className="kl-kbd" aria-hidden="true">
              ⌘K
            </span>
          </button>

          <ThemeToggle />

          {pending ? (
            <span className="legacy-skel" style={{ width: 92, height: 34, borderRadius: 99 }} aria-hidden="true" />
          ) : viewer ? (
            /* A native disclosure, the same choice the library rail makes: no
               open/close state to own, no outside-click handler, no focus trap
               to get subtly wrong. Sign out is a POST form, which is what
               /auth/signout has always expected. */
            <details className="kl-drop kl-account-drop">
              <summary className="kl-account-trigger" aria-haspopup="menu" aria-label="Account menu">
                <Avatar email={viewer.name || viewer.email} size={26} />
                <span className="kl-drop-caret" aria-hidden="true">
                  ▾
                </span>
              </summary>
              <div className="kl-drop-menu" role="menu">
                <span className="kl-account-who" aria-hidden="true">
                  {viewer.name || viewer.email}
                </span>
                <Link href="/account" role="menuitem" className="kl-drop-item">
                  <span>Account</span>
                </Link>
                <Link href="/account/downloads" role="menuitem" className="kl-drop-item">
                  <span>Downloads</span>
                </Link>
                <Link href="/account/profile" role="menuitem" className="kl-drop-item">
                  <span>Profile</span>
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" role="menuitem" className="kl-drop-item kl-account-signout">
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <GlassButton href="/pricing" premium size="sm" pull={5}>
              Go Premium
            </GlassButton>
          )}
        </div>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
