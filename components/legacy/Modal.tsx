"use client";

import { useEffect, useRef } from "react";

/**
 * The dialog shell.
 *
 * Closing is a callback rather than `router.back()`. It used to be a route
 * change, because the dialog was an intercepted route and existed only because
 * the URL said so — but that meant opening an asset changed the address bar,
 * which is precisely what made a popup read as a new page. The owner decides
 * what closing means now; this only draws the layer and manages focus.
 *
 * The focus handling is the same shape SearchTrigger uses. It is repeated here
 * rather than shared because the two differ in the one place that matters:
 * SearchTrigger restores focus from the trigger it owns, and this has no
 * trigger to own — the card that opened it belongs to a route that may already
 * have been replaced.
 */
export default function Modal({
  children,
  label,
  onClose,
}: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = onClose;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        /* Stop it here, or the palette's own document-level Escape handler
           closes that too and one keypress dismisses two things. */
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const root = panel.current;
      if (!root) return;
      /* getClientRects, not offsetParent: the overlay is position:fixed, and
         offsetParent is null for descendants of a fixed ancestor. */
      const focusable = [
        ...root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((el) => el.getClientRects().length > 0);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    /* Capture, so Escape reaches this before the palette's bubble-phase
       listener on document. */
    document.addEventListener("keydown", onKey, { capture: true });

    /* The page behind must not scroll under the dialog. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Focus moves into the panel so a keyboard user is not left behind on the
       card they clicked, which is now under an overlay. */
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey, { capture: true });
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      /* Centred, and the backdrop itself does not scroll.
         It used to be top-aligned with `overflowY: auto`, which let the panel
         grow to its content — 1262px inside a 900px viewport — so the whole
         overlay scrolled like a document and read as a page rather than a
         layer over one. The scroll belongs inside the panel. */
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(8,8,7,0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4vh 16px",
        overflow: "hidden",
      }}
    >
      <div
        ref={panel}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        /* Bounded, so there is always backdrop above and below and the thing
           is visibly floating. A short asset still shrinks to its content —
           maxHeight is a ceiling, not a height. */
        style={{
          width: "min(1100px, 100%)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--ground)",
          border: "1px solid var(--line)",
          borderRadius: "18px",
          position: "relative",
          outline: "none",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn btn--ghost"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            width: 38,
            height: 38,
            padding: 0,
            borderRadius: "99px",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
        {/* The scroller. The close button sits outside it, absolutely placed
            against the panel, so it stays pinned while the content moves —
            a close control that scrolls away is a trap on a long asset. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
