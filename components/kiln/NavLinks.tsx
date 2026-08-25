"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./Chrome";

/** Only the active-link highlight needs the client; the rest of the nav is server-rendered. */
export default function NavLinks() {
  const pathname = usePathname();
  return (
    <div data-hide-narrow style={{ display: "flex", gap: 26, fontSize: 14, whiteSpace: "nowrap", flexShrink: 0 }}>
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            data-nav
            href={item.href}
            aria-current={active ? "page" : undefined}
            style={{ color: active ? "var(--ink)" : "var(--muted)" }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function ModeToggle({ light }: { light: boolean }) {
  return (
    <Link
      data-nav
      data-hide-small
      href={light ? "/" : "/light"}
      aria-label={light ? "Switch to the dark treatment" : "Switch to the light treatment"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        border: "1px solid var(--hairline-3)",
        borderRadius: "var(--r-pill)",
        padding: 4,
        flexShrink: 0,
      }}
    >
      <Dot on={!light} glyph="☾" />
      <Dot on={light} glyph="☀" />
    </Link>
  );
}

function Dot({ on, glyph }: { on: boolean; glyph: string }) {
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
        background: on ? "linear-gradient(140deg,rgba(185,206,149,0.30),rgba(185,206,149,0.10))" : "transparent",
        border: `1px solid ${on ? "rgba(185,206,149,0.42)" : "transparent"}`,
        color: on ? "var(--sage-ink)" : "var(--faint)",
      }}
    >
      {glyph}
    </span>
  );
}
