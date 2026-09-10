"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The account section switcher.
 *
 * Client only because a server layout has no pathname, and the current tab has
 * to be marked. Everything else about it is a link — same `.kl-pill` the library
 * rail uses, so there is no second vocabulary for "one of these is selected".
 */
const TABS = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/downloads", label: "Downloads" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/billing", label: "Billing" },
];

export default function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {TABS.map((t) => {
        /* Exact match for the index, prefix for the rest — otherwise /account
           would light up on every sub-page as well as its own. */
        const current = t.href === "/account" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="kl-pill"
            aria-current={current ? "page" : undefined}
            scroll={false}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
