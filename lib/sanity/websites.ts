import "server-only";
import { groq } from "next-sanity";
import { sanity } from "./client";
import type { Website } from "@/lib/kl/types";

/**
 * Every read the Websites section makes.
 *
 * The card projection carries the sizes of the code, the design system and the
 * ZIP — never the bodies or the file URL. Those leave Sanity only through
 * getWebsiteDeliverable, which only the gated API routes call.
 *
 * `website` is a newer document type, so it is invisible to anonymous reads on
 * this dataset; the client's server token is what makes it load at all.
 */
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
  "codeLength": length(coalesce(codeMarkdown, "")),
  "designLength": length(coalesce(designMarkdown, "")),
  "zipBytes": zip.asset->size
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

/** The gated bodies and file. API routes only — callers must check entitlement. */
export async function getWebsiteDeliverable(
  slug: string
): Promise<{ code: string; design: string; zipUrl: string | null; zipBytes: number | null } | null> {
  const r = await ask<{ code?: string; design?: string; zipUrl?: string; zipBytes?: number } | null>(
    null,
    groq`*[${LISTED} && slug.current == $slug][0]{
      "code": codeMarkdown, "design": designMarkdown, "zipUrl": zip.asset->url, "zipBytes": zip.asset->size
    }`,
    { slug },
    { next: { tags: [`website:${slug}`] } }
  );
  if (!r) return null;
  return { code: r.code ?? "", design: r.design ?? "", zipUrl: r.zipUrl ?? null, zipBytes: r.zipBytes ?? null };
}
