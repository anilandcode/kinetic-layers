"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Mark from "./Mark";
import SearchPalette from "./SearchPalette";
import ThemeToggle from "./ThemeToggle";
import { Avatar } from "@/components/legacy/Chrome";
import type { Viewer } from "@/lib/kl/types";

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function AccountMenu({ viewer }: { viewer: Viewer }) {
  return (
    <details className="kl-bench-account">
      <summary className="kl-bench-account-trigger" aria-haspopup="menu" aria-label="Account menu">
        <Avatar email={viewer.name || viewer.email} size={26} />
        <span className="kl-bench-account-caret" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="kl-bench-account-menu" role="menu">
        <span className="kl-bench-account-who" aria-hidden="true">
          {viewer.name || viewer.email}
        </span>
        <Link href="/account" role="menuitem">Account</Link>
        <Link href="/account/downloads" role="menuitem">Downloads</Link>
        <Link href="/account/profile" role="menuitem">Profile</Link>
        <form action="/auth/signout" method="post">
          <button type="submit" role="menuitem">Sign out</button>
        </form>
      </div>
    </details>
  );
}

function MobileAccountLinks({ viewer }: { viewer: Viewer }) {
  return (
    <div className="kl-bench-mobile-account">
      <span>{viewer.name || viewer.email}</span>
      <Link href="/account">Account</Link>
      <Link href="/account/downloads">Downloads</Link>
      <Link href="/account/profile">Profile</Link>
      <form action="/auth/signout" method="post">
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}

/** The benchmark's three-column navigation, retaining the existing search and account flows. */
export default function Header({
  viewer = null,
  pending = false,
}: {
  viewer?: Viewer | null;
  pending?: boolean;
} = {}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.header className="kl-bench-header" initial={reduced ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
      <div className="kl-bench-header-row">
        <nav className="kl-bench-nav" aria-label="Primary">
          {NAV.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>{item.label}</Link>;
          })}
        </nav>

        <Link href="/" className="kl-bench-wordmark" aria-label="Kinetic Layers home">
          <Mark size={22} id="klBenchHeaderMark" />
          <span>Kinetic Layers</span>
        </Link>

        <div className="kl-bench-actions">
          <button type="button" className="kl-bench-search" onClick={() => setSearchOpen(true)} aria-label="Search the library">
            <SearchIcon />
            <span>Search the library</span>
          </button>
          <ThemeToggle />
          {pending ? <span className="kl-bench-account-pending" aria-hidden="true" /> : viewer ? <AccountMenu viewer={viewer} /> : (
            <Link href="/pricing" className="kl-bench-upgrade">See pricing</Link>
          )}
        </div>

        <div className="kl-bench-mobile-actions">
          <button type="button" className="kl-bench-mobile-search" onClick={() => setSearchOpen(true)} aria-label="Search the library"><SearchIcon /></button>
          <details className="kl-bench-mobile-menu">
            <summary aria-label="Open navigation menu"><MenuIcon /></summary>
            <div className="kl-bench-mobile-menu-panel">
              <nav aria-label="Mobile primary">
                {NAV.map((item) => {
                  const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>{item.label}</Link>;
                })}
              </nav>
              <div className="kl-bench-mobile-menu-tools"><span>Theme</span><ThemeToggle /></div>
              {pending ? <span className="kl-bench-mobile-menu-pending" aria-hidden="true" /> : null}
              {viewer ? <MobileAccountLinks viewer={viewer} /> : <Link href="/pricing" className="kl-bench-mobile-upgrade">See pricing</Link>}
            </div>
          </details>
        </div>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
