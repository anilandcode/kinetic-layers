"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/kl/media";

/**
 * Every preview on the site is drawn here, and nowhere else.
 *
 * Three layers, cheapest first:
 *
 *   1. the gradient, painted by CSS with no request at all, so a card is never
 *      blank and never reflows;
 *   2. the poster, a lazy WebP still;
 *   3. the clip, which has NO src attribute until someone reaches for it.
 *
 * That third point is the whole design. A grid of 24 cards with real <video
 * src> would pull tens of megabytes before the visitor has decided to care —
 * the reference sites both avoid it, and one of them ships a 468 KB homepage
 * as a result. Here the bytes follow intent.
 *
 * The clip is never attached when the visitor asked for reduced motion, and
 * never on a coarse pointer, where "hover" does not exist and the tap belongs
 * to the link. Phones therefore pull zero video from the grid; they see motion
 * on the item page, where `play="auto"` loads exactly one file on purpose.
 */

type Props = {
  gradient: string;
  poster?: string;
  clip?: string;
  /** Describes the asset, not the file — this is the accessible name. */
  alt: string;
  /** "hover" waits for intent. "auto" plays when scrolled into view. */
  play?: "hover" | "auto";
  /** Skips lazy loading for the one image that is above the fold. */
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: React.ReactNode;
};

export default function PreviewMedia({
  gradient,
  poster,
  clip,
  alt,
  play = "hover",
  priority = false,
  className,
  style,
  id,
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  const posterUrl = mediaUrl(poster);
  const clipUrl = mediaUrl(clip);

  /* Decided on the client, so the first render matches the server exactly and
     the video is an enhancement rather than a hydration mismatch. */
  useEffect(() => {
    if (!clipUrl) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
    const decide = () => setEnabled(!calm.matches && (play === "auto" || hoverable.matches));
    decide();
    calm.addEventListener("change", decide);
    hoverable.addEventListener("change", decide);
    return () => {
      calm.removeEventListener("change", decide);
      hoverable.removeEventListener("change", decide);
    };
  }, [clipUrl, play]);

  const attach = useCallback(() => {
    const v = videoRef.current;
    if (!v || !clipUrl) return;
    if (!v.src) v.src = clipUrl;
    /* play() rejects if the element is torn down mid-load, or if autoplay is
       refused. Neither is worth surfacing — the poster is already correct. */
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, [clipUrl]);

  const detach = useCallback(() => {
    const v = videoRef.current;
    setPlaying(false);
    if (!v) return;
    v.pause();
    /* Dropping the source frees the decoded buffer. Without this, scrolling a
       long grid leaves every clip you brushed past resident in memory. */
    v.removeAttribute("src");
    v.load();
  }, []);

  /* Hover mode also listens on the enclosing link, so a keyboard user tabbing
     onto the card gets the same preview a mouse user gets. */
  useEffect(() => {
    if (!enabled || play !== "hover") return;
    const root = rootRef.current;
    if (!root) return;
    const target: HTMLElement = root.closest("a") ?? root;
    target.addEventListener("pointerenter", attach);
    target.addEventListener("focusin", attach);
    target.addEventListener("pointerleave", detach);
    target.addEventListener("focusout", detach);
    return () => {
      target.removeEventListener("pointerenter", attach);
      target.removeEventListener("focusin", attach);
      target.removeEventListener("pointerleave", detach);
      target.removeEventListener("focusout", detach);
      detach();
    };
  }, [enabled, play, attach, detach]);

  useEffect(() => {
    if (!enabled || play !== "auto") return;
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attach() : detach()),
      { rootMargin: "200px" }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      detach();
    };
  }, [enabled, play, attach, detach]);

  return (
    <div ref={rootRef} id={id} className={`kiln-media ${className ?? ""}`} style={{ background: gradient, ...style }}>
      {posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- media is pre-baked; see lib/kiln/media.ts
        <img
          className="kiln-media__img"
          src={posterUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
        />
      )}
      {enabled && clipUrl && (
        <video
          ref={videoRef}
          className="kiln-media__video"
          data-playing={playing}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
