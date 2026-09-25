"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Icon from "./Icon";
import s from "./KitDialog.module.css";

/* The spec's one shared curve (DESIGN-REBUILD-SPEC.md §10). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The quick view: /item/[slug] intercepted over whatever page opened it.
 *
 * The behaviour is components/kl/ItemModal's, which was right: focus moves to
 * the close button, Tab stays inside, Escape and the veil go back, the page
 * behind does not scroll, and focus returns to the card that opened it even
 * though that card was re-rendered by the navigation. Travel is at most 8px;
 * under reduced motion there is only the fade.
 */
export default function KitDialog({ name, children }: { name: string; children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);
  const reduced = useReducedMotion();
  const offset = reduced ? {} : { y: 8 };

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimerRef.current = setTimeout(() => router.back(), reducedMotion ? 0 : 200);
  }, [router]);

  useEffect(() => {
    const active = document.activeElement;
    const itemPath = window.location.pathname;
    const opener = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
      (link) => link.pathname === itemPath && !dialogRef.current?.contains(link)
    );
    const previousFocus =
      opener ??
      (active instanceof HTMLElement && active.matches(FOCUSABLE) && !dialogRef.current?.contains(active) ? active : null);
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
      const candidates = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0
      );
      if (!candidates.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !dialog.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !dialog.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) closeButtonRef.current?.focus();
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
        const returnedCard = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
          (link) => link.pathname === itemPath && !dialogRef.current?.contains(link)
        );
        const target = returnedCard ?? (previousFocus?.isConnected ? previousFocus : null);
        if (target && window.location.pathname !== itemPath) target.focus({ preventScroll: true });
        else if (++attempts < 20) requestAnimationFrame(restoreFocus);
      };
      requestAnimationFrame(restoreFocus);
    };
  }, [close]);

  return (
    <div data-v2 data-look="cinematic" className={s.layer}>
      <motion.div
        className={s.veil}
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.16 : 0.22, ease: EASE }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <motion.div
          ref={dialogRef}
          className={s.panel}
          role="dialog"
          aria-modal="true"
          aria-label={name}
          tabIndex={-1}
          initial={{ opacity: 0, ...offset }}
          animate={closing ? { opacity: 0, ...offset } : { opacity: 1, y: 0 }}
          transition={{ duration: closing ? 0.16 : 0.22, ease: EASE }}
        >
          <button ref={closeButtonRef} type="button" className={s.close} onClick={close} aria-label={`Close ${name}`}>
            <Icon name="close" size={16} />
          </button>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
