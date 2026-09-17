"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The intercept keeps ItemView and its gate; a direct visit keeps the full page. */
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimerRef.current = setTimeout(() => router.back(), reducedMotion ? 0 : 220);
  }, [router]);

  useEffect(() => {
    // Next may move focus to its route wrapper before the dialog mounts.
    // Retain the originating gallery link when that happens.
    const active = document.activeElement;
    const itemPath = window.location.pathname;
    const opener = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .find(link => link.pathname === itemPath && !dialogRef.current?.contains(link));
    const previousFocus = opener ?? (active instanceof HTMLElement && active.matches(FOCUSABLE) && !dialogRef.current?.contains(active)
      ? active
      : null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const candidates = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((element) => element.getClientRects().length > 0);
      if (!candidates.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      document.body.style.overflow = previousOverflow;
      let attempts = 0;
      const restoreFocus = () => {
        const returnedCard = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
          .find(link => link.pathname === itemPath && !dialogRef.current?.contains(link));
        const target = returnedCard ?? (previousFocus?.isConnected ? previousFocus : null);
        if (target && window.location.pathname !== itemPath) {
          target.focus({ preventScroll: true });
        } else if (++attempts < 20) {
          requestAnimationFrame(restoreFocus);
        }
      };
      requestAnimationFrame(restoreFocus);
    };
  }, [close]);

  return (
    <div data-kl className="bench-item-overlay" data-closing={closing}>
      <motion.div
        className="kl-modal-veil"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.16 : 0.22, ease: "easeOut" }}
        onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}>
        <motion.div
          ref={dialogRef}
          className="kl-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-label={name}
          tabIndex={-1}
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={closing ? { opacity: 0, y: 16, scale: 0.985 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 330, damping: 30, mass: 0.72 }}
        >
          {children}
          <div className="bench-item-head">
            <span className="bench-item-shelf">{shelf}</span>
            <button
              ref={closeButtonRef}
              type="button"
              className="kl-close bench-item-close"
              onClick={close}
              aria-label={`Close ${name}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
