/**
 * Where preview media comes from, and how it is sized.
 *
 * Sanity stores a *path* ("volumetric-drift/card.webp") for the seeded assets,
 * and a full cdn.sanity.io URL for anything uploaded through the Studio. Both
 * end up on the same host here, because the CMS is not a CDN: previews are the
 * marketing, they are served on every visit, and R2 charges nothing for egress
 * at any volume. A metered asset CDN bills popularity against the same budget
 * as the library itself, which is the wrong shape for a gallery.
 *
 * The rewrite is:
 *
 *   cdn.sanity.io/files/<pid>/<ds>/<file>  ->  <MEDIA_BASE>/sanity/<file>
 *
 * and a Worker on that host fills R2 from Sanity the first time anyone asks for
 * a file (workers/media/). Sanity asset filenames are content-hashed, so the
 * key can never go stale and the object can honestly be cached immutable.
 *
 * Nothing serves the original. Every URL goes through /cdn-cgi/, so a visitor
 * gets a right-sized file no matter what was uploaded — crispness comes from
 * asking for 2x the rendered column, not from shipping the source.
 *
 * All of it is behind NEXT_PUBLIC_MEDIA_MIRROR. Off, this file behaves exactly
 * as it did before: resolve a path against the base, pass absolute URLs
 * through. That is deliberate — the rewrite depends on a custom domain and zone
 * Transformations being live, and a half-configured host should degrade to the
 * old behaviour rather than to broken images.
 */

const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "/preview").replace(/\/+$/, "");

/** Only rewrite when asked to, and only when the base can carry a full URL. */
const MIRROR = process.env.NEXT_PUBLIC_MEDIA_MIRROR === "1" && /^https?:\/\//i.test(BASE);

/** 2x the measured masonry column (369px at a 1680px viewport) and 2x the item panel. */
export const CARD_W = 740;
export const ITEM_W = 1400;

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  const p = path.trim();
  if (!p) return undefined;
  if (/^(https?:)?\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;
  /* Idempotent. PreviewMedia resolves its own props, so a URL built by img() or
     frame() passes through here a second time; without this a relative base
     ("/preview" in local dev) would prefix itself and produce
     /preview/preview/<slug>/card.webp. */
  if (p.startsWith(`${BASE}/`)) return p;
  return `${BASE}/${p.replace(/^\/+/, "")}`;
}

/**
 * Sanity's asset CDN -> our own host. Everything else is left alone: a data:
 * URI, a one-off CDN link, or a path already resolved against the base.
 */
export function toMediaHost(url?: string | null): string | undefined {
  const u = mediaUrl(url);
  if (!u || !MIRROR) return u;
  const m = u.match(/^https?:\/\/cdn\.sanity\.io\/(?:images|files)\/[^/]+\/[^/]+\/(.+)$/i);
  return m ? `${BASE}/sanity/${m[1]}` : u;
}

/* The transform prefix only works on a host that is proxied by Cloudflare with
   Transformations enabled, which is why these no-op when MIRROR is off rather
   than emitting a /cdn-cgi/ path that would 404. */
const cdnCgi = (kind: "image" | "media", opts: string, src?: string) =>
  !src || !MIRROR ? src : `${BASE}/cdn-cgi/${kind}/${opts}/${src}`;

/** A still, resized and re-encoded to whatever the browser accepts. */
export const img = (src?: string | null, w = CARD_W) =>
  cdnCgi("image", `width=${w},quality=85,format=auto`, toMediaHost(src));

/** A grid loop: no audio, capped length, sized to the column. */
export const clip = (src?: string | null, w = CARD_W, seconds = 6) =>
  cdnCgi("media", `mode=video,width=${w},duration=${seconds}s,audio=false`, toMediaHost(src));

/**
 * A poster generated from the video itself. This is what makes a video-only
 * asset behave like any other card: Sanity records no dimensions for a file, so
 * without a frame the tile is blank at a default height until the bytes land.
 *
 * A raw MP4 is not an image. When Media Transformations are disabled there is
 * no service available to extract a frame, so returning the clip URL here
 * creates a broken <img>. In that state the caller must use its painted ground
 * until the real <video> attaches instead.
 */
export const frame = (src?: string | null, w = CARD_W) =>
  !MIRROR ? undefined : cdnCgi("media", `mode=frame,time=0s,width=${w}`, toMediaHost(src));

/** The convention the dummy generator and the upload script both follow. */
export const posterPath = (slug: string, shot = "card") => `${slug}/${shot}.webp`;
export const clipPath = (slug: string, shot = "card") => `${slug}/${shot}.mp4`;
