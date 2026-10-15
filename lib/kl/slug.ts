/**
 * The one slug rule, shared by the app, the Studio schema and the tools —
 * which is why this file imports nothing (no `@/` alias, no server-only).
 *
 * A slug typed by hand with a space ("Nevoro Studio") reached the item page
 * still percent-encoded, matched nothing and 404'd. Canonical slugs are
 * lowercase letters, digits and single hyphens; the Studio refuses anything
 * else, and the routes redirect an old non-canonical link to its canonical one.
 */

const MAX = 96;

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX)
    .replace(/-+$/, "");
}

export function isCanonicalSlug(slug: string): boolean {
  return slug.length > 0 && toSlug(slug) === slug;
}

/** A route param as the author wrote it. Next 15.5 passes it still encoded. */
export function decodeParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

export const itemHref = (slug: string) => `/item/${encodeURIComponent(slug)}`;
export const websiteHref = (slug: string) => `/websites/${encodeURIComponent(slug)}`;
