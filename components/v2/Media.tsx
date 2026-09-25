"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/kl/media";
import { isAnimatedImage } from "@/lib/v2/kit";
import FirstFrame from "./FirstFrame";
import s from "./Media.module.css";

/**
 * A kit's preview: still first, clip on intent.
 *
 * The behaviour is components/legacy/PreviewMedia's, unchanged, because it is
 * right: the clip has no src until someone reaches for it, it never attaches
 * under reduced motion or on a coarse pointer in the grid, and it frees its
 * buffer when it leaves. Only the styling is v2's.
 *
 *   play="hover"  the grid — attaches on pointer or keyboard focus of the card
 *   play="auto"   a kit page or dialog — attaches when scrolled into view
 *
 * An animated still (the preview samples' GIFs) is treated the same way: its
 * first frame is the still, and the animation is the "clip", mounted on
 * intent and removed after — an animating <img> repaints every frame.
 */
export default function Media({
  still,
  clip,
  alt,
  play = "hover",
  priority = false,
  fit = "cover",
  className,
}: {
  still?: string;
  clip?: string;
  /** Describes the kit, not the file. Empty when a caption already names it. */
  alt: string;
  play?: "hover" | "auto";
  priority?: boolean;
  fit?: "cover" | "contain";
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  const stillUrl = mediaUrl(still);
  const animated = isAnimatedImage(stillUrl);
  const clipUrl = mediaUrl(clip);
  /* What plays on intent: the video clip, or the animated still itself. */
  const motionUrl = clipUrl ?? (animated ? stillUrl : undefined);

  useEffect(() => {
    if (!motionUrl) return;
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
  }, [motionUrl, play]);

  const attach = useCallback(() => {
    if (!clipUrl) {
      setPlaying(true);
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (!v.src) v.src = clipUrl;
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, [clipUrl]);

  const detach = useCallback(() => {
    const v = videoRef.current;
    setPlaying(false);
    if (!v) return;
    v.pause();
    v.removeAttribute("src");
    v.load();
  }, []);

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
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? attach() : detach()), {
      rootMargin: "200px",
    });
    io.observe(root);
    return () => {
      io.disconnect();
      detach();
    };
  }, [enabled, play, attach, detach]);

  return (
    <div ref={rootRef} className={`${s.media} ${fit === "contain" ? s.contain : ""} ${className ?? ""}`}>
      {stillUrl && animated ? (
        <FirstFrame src={stillUrl} alt={alt} fit={fit} eager={priority} className={s.still} />
      ) : stillUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- sized by lib/kl/media.ts, not next/image
        <img
          className={s.still}
          src={stillUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          draggable={false}
        />
      ) : null}
      {enabled && !clipUrl && animated && playing && stillUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- the animated still, only while wanted
        <img className={s.clip} data-playing="true" src={stillUrl} alt="" aria-hidden="true" draggable={false} />
      ) : null}
      {enabled && clipUrl ? (
        <video
          ref={videoRef}
          className={s.clip}
          data-playing={playing}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
