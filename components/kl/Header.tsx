"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SearchPalette from "./SearchPalette";
import GlassButton from "./GlassButton";
import ThemeToggle from "./ThemeToggle";

/**
 * The floating bar.
 *
 * Nav items are real links, not click handlers, so the middle-click and
 * open-in-new-tab that the prototype's onClick could not support both work.
 * The amber underline is a child span the motion layer wipes in on hover; it
 * is also shown outright for the current page, which is the only state that
 * has to survive without JavaScript.
 */

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/collections", label: "Collections" },
  { href: "/how", label: "Process" },
  { href: "/pricing", label: "Pricing" },
];

export default function Header() {
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
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="klMark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8C8A84" />
                  <stop offset="1" stopColor="#E8853A" />
                </linearGradient>
              </defs>
              <path d="M0 0H40V40H10C4.5 40 0 35.5 0 30V0Z" fill="url(#klMark)" />
              <path d="M10 10H40V40H15C12.2 40 10 37.8 10 35V10Z" fill="#FFFFFF" fillOpacity="0.34" />
              <path d="M20 20H40V40H22C20.9 40 20 39.1 20 38V20Z" fill="#FFFFFF" fillOpacity="0.52" />
            </svg>
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

          <GlassButton href="/pricing" premium size="sm" pull={5}>
            Go Premium
          </GlassButton>
        </div>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
