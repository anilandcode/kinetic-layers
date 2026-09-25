"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./Account.module.css";

/**
 * The account's sections, as the library's pills. Client only because a
 * server layout has no pathname and the current tab has to be marked.
 */
const TABS = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/downloads", label: "Downloads" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/billing", label: "Plan" },
];

export default function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className={s.tabs}>
      {TABS.map((t) => {
        /* Exact for the index, prefix for the rest — otherwise Dashboard
           would light up on every sub-page as well as its own. */
        const current = t.href === "/account" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={s.tab} aria-current={current ? "page" : undefined} scroll={false}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
