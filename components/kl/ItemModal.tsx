"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The item overlay.
 *
 * The design opens an asset in a popup, not a page — `onClick` sets `itemOpen`
 * and a fixed veil covers the screen. Doing that literally would have cost the
 * real route, and /item/[slug] is load-bearing outside the app: the sitemap,
 * the MCP tool's output, the OG image and every ?next= redirect point at it
 * (HANDOFF.md, trap 3).
 *
 * An intercepting route gives both. Clicking a card from inside the app renders
 * this overlay over the grid; a direct visit, a refresh, a shared link or a
 * crawler gets the full page. Same URL either way, so nothing external breaks,
 * and the cards stay ordinary <Link>s — no click handler to intercept.
 *
 * `data-kl` rather than <Shell> on purpose: the shell also mounts the motion
 * layer, and a second copy would rebind. The layer re-sweeps on pathname change
 * and the interception does change the pathname, so this content gets picked up
 * without one.
 */
export default function ItemModal({
  shelf,
  name,
  children,
}: {
  shelf: string;
  name: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    /* The design locks the page behind the veil. Restore whatever was there
       rather than clearing it, so a route that sets its own overflow is not
       quietly reset on close. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [close]);

  return (
    <div data-kl>
      <div
        className="kl-modal-veil"
        onClick={close}
        role="dialog"
        aria-modal="true"
        aria-label={name}
      >
        {/* The veil closes on click; the panel must not, or every click inside
            the asset would dismiss it. */}
        <div className="kl-modal-panel" onClick={(e) => e.stopPropagation()}>
          <div className="kl-crumbs">
            <span>{shelf.toUpperCase()}</span>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>{name.toUpperCase()}</span>
            <span className="kl-spacer" />
            <button type="button" className="kl-close" onClick={close}>
              CLOSE ✕
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
