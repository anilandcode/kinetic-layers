"use client";

import { useEffect, useRef } from "react";
import { isAnimatedImage } from "@/lib/v2/kit";

/**
 * An animated image (GIF, animated WebP) drawn as its first frame.
 *
 * An animated image in an <img> decodes and repaints on every frame for as
 * long as it is on screen — a grid of them kept the GPU busy and made the
 * page lag while scrolling. Here the image is loaded off the page, where it
 * does not animate, and its first frame is painted once into a canvas that
 * behaves like `object-fit` (cover, anchored top, or contain). Loading waits
 * until the canvas nears the viewport, as `loading="lazy"` would.
 *
 * Drawing a cross-origin image taints the canvas, which only matters if the
 * pixels are read back; they never are.
 */
export default function FirstFrame({
  src,
  alt,
  fit = "cover",
  eager = false,
  className,
}: {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  eager?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const img = new Image();
    img.decoding = "async";

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h || !img.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      if (fit === "cover") {
        const k = Math.max(cw / iw, ch / ih);
        const sw = cw / k;
        const sh = ch / k;
        ctx.drawImage(img, (iw - sw) / 2, 0, sw, sh, 0, 0, cw, ch);
      } else {
        const k = Math.min(cw / iw, ch / ih);
        const dw = iw * k;
        const dh = ih * k;
        ctx.drawImage(img, 0, 0, iw, ih, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      }
    };

    img.onload = draw;
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);

    let io: IntersectionObserver | null = null;
    const load = () => {
      if (!img.src) img.src = src;
    };
    if (eager) load();
    else {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            load();
            io?.disconnect();
          }
        },
        { rootMargin: "400px" }
      );
      io.observe(canvas);
    }

    return () => {
      ro.disconnect();
      io?.disconnect();
      img.onload = null;
    };
  }, [src, fit, eager]);

  return <canvas ref={ref} className={className} role="img" aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />;
}

/**
 * A still for a thumbnail: a plain <img> for a still image, the first frame
 * of an animated one.
 */
export function StillImage({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  if (isAnimatedImage(src)) return <FirstFrame src={src} alt={alt} className={className} />;
  // eslint-disable-next-line @next/next/no-img-element -- sized by lib/kl/media.ts, not next/image
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />;
}
