"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import ItemView from "./ItemView";
import { Shimmer } from "./Skeleton";
import type { Asset, Viewer } from "@/lib/kl/types";

type Gate = "open" | "needs-account" | "needs-unlimited";

type Detail = {
  asset: Asset;
  viewer: Viewer | null;
  gate: Gate;
  promptGate: Gate;
  saved: boolean;
  monthlyPrice: number;
};

/**
 * Opens an asset over whatever page you are on, without going anywhere.
 *
 * This replaces an intercepting route. That approach rendered a dialog but was
 * still a navigation underneath, so the address bar changed to /item/<slug> and
 * a refresh landed on the full page — which is a new page by every signal a
 * visitor can actually see. The popup is plain state now and the URL never
 * moves.
 *
 * One listener on the document rather than a handler per card. Cards appear on
 * the library, /light, a collection, the design system page and in the related
 * grid; delegation covers all of them and leaves AssetCard untouched.
 */
export default function AssetModal() {
  const [slug, setSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);
  const pathname = usePathname();

  /* Focus goes back to the card that opened it, not to <body>. */
  const clear = useCallback(() => {
    setSlug(null);
    setDetail(null);
    setFailed(false);
    trigger.current?.focus?.();
    trigger.current = null;
  }, []);

  /**
   * Closing consumes the history entry we added, which fires popstate, which
   * clears the state. Going through history rather than clearing directly
   * keeps one path for both ways of dismissing — the close button and the
   * hardware back button end up in the same place.
   */
  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      history.back();
      return;
    }
    clear();
  }, [clear]);

  useEffect(() => {
    const onClick = (evt: MouseEvent) => {
      /* These guards are lifted from KilnMotion, where they were arrived at
         from real bugs rather than guessed: a modified click must still open a
         tab, and a control nested inside the card link owns its own click —
         without that last one the copy button opens the popup instead of
         copying. */
      if (
        evt.defaultPrevented ||
        evt.metaKey ||
        evt.ctrlKey ||
        evt.shiftKey ||
        evt.altKey ||
        evt.button !== 0
      ) {
        return;
      }
      const target = evt.target as HTMLElement | null;
      if (target?.closest("button, input, select, textarea, [role='button']")) return;

      const card = target?.closest<HTMLAnchorElement>("a[data-card]");
      if (!card) return;
      if (card.target && card.target !== "_self") return;
      if (card.hasAttribute("download")) return;

      const href = card.getAttribute("href") ?? "";
      const match = href.match(/^\/item\/([^/?#]+)/);
      if (!match) return;

      evt.preventDefault();
      evt.stopPropagation();

      trigger.current = card;
      setSlug(decodeURIComponent(match[1]));

      /* Same URL, new history entry. The address bar does not move, and back
         still dismisses the popup — which is the one thing worth keeping from
         the route-based version, and matters most on a phone where back is how
         people close things. */
      history.pushState({ kilnModal: true }, "", location.href);
      pushed.current = true;
    };

    const onPop = () => {
      pushed.current = false;
      clear();
    };

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPop);
    };
  }, [clear]);

  /* A link inside the popup that goes somewhere — sign in, pricing — should
     leave the popup behind rather than stranding it over a new page. */
  useEffect(() => {
    if (slug) {
      pushed.current = false;
      clear();
    }
    /* Only on a real route change; `slug` is deliberately not a dependency. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!slug) return;
    let live = true;
    setFailed(false);
    (async () => {
      try {
        const res = await fetch(`/api/asset/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!live) return;
        if (res.ok && json.ok) setDetail(json);
        else setFailed(true);
      } catch {
        if (live) setFailed(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [slug]);

  if (!slug) return null;

  return (
    <Modal label={detail?.asset.name ?? "Asset"} onClose={close}>
      {detail ? (
        <>
          <ItemView
            asset={detail.asset}
            related={[]}
            viewer={detail.viewer}
            gate={detail.gate}
            promptGate={detail.promptGate}
            saved={detail.saved}
            monthlyPrice={detail.monthlyPrice}
            /* No second Nav, no breadcrumb, no Footer inside a dialog — and the
               prompt moves to the top, since reading it is the reason to open a
               popup rather than a page. */
            chrome={false}
          />
          {/* The URL no longer changes, so a visitor who wants a link to this
              asset has no way to get one from the address bar. This is it. */}
          <div className="shell" style={{ paddingBottom: 26 }}>
            <Link
              href={`/item/${detail.asset.slug}`}
              className="mono"
              style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}
            >
              OPEN THE FULL PAGE →
            </Link>
          </div>
        </>
      ) : failed ? (
        <div className="shell" style={{ paddingBlock: 60, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 16, color: "var(--muted)" }}>That did not load.</p>
          <Link data-nav href={`/item/${slug}`} className="btn btn--ghost" style={{ alignSelf: "flex-start" }}>
            Open the full page instead
          </Link>
        </div>
      ) : (
        <div
          className="shell"
          aria-busy="true"
          style={{ paddingBlock: 40, display: "flex", flexDirection: "column", gap: 18 }}
        >
          <p role="status" aria-live="polite" className="visually-hidden">
            Loading this asset
          </p>
          <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Shimmer h={34} w="52%" />
            <Shimmer h={300} r={16} />
            <Shimmer h={16} w="86%" />
            <Shimmer h={16} w="64%" />
          </div>
        </div>
      )}
    </Modal>
  );
}
