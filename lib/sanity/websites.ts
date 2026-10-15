import "server-only";
import { groq } from "next-sanity";
import { sanity } from "./client";
import type { Website } from "@/lib/kl/types";
import { PAID_PREFIX, type PaidZip } from "@/lib/kl/paid";

/**
 * Every read the Websites section makes.
 *
 * The deliverables are not on the website document: the code, the design
 * system and the ZIP's storage key live in its private `paid.<id>` document
 * (lib/kl/paid.ts), which the public API cannot read. The card projection
 * carries only their sizes; the bodies and the key leave Sanity through
 * getWebsiteDeliverable, which only the gated API routes call.
 */
const PAID = `*[_id == "${PAID_PREFIX}" + ^._id][0]`;

const CARD = groq`{
  "slug": slug.current,
  name,
  category,
  "free": tier == "Free",
  tagline,
  liveUrl,
  "screenshot": screenshot.asset->url,
  "width": screenshot.asset->metadata.dimensions.width,
  "height": screenshot.asset->metadata.dimensions.height,
  "palette": screenshot.asset->metadata.palette{
    "dominant": dominant.background, "vibrant": vibrant.background, "muted": muted.background,
    "darkMuted": darkMuted.background, "lightVibrant": lightVibrant.background
  },
  colors,
  "tags": coalesce(tags[defined(@->title)]->title, []),
  "featured": coalesce(featured, false),
  publishedAt,
  "codeLength": length(coalesce(${PAID}.code, "")),
  "designLength": length(coalesce(${PAID}.design, "")),
  "zipBytes": ${PAID}.zip.bytes
}`;

const LISTED = groq`_type == "website" && defined(slug.current) && defined(screenshot.asset)`;

const opts = (tags: string[]) => ({ next: { tags, revalidate: 3600 } });

async function ask<T>(fallback: T, query: string, params: Record<string, unknown> = {}, options = {}): Promise<T> {
  if (!sanity) return fallback;
  return sanity.fetch<T>(query, params, options);
}

const tidy = (w: Website): Website => ({ ...w, tags: w.tags ?? [], codeLength: w.codeLength ?? 0, designLength: w.designLength ?? 0 });

export async function getWebsites(): Promise<Website[]> {
  const rows = await ask<Website[]>(
    [],
    groq`*[${LISTED}] | order(featured desc, publishedAt desc) ${CARD}`,
    {},
    opts(["website"])
  );
  return rows.map(tidy);
}

export async function getWebsite(slug: string): Promise<Website | null> {
  const row = await ask<Website | null>(
    null,
    groq`*[${LISTED} && slug.current == $slug][0] ${CARD}`,
    { slug },
    opts(["website", `website:${slug}`])
  );
  return row ? tidy(row) : null;
}

export async function getWebsiteSlugs(): Promise<string[]> {
  return ask<string[]>([], groq`*[${LISTED}].slug.current`, {}, opts(["website"]));
}

/**
 * More like this: the same category first, then a shared tag, then the newest —
 * one round trip, the choice made here.
 */
export async function getWebsiteRelated(site: Website, limit = 4): Promise<Website[]> {
  const r = await ask<{ category: Website[]; tag: Website[]; newest: Website[] } | null>(
    null,
    groq`{
      "category": *[${LISTED} && slug.current != $slug && category == $category] | order(publishedAt desc) [0...$limit] ${CARD},
      "tag": *[${LISTED} && slug.current != $slug && count((tags[]->title)[@ in $tags]) > 0] | order(publishedAt desc) [0...$limit] ${CARD},
      "newest": *[${LISTED} && slug.current != $slug] | order(publishedAt desc) [0...$limit] ${CARD}
    }`,
    { slug: site.slug, category: site.category, tags: site.tags, limit },
    opts(["website"])
  );
  if (!r) return [];
  const seen = new Set<string>();
  const out: Website[] = [];
  for (const w of [...r.category, ...r.tag, ...r.newest]) {
    if (seen.has(w.slug)) continue;
    seen.add(w.slug);
    out.push(tidy(w));
    if (out.length === limit) break;
  }
  return out;
}

export type WebsiteKind = "code" | "design";

/** The gated bodies and the ZIP's storage key. API routes only — callers must check entitlement. */
export async function getWebsiteDeliverable(
  slug: string
): Promise<{ code: string; design: string; zip: PaidZip | null } | null> {
  const r = await ask<{ code?: string; design?: string; zip?: PaidZip } | null>(
    null,
    groq`*[${LISTED} && slug.current == $slug][0]{ "code": ${PAID}.code, "design": ${PAID}.design, "zip": ${PAID}.zip }`,
    { slug },
    /* "website" too: an edit to the paid document revalidates by type, since it
       carries no slug of its own (app/api/revalidate/route.ts). */
    { next: { tags: ["website", `website:${slug}`] } }
  );
  if (!r) return null;
  return { code: r.code ?? "", design: r.design ?? "", zip: r.zip?.storagePath ? r.zip : null };
}
