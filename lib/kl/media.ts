/**
 * Where preview media comes from.
 *
 * Sanity stores a *path* ("volumetric-drift/card.webp"), never a full URL, so
 * the host is a deployment concern rather than a content one. Locally that
 * resolves against /preview in the public folder; in production it resolves
 * against the R2 bucket. Moving hosts is one environment variable.
 *
 * Why R2 and not a media SaaS: the previews are the marketing, so they get
 * served on every visit, and R2 charges nothing for egress at any volume.
 * A credit-pooled free tier bills popularity against the same budget as the
 * library itself, which is the wrong shape for a gallery.
 *
 * Absolute URLs pass through untouched — that keeps a one-off CDN link, or a
 * Sanity asset URL, working without a special case.
 */

const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "/preview").replace(/\/+$/, "");

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  const p = path.trim();
  if (!p) return undefined;
  if (/^(https?:)?\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;
  return `${BASE}/${p.replace(/^\/+/, "")}`;
}

/** The convention the dummy generator and the upload script both follow. */
export const posterPath = (slug: string, shot = "card") => `${slug}/${shot}.webp`;
export const clipPath = (slug: string, shot = "card") => `${slug}/${shot}.mp4`;
