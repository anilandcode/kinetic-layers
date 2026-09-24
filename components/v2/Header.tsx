"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Viewer } from "@/lib/kl/types";
import Icon from "./Icon";
import Mark from "./Mark";
import SearchDialog from "./SearchDialog";
import { ButtonLink } from "./Button";
import { useDialog } from "./useDialog";
import s from "./Header.module.css";

/* Library and Pricing are the navigation; search, theme and the account are
   utilities; everything else is in the footer (docs/DESIGN-DIRECTION-V2.md). */
const NAV = [
  { href: "/library", label: "Library" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

const MORE = [
  { href: "/mcp", label: "MCP" },
  { href: "/changelog", label: "Changelog" },
  { href: "/contact", label: "Contact" },
  { href: "/license", label: "License" },
];

/* Home is the library with a short hero on top, so Library reads as current
   on both. */
const isCurrent = (pathname: string, href: string) =>
  pathname === href ||
  pathname.startsWith(`${href}/`) ||
  (href === "/library" && (pathname === "/" || pathname.startsWith("/direction/")));

function initial(viewer: Viewer) {
  return (viewer.name || viewer.email || "?").trim().charAt(0).toUpperCase() || "?";
}

function AccountMenu({ viewer }: { viewer: Viewer }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={s.account}>
      <button
        ref={button}
        type="button"
        className={s.avatar}
        aria-expanded={open}
        aria-controls="v2-account-menu"
        aria-label={`Account menu for ${viewer.name || viewer.email || "your account"}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.avatarDisc} aria-hidden="true">{initial(viewer)}</span>
        <span className={s.avatarName} aria-hidden="true">{viewer.name || viewer.email?.split("@")[0] || "Account"}</span>
      </button>
      {open ? (
        <div id="v2-account-menu" className={s.menu}>
          <p className={s.who}>
            <span>{viewer.name || "Signed in"}</span>
            {viewer.email ? <span className={s.whoMail}>{viewer.email}</span> : null}
          </p>
          <Link href="/account" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/account/downloads" onClick={() => setOpen(false)}>Downloads</Link>
          <Link href="/account/profile" onClick={() => setOpen(false)}>Profile</Link>
          <Link href="/account/billing" onClick={() => setOpen(false)}>Plan</Link>
          <form action="/auth/signout" method="post">
            <button type="submit">Sign out</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Drawer({
  open,
  onClose,
  viewer,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  viewer: Viewer | null;
  pathname: string;
}) {
  const panel = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useDialog(panel, open, onClose, closeRef);
  if (!open) return null;

  return (
    <div className={s.drawerVeil} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className={s.drawer} role="dialog" aria-modal="true" aria-label="Menu">
        <div className={s.drawerHead}>
          <span className={s.brandSmall}>
            <Mark size={22} /> Kinetic Layers
          </span>
          <button ref={closeRef} type="button" className={s.round} onClick={onClose} aria-label="Close menu">
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav aria-label="Primary" className={s.drawerNav}>
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} onClick={onClose}>Home</Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname !== "/" && isCurrent(pathname, item.href) ? "page" : undefined}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="More" className={s.drawerMore}>
          {MORE.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={s.drawerFoot}>
          {viewer ? (
            <div className={s.drawerAccount}>
              <span className={s.who}>
                <span>{viewer.name || "Signed in"}</span>
                {viewer.email ? <span className={s.whoMail}>{viewer.email}</span> : null}
              </span>
              <Link href="/account" onClick={onClose}>Dashboard</Link>
              <Link href="/account/downloads" onClick={onClose}>Downloads</Link>
              <form action="/auth/signout" method="post">
                <button type="submit">Sign out</button>
              </form>
            </div>
          ) : (
            <div className={s.drawerCta}>
              <ButtonLink href="/join" size="lg" onClick={onClose}>
                Join free
              </ButtonLink>
              <ButtonLink href="/join?mode=signin" variant="secondary" size="lg" onClick={onClose}>
                Sign in
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Header({
  viewer = null,
  pending = false,
  look = "soft",
}: {
  viewer?: Viewer | null;
  pending?: boolean;
  /** Each direction is a whole look, so the theme toggle stays out while they are compared. */
  look?: "soft" | "cinematic";
}) {
  const pathname = usePathname() ?? "/";
  const barRef = useRef<HTMLElement | null>(null);
  /* The bar's backdrop-filter makes it the containing block for anything
     position: fixed inside it, which clipped the drawer and the search dialog
     to the 68px bar. They render into the shell root instead — still inside
     [data-v2], so the tokens apply. */
  const [layerRoot, setLayerRoot] = useState<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setLayerRoot(barRef.current?.closest<HTMLElement>("[data-v2]") ?? document.body);
    /* The bar sits on the canvas at the top and frosts once content passes
       under it, as the references' floating headers do. */
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* A navigation from inside the drawer or search closes it. */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header ref={barRef} className={s.bar} data-scrolled={scrolled ? "" : undefined} data-look={look}>
      <div className={s.row}>
        <Link href="/" className={s.brand} aria-label="Kinetic Layers, home">
          <Mark size={26} />
          <span>Kinetic Layers</span>
        </Link>

        <nav aria-label="Primary" className={s.nav}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={s.tools}>
          <button type="button" className={s.search} onClick={() => setSearchOpen(true)} aria-label="Search the library">
            <Icon name="search" size={17} />
            <span className={s.searchText}>Search</span>
            <kbd className={s.kbd} aria-hidden="true">⌘K</kbd>
          </button>
          <span className={s.desktopOnly}>
            {pending ? (
              <span className={s.pending} aria-hidden="true" />
            ) : viewer ? (
              <AccountMenu viewer={viewer} />
            ) : (
              <span className={s.auth}>
                <Link href="/join?mode=signin" className={s.signin}>Sign in</Link>
                <ButtonLink href="/join" size="sm">Join free</ButtonLink>
              </span>
            )}
          </span>
          <button
            type="button"
            className={`${s.round} ${s.mobileOnly}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <Icon name="menu" size={19} />
          </button>
        </div>
      </div>
      {layerRoot
        ? createPortal(
            <>
              <SearchDialog open={searchOpen} onClose={closeSearch} />
              <Drawer open={menuOpen} onClose={closeMenu} viewer={viewer} pathname={pathname} />
            </>,
            layerRoot
          )
        : null}
    </header>
  );
}
